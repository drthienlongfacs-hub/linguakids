import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import process from 'node:process';

const execFileAsync = promisify(execFile);

const repoRoot = new URL('..', import.meta.url).pathname;
const defaultPrivateKeyPath = path.join(os.homedir(), '.linguakids-premium', 'premium-private-key.pem');

const fileChecks = [
    path.join(repoRoot, 'src', 'services', 'premiumService.js'),
    path.join(repoRoot, 'src', 'shared', 'premiumTokenSchema.js'),
    path.join(repoRoot, 'src', 'pages', 'PremiumUpgrade.jsx'),
    path.join(repoRoot, 'src', 'components', 'PremiumGate.jsx'),
    path.join(repoRoot, 'scripts', 'generate-premium-token.js'),
    path.join(repoRoot, 'docs', 'premium-security-position-paper.md'),
];

const disallowedPatterns = [
    { pattern: /-----BEGIN PRIVATE KEY-----/, message: 'Private key material must not be committed.' },
    { pattern: /generatePremiumCode\s*\(/, message: 'Client-side premium code generator must not exist.' },
    { pattern: /100%\s*secure/i, message: 'Premium UX must not claim impossible security.' },
];

async function main() {
    const findings = [];
    const runtimeChecks = [];

    for (const filePath of fileChecks) {
        try {
            const contents = await fs.readFile(filePath, 'utf8');
            for (const rule of disallowedPatterns) {
                if (
                    path.basename(filePath) === 'generate-premium-token.js'
                    && rule.message === 'Private key material must not be committed.'
                ) {
                    continue;
                }
                if (rule.pattern.test(contents)) {
                    findings.push({
                        file: path.relative(repoRoot, filePath),
                        message: rule.message,
                    });
                }
            }
        } catch (error) {
            findings.push({
                file: path.relative(repoRoot, filePath),
                message: `Required file missing: ${error.code || error.message}`,
            });
        }
    }

    const premiumService = await fs.readFile(path.join(repoRoot, 'src', 'services', 'premiumService.js'), 'utf8');
    const premiumUpgrade = await fs.readFile(path.join(repoRoot, 'src', 'pages', 'PremiumUpgrade.jsx'), 'utf8');
    const generator = await fs.readFile(path.join(repoRoot, 'scripts', 'generate-premium-token.js'), 'utf8');
    const schema = await fs.readFile(path.join(repoRoot, 'src', 'shared', 'premiumTokenSchema.js'), 'utf8');

    if (!premiumService.includes('crypto.subtle.verify')) {
        findings.push({
            file: 'src/services/premiumService.js',
            message: 'Signed token verification not detected.',
        });
    }

    if (!generator.includes('LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE')) {
        findings.push({
            file: 'scripts/generate-premium-token.js',
            message: 'Offline generator must load private key from outside the repo.',
        });
    }

    if (!premiumService.includes("../shared/premiumTokenSchema") || !generator.includes('../src/shared/premiumTokenSchema.js')) {
        findings.push({
            file: 'premium token stack',
            message: 'Client verifier and offline generator must share the same token schema source.',
        });
    }

    if (!schema.includes('PREMIUM_TOKEN_PREFIX') || !schema.includes('PREMIUM_PUBLIC_JWK')) {
        findings.push({
            file: 'src/shared/premiumTokenSchema.js',
            message: 'Shared token schema is incomplete.',
        });
    }

    if (/buy\.stripe\.com|ZaloPay|Momo/i.test(premiumUpgrade)) {
        findings.push({
            file: 'src/pages/PremiumUpgrade.jsx',
            message: 'PremiumUpgrade contains store-risk payment steering language.',
        });
    }

    const privateKeyPath = process.env.LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE || defaultPrivateKeyPath;
    try {
        await fs.access(privateKeyPath);
    } catch {
        runtimeChecks.push({
            name: 'signed_token_roundtrip',
            pass: null,
            skipped: true,
            reason: 'private_key_not_available',
        });
    }

    if (runtimeChecks.length === 0) {
        try {
            const { stdout } = await execFileAsync('node', [path.join(repoRoot, 'scripts', 'generate-premium-token.js'), '1']);
            const tokenMatch = stdout.match(/LK1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
            if (!tokenMatch) {
                findings.push({
                    file: 'scripts/generate-premium-token.js',
                    message: 'Could not extract a signed token from generator output.',
                });
            } else {
                globalThis.localStorage = {
                    store: {},
                    getItem(key) {
                        return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
                    },
                    setItem(key, value) {
                        this.store[key] = String(value);
                    },
                    removeItem(key) {
                        delete this.store[key];
                    },
                };
                const premiumModule = await import(pathToFileURL(path.join(repoRoot, 'src', 'services', 'premiumService.js')).href);
                const result = await premiumModule.unlockPremium(tokenMatch[0]);
                runtimeChecks.push({
                    name: 'signed_token_roundtrip',
                    tokenPrefix: tokenMatch[0].slice(0, 12),
                    pass: !!result.success,
                    message: result.message,
                });
                if (!result.success) {
                    findings.push({
                        file: 'premium runtime',
                        message: 'Signed token round-trip test failed.',
                    });
                }
            }
        } catch (error) {
            findings.push({
                file: 'premium runtime',
                message: `Signed token round-trip threw: ${error.message || error}`,
            });
            runtimeChecks.push({
                name: 'signed_token_roundtrip',
                pass: false,
                error: error.message || String(error),
            });
        }
    }

    const summary = {
        checks: fileChecks.length,
        findings: findings.length,
        pass: findings.length === 0,
    };

    console.log(JSON.stringify({ summary, runtimeChecks, findings }, null, 2));

    if (findings.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
