import fs from 'node:fs/promises';
import path from 'node:path';

const repoRoot = new URL('..', import.meta.url).pathname;

const fileChecks = [
    path.join(repoRoot, 'src', 'services', 'premiumService.js'),
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

    if (/buy\.stripe\.com|ZaloPay|Momo/i.test(premiumUpgrade)) {
        findings.push({
            file: 'src/pages/PremiumUpgrade.jsx',
            message: 'PremiumUpgrade contains store-risk payment steering language.',
        });
    }

    const summary = {
        checks: fileChecks.length,
        findings: findings.length,
        pass: findings.length === 0,
    };

    console.log(JSON.stringify({ summary, findings }, null, 2));

    if (findings.length > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
