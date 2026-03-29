import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawn, execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);
const repoRoot = new URL('..', import.meta.url).pathname;
const defaultPrivateKeyPath = path.join(os.homedir(), '.linguakids-premium', 'premium-private-key.pem');

const fileChecks = [
    'public/runtime-config.json',
    'server/entitlement-api.mjs',
    'src/hooks/usePremiumStatus.js',
    'src/main.jsx',
    'src/pages/PremiumUpgrade.jsx',
    'src/services/entitlementApiClient.js',
    'src/services/premiumService.js',
    'src/services/runtimeConfigService.js',
    'docs/entitlement-service-architecture.md',
];

const requiredPatterns = [
    { file: 'src/main.jsx', pattern: /bootstrapPremiumEntitlementSync\s*\(/, message: 'App bootstrap must invoke premium entitlement sync.' },
    { file: 'src/services/premiumService.js', pattern: /activateRemoteEntitlement/, message: 'premiumService must integrate remote entitlement activation.' },
    { file: 'src/services/premiumService.js', pattern: /PREMIUM_STATE_CHANGED_EVENT/, message: 'premiumService must emit a shared state-change event.' },
    { file: 'src/pages/PremiumUpgrade.jsx', pattern: /Server-backed entitlement|soft paywall/i, message: 'PremiumUpgrade must disclose operational entitlement mode.' },
    { file: 'src/hooks/usePremiumStatus.js', pattern: /syncPremiumEntitlement/, message: 'usePremiumStatus hook must support live entitlement sync.' },
    { file: 'server/entitlement-api.mjs', pattern: /\/v1\/activate/, message: 'Entitlement API must expose /v1/activate.' },
    { file: 'server/entitlement-api.mjs', pattern: /\/v1\/entitlements\/resolve/, message: 'Entitlement API must expose /v1/entitlements/resolve.' },
];

async function readRelative(file) {
    return fs.readFile(path.join(repoRoot, file), 'utf8');
}

async function requestJson(url, options = {}) {
    const response = await fetch(url, options);
    const body = await response.json().catch(() => ({}));
    return {
        ok: response.ok,
        status: response.status,
        body,
    };
}

function createStorage() {
    const store = {};
    return {
        getItem(key) {
            return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
        },
        setItem(key, value) {
            store[key] = String(value);
        },
        removeItem(key) {
            delete store[key];
        },
        clear() {
            Object.keys(store).forEach((key) => delete store[key]);
        },
    };
}

function createWindow(storage, runtimeOverride) {
    const listeners = new Map();
    return {
        __LINGUAKIDS_RUNTIME__: runtimeOverride,
        localStorage: storage,
        addEventListener(name, handler) {
            const next = listeners.get(name) || new Set();
            next.add(handler);
            listeners.set(name, next);
        },
        removeEventListener(name, handler) {
            const next = listeners.get(name);
            if (!next) return;
            next.delete(handler);
            if (next.size === 0) {
                listeners.delete(name);
            }
        },
        dispatchEvent(event) {
            const next = listeners.get(event.type);
            if (!next) return true;
            next.forEach((handler) => handler(event));
            return true;
        },
    };
}

async function waitForServer(child, baseUrl, logs) {
    const start = Date.now();
    while (Date.now() - start < 15000) {
        if (logs.stdout.includes('ENTITLEMENT_API_READY')) {
            return;
        }
        try {
            const health = await requestJson(`${baseUrl}/health`);
            if (health.ok) {
                return;
            }
        } catch {
            // Server not ready yet.
        }
        if (child.exitCode !== null) {
            throw new Error(`server_exited_early:${child.exitCode}:${logs.stderr.trim()}`);
        }
        await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error(`server_timeout:${logs.stderr.trim()}`);
}

async function withServer(privateKeyPath) {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linguakids-entitlement-'));
    const dataFile = path.join(tempDir, 'entitlements.json');
    const secretFile = path.join(tempDir, 'session-secret.txt');
    const port = 8700 + Math.floor(Math.random() * 400);
    const baseUrl = `http://127.0.0.1:${port}`;
    const serverPath = path.join(repoRoot, 'server', 'entitlement-api.mjs');
    const logs = { stdout: '', stderr: '' };

    const child = spawn('node', [serverPath], {
        cwd: repoRoot,
        env: {
            ...process.env,
            HOST: '127.0.0.1',
            PORT: String(port),
            LINGUAKIDS_ENTITLEMENT_DATA_FILE: dataFile,
            LINGUAKIDS_ENTITLEMENT_SECRET_FILE: secretFile,
            LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE: privateKeyPath,
        },
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => {
        logs.stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk) => {
        logs.stderr += chunk.toString('utf8');
    });

    try {
        await waitForServer(child, baseUrl, logs);
        return { child, baseUrl, tempDir, dataFile, secretFile, logs };
    } catch (error) {
        child.kill('SIGTERM');
        throw error;
    }
}

async function stopServer(serverContext) {
    if (!serverContext?.child) return;
    serverContext.child.kill('SIGTERM');
    await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 1000);
        serverContext.child.once('exit', () => {
            clearTimeout(timeout);
            resolve();
        });
    });
    await fs.rm(serverContext.tempDir, { recursive: true, force: true });
}

async function extractToken(privateKeyPath) {
    const { stdout } = await execFileAsync('node', [path.join(repoRoot, 'scripts', 'generate-premium-token.js'), '1'], {
        cwd: repoRoot,
        env: {
            ...process.env,
            LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE: privateKeyPath,
        },
    });
    const match = stdout.match(/LK1\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/);
    if (!match) {
        throw new Error('signed_token_not_found');
    }
    return match[0];
}

async function runIntegration(privateKeyPath) {
    const serverContext = await withServer(privateKeyPath);

    try {
        const token = await extractToken(privateKeyPath);
        const health = await requestJson(`${serverContext.baseUrl}/health`, {
            method: 'GET',
        });
        const activation = await requestJson(`${serverContext.baseUrl}/v1/activate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                activationToken: token,
                installationId: 'audit-installation-direct',
                platform: 'audit-browser',
                deviceLabel: 'Direct API integration test',
                appVersion: 'audit-suite',
            }),
        });
        const resolve = await requestJson(`${serverContext.baseUrl}/v1/entitlements/resolve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionToken: activation.body?.entitlement?.session?.token,
                installationId: 'audit-installation-direct',
                platform: 'audit-browser',
                appVersion: 'audit-suite',
            }),
        });

        const storage = createStorage();
        globalThis.localStorage = storage;
        globalThis.window = createWindow(storage, {
            premium: {
                mode: 'server_backed_web_entitlement',
                entitlementApiBaseUrl: serverContext.baseUrl,
                allowClientSignedTokenFallback: false,
                syncOnBoot: true,
                syncTimeoutMs: 4000,
            },
        });
        globalThis.CustomEvent = globalThis.CustomEvent || class CustomEvent extends Event {
            constructor(name, options = {}) {
                super(name);
                this.detail = options.detail;
            }
        };

        const premiumModuleUrl = `${pathToFileURL(path.join(repoRoot, 'src', 'services', 'premiumService.js')).href}?audit=${Date.now()}`;
        const premiumModule = await import(premiumModuleUrl);
        const unlockResult = await premiumModule.unlockPremium(token);
        const postUnlockStatus = premiumModule.getPremiumStatus();
        const syncResult = await premiumModule.syncPremiumEntitlement();
        const finalStatus = premiumModule.getPremiumStatus();

        return {
            tokenPrefix: token.slice(0, 16),
            apiHealthPass: health.ok === true,
            apiActivatePass: activation.ok === true && activation.body?.entitlement?.sourceOfTruth === 'server_backed_web_entitlement',
            apiResolvePass: resolve.ok === true && resolve.body?.entitlement?.installationId === 'audit-installation-direct',
            clientUnlockPass: unlockResult.success === true && postUnlockStatus.sourceOfTruth === 'server_backed_web_entitlement',
            clientSyncPass: syncResult.success === true && finalStatus.syncState === 'fresh',
            sourceOfTruth: finalStatus.sourceOfTruth,
            serviceMode: finalStatus.serviceMode,
        };
    } finally {
        await stopServer(serverContext);
    }
}

async function main() {
    const findings = [];
    const runtimeChecks = [];

    for (const file of fileChecks) {
        try {
            await fs.access(path.join(repoRoot, file));
        } catch (error) {
            findings.push({
                file,
                message: `Required file missing: ${error.code || error.message}`,
            });
        }
    }

    for (const rule of requiredPatterns) {
        try {
            const contents = await readRelative(rule.file);
            if (!rule.pattern.test(contents)) {
                findings.push({
                    file: rule.file,
                    message: rule.message,
                });
            }
        } catch (error) {
            findings.push({
                file: rule.file,
                message: `Could not inspect file: ${error.code || error.message}`,
            });
        }
    }

    const privateKeyPath = process.env.LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE || defaultPrivateKeyPath;
    try {
        await fs.access(privateKeyPath);
    } catch {
        runtimeChecks.push({
            name: 'entitlement_server_roundtrip',
            skipped: true,
            reason: 'private_key_not_available',
        });
    }

    if (runtimeChecks.length === 0) {
        try {
            const runtime = await runIntegration(privateKeyPath);
            runtimeChecks.push({
                name: 'entitlement_server_roundtrip',
                ...runtime,
                pass: runtime.apiHealthPass
                    && runtime.apiActivatePass
                    && runtime.apiResolvePass
                    && runtime.clientUnlockPass
                    && runtime.clientSyncPass,
            });
            if (!runtime.apiHealthPass || !runtime.apiActivatePass || !runtime.apiResolvePass || !runtime.clientUnlockPass || !runtime.clientSyncPass) {
                findings.push({
                    file: 'entitlement integration',
                    message: 'End-to-end entitlement round-trip did not fully pass.',
                });
            }
        } catch (error) {
            findings.push({
                file: 'entitlement integration',
                message: error.message || String(error),
            });
            runtimeChecks.push({
                name: 'entitlement_server_roundtrip',
                pass: false,
                error: error.message || String(error),
            });
        }
    }

    const summary = {
        checks: fileChecks.length + requiredPatterns.length,
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
