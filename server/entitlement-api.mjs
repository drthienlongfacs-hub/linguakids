import http from 'node:http';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { webcrypto, createHmac, randomBytes, randomUUID } from 'node:crypto';
import {
    base64UrlToBytes,
    decodePremiumPayload,
    parseSignedPremiumToken,
    PREMIUM_PUBLIC_JWK,
    PREMIUM_TOKEN_AUDIENCE,
    PREMIUM_TOKEN_VERSION,
} from '../src/shared/premiumTokenSchema.js';

const SERVICE_MODE = 'server_backed_web_entitlement';
const PREMIUM_HOME = path.join(os.homedir(), '.linguakids-premium');
const DATA_FILE = process.env.LINGUAKIDS_ENTITLEMENT_DATA_FILE || path.join(PREMIUM_HOME, 'entitlement-store.json');
const SECRET_FILE = process.env.LINGUAKIDS_ENTITLEMENT_SECRET_FILE || path.join(PREMIUM_HOME, 'entitlement-session-secret.txt');
const PORT = Number.parseInt(process.env.PORT || '8791', 10);
const HOST = process.env.HOST || '127.0.0.1';
const MAX_INSTALLATIONS_PER_ENTITLEMENT = Number.parseInt(process.env.LINGUAKIDS_ENTITLEMENT_MAX_INSTALLATIONS || '5', 10);

let publicKeyPromise = null;
let sessionSecretCache = null;

function bytesToBase64Url(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

function base64UrlToString(value) {
    const normalized = String(value || '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
    return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function jsonResponse(response, statusCode, payload) {
    response.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Cache-Control': 'no-store',
    });
    response.end(`${JSON.stringify(payload)}\n`);
}

async function ensureParentDir(filePath) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function ensureDataStore() {
    await ensureParentDir(DATA_FILE);
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, `${JSON.stringify({ version: 1, entitlements: {} }, null, 2)}\n`);
    }
}

async function readStore() {
    await ensureDataStore();
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
}

async function writeStore(store) {
    await ensureParentDir(DATA_FILE);
    await fs.writeFile(DATA_FILE, `${JSON.stringify(store, null, 2)}\n`);
}

async function ensureSessionSecret() {
    if (sessionSecretCache) return sessionSecretCache;
    await ensureParentDir(SECRET_FILE);
    try {
        const secret = (await fs.readFile(SECRET_FILE, 'utf8')).trim();
        if (secret) {
            sessionSecretCache = secret;
            return secret;
        }
    } catch {
        // Fall through and create a new secret.
    }

    const secret = bytesToBase64Url(randomBytes(32));
    await fs.writeFile(SECRET_FILE, `${secret}\n`);
    sessionSecretCache = secret;
    return secret;
}

async function importPremiumPublicKey() {
    if (!publicKeyPromise) {
        publicKeyPromise = webcrypto.subtle.importKey(
            'jwk',
            PREMIUM_PUBLIC_JWK,
            { name: 'ECDSA', namedCurve: 'P-256' },
            false,
            ['verify']
        ).catch((error) => {
            publicKeyPromise = null;
            throw error;
        });
    }
    return publicKeyPromise;
}

function normalizeDateFromEpochSeconds(epochSeconds) {
    if (!Number.isFinite(epochSeconds)) return null;
    return new Date(epochSeconds * 1000).toISOString();
}

function validatePremiumPayload(payload) {
    if (!payload || typeof payload !== 'object') {
        return { ok: false, message: 'token_payload_invalid' };
    }
    if (payload.v !== PREMIUM_TOKEN_VERSION) {
        return { ok: false, message: 'token_version_unsupported' };
    }
    if (payload.a !== PREMIUM_TOKEN_AUDIENCE) {
        return { ok: false, message: 'token_audience_invalid' };
    }
    if (!['lifetime', 'trial_token'].includes(payload.t)) {
        return { ok: false, message: 'token_type_invalid' };
    }
    if (!payload.n) {
        return { ok: false, message: 'token_id_missing' };
    }
    if (payload.e && Number(payload.e) < Math.floor(Date.now() / 1000)) {
        return { ok: false, message: 'token_expired' };
    }
    return { ok: true };
}

async function verifyActivationToken(activationToken) {
    const parsed = parseSignedPremiumToken(activationToken);
    if (!parsed) {
        return { ok: false, message: 'activation_token_format_invalid' };
    }

    let payload;
    try {
        payload = decodePremiumPayload(parsed.payloadSegment);
    } catch {
        return { ok: false, message: 'activation_token_payload_invalid' };
    }

    const payloadValidation = validatePremiumPayload(payload);
    if (!payloadValidation.ok) {
        return { ok: false, message: payloadValidation.message };
    }

    try {
        const publicKey = await importPremiumPublicKey();
        const verified = await webcrypto.subtle.verify(
            { name: 'ECDSA', hash: 'SHA-256' },
            publicKey,
            base64UrlToBytes(parsed.signatureSegment),
            new TextEncoder().encode(parsed.payloadSegment)
        );
        if (!verified) {
            return { ok: false, message: 'activation_token_signature_invalid' };
        }
    } catch {
        return { ok: false, message: 'activation_token_verification_failed' };
    }

    return { ok: true, payload };
}

async function issueSessionToken(entitlement, installationId) {
    const secret = await ensureSessionSecret();
    const issuedAt = Math.floor(Date.now() / 1000);
    const entitlementExpirySeconds = entitlement.expiresAt
        ? Math.floor(new Date(entitlement.expiresAt).getTime() / 1000)
        : null;
    const defaultExpirySeconds = issuedAt + (60 * 60 * 24 * 30);
    const expiresAt = entitlementExpirySeconds
        ? Math.min(entitlementExpirySeconds, defaultExpirySeconds)
        : defaultExpirySeconds;

    const payload = {
        v: 1,
        a: 'linguakids-entitlement-session',
        ent: entitlement.entitlementId,
        tid: entitlement.tokenId,
        inst: installationId,
        i: issuedAt,
        e: expiresAt,
        m: SERVICE_MODE,
    };
    const payloadSegment = bytesToBase64Url(Buffer.from(JSON.stringify(payload), 'utf8'));
    const signature = createHmac('sha256', secret).update(payloadSegment).digest();
    return {
        token: `LKS1.${payloadSegment}.${bytesToBase64Url(signature)}`,
        issuedAt: new Date(issuedAt * 1000).toISOString(),
        expiresAt: new Date(expiresAt * 1000).toISOString(),
    };
}

async function verifySessionToken(sessionToken) {
    const secret = await ensureSessionSecret();
    const parts = String(sessionToken || '').trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'LKS1') {
        return { ok: false, message: 'session_token_format_invalid' };
    }

    const expectedSignature = bytesToBase64Url(
        createHmac('sha256', secret).update(parts[1]).digest()
    );
    if (expectedSignature !== parts[2]) {
        return { ok: false, message: 'session_token_signature_invalid' };
    }

    let payload;
    try {
        payload = JSON.parse(base64UrlToString(parts[1]));
    } catch {
        return { ok: false, message: 'session_token_payload_invalid' };
    }

    if (!payload?.ent || !payload?.tid || !payload?.inst) {
        return { ok: false, message: 'session_token_claims_invalid' };
    }
    if (payload.e && Number(payload.e) < Math.floor(Date.now() / 1000)) {
        return { ok: false, message: 'session_token_expired' };
    }

    return { ok: true, payload };
}

function buildEntitlementResponse(entitlement, session, installationId) {
    const expired = entitlement.expiresAt && new Date(entitlement.expiresAt) < new Date();
    return {
        active: entitlement.active && !expired,
        entitlementId: entitlement.entitlementId,
        type: expired ? 'expired' : entitlement.type,
        expiresAt: entitlement.expiresAt,
        activatedAt: entitlement.activatedAt,
        activationMethod: 'remote_entitlement_api',
        sourceOfTruth: SERVICE_MODE,
        tokenVersion: entitlement.tokenVersion,
        tokenId: entitlement.tokenId,
        installationId,
        lastSyncedAt: new Date().toISOString(),
        serviceMode: SERVICE_MODE,
        session,
    };
}

function normalizeInstallation(body) {
    return {
        installationId: String(body.installationId || '').trim(),
        platform: String(body.platform || '').trim() || 'unknown',
        deviceLabel: String(body.deviceLabel || '').trim() || 'unknown-browser',
        appVersion: String(body.appVersion || '').trim() || 'web-static',
    };
}

async function parseBody(request) {
    const chunks = [];
    for await (const chunk of request) {
        chunks.push(chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return {};
    return JSON.parse(raw);
}

async function handleActivate(body, response) {
    const activationToken = String(body.activationToken || '').trim();
    const installation = normalizeInstallation(body);

    if (!activationToken) {
        return jsonResponse(response, 400, { success: false, message: 'activation_token_required' });
    }
    if (!installation.installationId) {
        return jsonResponse(response, 400, { success: false, message: 'installation_id_required' });
    }

    const verification = await verifyActivationToken(activationToken);
    if (!verification.ok) {
        return jsonResponse(response, 400, { success: false, message: verification.message });
    }

    const { payload } = verification;
    const store = await readStore();
    const entitlementKey = payload.n;
    const existing = store.entitlements[entitlementKey] || {
        entitlementId: `ent_${payload.n}`,
        tokenId: payload.n,
        tokenVersion: payload.v,
        type: payload.t === 'trial_token' ? 'trial_token' : 'lifetime',
        createdAt: new Date().toISOString(),
        activatedAt: new Date().toISOString(),
        expiresAt: payload.e ? normalizeDateFromEpochSeconds(Number(payload.e)) : null,
        active: true,
        activations: [],
    };

    const existingActivation = existing.activations.find((entry) => entry.installationId === installation.installationId);
    if (!existingActivation && existing.activations.length >= MAX_INSTALLATIONS_PER_ENTITLEMENT) {
        return jsonResponse(response, 409, {
            success: false,
            message: 'activation_limit_reached',
            limit: MAX_INSTALLATIONS_PER_ENTITLEMENT,
        });
    }

    if (existingActivation) {
        existingActivation.lastSeenAt = new Date().toISOString();
        existingActivation.platform = installation.platform;
        existingActivation.deviceLabel = installation.deviceLabel;
        existingActivation.appVersion = installation.appVersion;
    } else {
        existing.activations.push({
            activationId: randomUUID(),
            installationId: installation.installationId,
            platform: installation.platform,
            deviceLabel: installation.deviceLabel,
            appVersion: installation.appVersion,
            activatedAt: new Date().toISOString(),
            lastSeenAt: new Date().toISOString(),
        });
    }

    store.entitlements[entitlementKey] = existing;
    await writeStore(store);

    const session = await issueSessionToken(existing, installation.installationId);
    return jsonResponse(response, 200, {
        success: true,
        entitlement: buildEntitlementResponse(existing, session, installation.installationId),
    });
}

async function handleResolve(body, response) {
    const sessionToken = String(body.sessionToken || '').trim();
    const installationId = String(body.installationId || '').trim();

    if (!sessionToken) {
        return jsonResponse(response, 400, { success: false, message: 'session_token_required' });
    }

    const verifiedSession = await verifySessionToken(sessionToken);
    if (!verifiedSession.ok) {
        return jsonResponse(response, 401, { success: false, message: verifiedSession.message });
    }

    if (installationId && verifiedSession.payload.inst !== installationId) {
        return jsonResponse(response, 401, { success: false, message: 'installation_mismatch' });
    }

    const store = await readStore();
    const entitlement = store.entitlements[verifiedSession.payload.tid];
    if (!entitlement) {
        return jsonResponse(response, 404, { success: false, message: 'entitlement_not_found' });
    }

    const activation = entitlement.activations.find((entry) => entry.installationId === verifiedSession.payload.inst);
    if (!activation) {
        return jsonResponse(response, 404, { success: false, message: 'installation_not_registered' });
    }

    activation.lastSeenAt = new Date().toISOString();
    await writeStore(store);

    return jsonResponse(response, 200, {
        success: true,
        entitlement: buildEntitlementResponse(entitlement, {
            token: sessionToken,
            issuedAt: normalizeDateFromEpochSeconds(Number(verifiedSession.payload.i)),
            expiresAt: normalizeDateFromEpochSeconds(Number(verifiedSession.payload.e)),
        }, verifiedSession.payload.inst),
    });
}

const server = http.createServer(async (request, response) => {
    if (request.method === 'OPTIONS') {
        response.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
            'Cache-Control': 'no-store',
        });
        response.end();
        return;
    }

    const url = new URL(request.url, `http://${request.headers.host || `${HOST}:${PORT}`}`);

    try {
        if (request.method === 'GET' && url.pathname === '/health') {
            return jsonResponse(response, 200, {
                ok: true,
                serviceMode: SERVICE_MODE,
                maxInstallationsPerEntitlement: MAX_INSTALLATIONS_PER_ENTITLEMENT,
            });
        }

        if (request.method === 'POST' && url.pathname === '/v1/activate') {
            const body = await parseBody(request);
            return handleActivate(body, response);
        }

        if (request.method === 'POST' && url.pathname === '/v1/entitlements/resolve') {
            const body = await parseBody(request);
            return handleResolve(body, response);
        }

        return jsonResponse(response, 404, { success: false, message: 'route_not_found' });
    } catch (error) {
        return jsonResponse(response, 500, {
            success: false,
            message: error?.message || 'entitlement_internal_error',
        });
    }
});

server.listen(PORT, HOST, async () => {
    await ensureDataStore();
    await ensureSessionSecret();
    process.stdout.write(`ENTITLEMENT_API_READY http://${HOST}:${PORT}\n`);
});

function shutdown() {
    server.close(() => {
        process.exit(0);
    });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
