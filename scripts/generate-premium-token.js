#!/usr/bin/env node
// generate-premium-token.js — OFFLINE ONLY
// This script runs OUTSIDE the web bundle.
// It generates valid LinguaKids premium tokens.
//
// Usage: node scripts/generate-premium-token.js [count]
// Example: node scripts/generate-premium-token.js 10
//
// SECURITY NOTE (RCA-042):
// This file MUST NOT be included in the web bundle.
// It is gitignored from the dist/ folder.
// The computeTokenSig algorithm must match premiumService.js

const SALT = [7, 13, 23, 37, 41, 53, 61, 71];
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function computeTokenSig(payload) {
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
        const c = payload.charCodeAt(i);
        hash = ((hash << 5) - hash + c * SALT[i]) | 0;
    }
    let sig = '';
    let h = Math.abs(hash);
    for (let i = 0; i < 4; i++) {
        sig += CHARS[h % 36];
        h = Math.floor(h / 36) + SALT[i];
    }
    return sig;
}

function generateToken() {
    let payload = '';
    for (let i = 0; i < 8; i++) {
        payload += CHARS[Math.floor(Math.random() * 36)];
    }
    const sig = computeTokenSig(payload);
    return `LK-${payload}-${sig}`;
}

// CLI
const count = parseInt(process.argv[2]) || 5;
console.log(`\n🔑 LinguaKids Premium Tokens (${count}):\n`);
console.log('─'.repeat(30));
for (let i = 0; i < count; i++) {
    console.log(`  ${i + 1}. ${generateToken()}`);
}
console.log('─'.repeat(30));
console.log(`\n⚠️  These tokens are for distribution to paying customers.`);
console.log(`    Do NOT share this script or commit it to the web bundle.\n`);
