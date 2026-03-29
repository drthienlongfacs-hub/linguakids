import { spawn } from 'node:child_process';

const repoRoot = new URL('..', import.meta.url).pathname;

function run(scriptPath) {
    return new Promise((resolve, reject) => {
        const child = spawn('node', [scriptPath], {
            cwd: repoRoot,
            stdio: 'inherit',
        });

        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`script_failed:${scriptPath}:${code}`));
        });
        child.on('error', reject);
    });
}

async function main() {
    await run('scripts/generate-accent-practice-audio.mjs');
    await run('scripts/audit-accent-practice-audio.mjs');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
