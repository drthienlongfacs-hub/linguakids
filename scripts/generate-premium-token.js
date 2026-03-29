#!/usr/bin/env node
// generate-premium-token.js — OFFLINE ONLY
// Generates signed LinguaKids premium tokens with a private key
// that is intentionally kept OUTSIDE the repository.
//
// Usage:
//   node scripts/generate-premium-token.js [count]
//
// Optional env vars:
//   LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE=/abs/path/private-key.pem
//   LINGUAKIDS_PREMIUM_TOKEN_TYPE=lifetime|trial_token
//   LINGUAKIDS_PREMIUM_TOKEN_DAYS=30

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { webcrypto } from 'node:crypto';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import {
    bytesToBase64Url,
    encodePremiumPayload,
    PREMIUM_TOKEN_AUDIENCE,
    PREMIUM_TOKEN_PREFIX,
    PREMIUM_TOKEN_VERSION,
} from '../src/shared/premiumTokenSchema.js';

const DEFAULT_KEY_PATH = path.join(os.homedir(), '.linguakids-premium', 'premium-private-key.pem');

function randomTokenId() {
    return bytesToBase64Url(webcrypto.getRandomValues(new Uint8Array(9))).slice(0, 12);
}

function loadPrivateKeyPem() {
    const filePath = process.env.LINGUAKIDS_PREMIUM_PRIVATE_KEY_FILE || DEFAULT_KEY_PATH;
    if (!fs.existsSync(filePath)) {
        throw new Error(`missing_private_key:${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf8');
}

async function importPrivateKey(pem) {
    const base64 = pem
        .replace(/-----BEGIN PRIVATE KEY-----/g, '')
        .replace(/-----END PRIVATE KEY-----/g, '')
        .replace(/\s+/g, '');
    const keyBytes = Buffer.from(base64, 'base64');
    return webcrypto.subtle.importKey(
        'pkcs8',
        keyBytes,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign']
    );
}

function buildPayload() {
    const now = Math.floor(Date.now() / 1000);
    const type = process.env.LINGUAKIDS_PREMIUM_TOKEN_TYPE || 'lifetime';
    const days = Number.parseInt(process.env.LINGUAKIDS_PREMIUM_TOKEN_DAYS || '0', 10);
    const payload = {
        v: PREMIUM_TOKEN_VERSION,
        a: PREMIUM_TOKEN_AUDIENCE,
        t: type,
        i: now,
        n: randomTokenId(),
    };

    if (Number.isFinite(days) && days > 0) {
        payload.e = now + (days * 24 * 60 * 60);
    }

    return payload;
}

async function signPayload(privateKey, payloadSegment) {
    const signature = await webcrypto.subtle.sign(
        { name: 'ECDSA', hash: 'SHA-256' },
        privateKey,
        new TextEncoder().encode(payloadSegment)
    );
    return bytesToBase64Url(new Uint8Array(signature));
}

async function generateToken(privateKey) {
    const payload = buildPayload();
    const payloadSegment = encodePremiumPayload(payload);
    const signatureSegment = await signPayload(privateKey, payloadSegment);
    return `${PREMIUM_TOKEN_PREFIX}.${payloadSegment}.${signatureSegment}`;
}

async function main() {
    const count = Number.parseInt(process.argv[2] || '5', 10);
    const pem = loadPrivateKeyPem();
    const privateKey = await importPrivateKey(pem);

    console.log(`\n🔑 LinguaKids Signed Premium Tokens (${count}):\n`);
    console.log('─'.repeat(30));
    for (let i = 0; i < count; i += 1) {
        const token = await generateToken(privateKey);
        console.log(`  ${i + 1}. ${token}`);
    }
    console.log('─'.repeat(30));
    console.log('\n⚠️  Private key stays outside the repo and outside the web bundle.\n');
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
