import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { randomBytes } from 'node:crypto';

const secretPath = process.env.LINGUAKIDS_ENTITLEMENT_SECRET_FILE
    || path.join(os.homedir(), '.linguakids-premium', 'entitlement-session-secret.txt');

function bytesToBase64Url(value) {
    return Buffer.from(value)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/g, '');
}

async function main() {
    await fs.mkdir(path.dirname(secretPath), { recursive: true });
    const secret = bytesToBase64Url(randomBytes(32));
    await fs.writeFile(secretPath, `${secret}\n`);
    console.log(`Entitlement session secret written to ${secretPath}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
