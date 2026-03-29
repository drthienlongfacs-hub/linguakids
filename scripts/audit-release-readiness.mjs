import { spawn } from 'node:child_process';
import process from 'node:process';

const repoRoot = new URL('..', import.meta.url).pathname;

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            cwd: repoRoot,
            stdio: 'inherit',
        });

        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`command_failed:${command}:${args.join(' ')}:${code}`));
        });
        child.on('error', reject);
    });
}

async function main() {
    await run('npm', ['run', 'audit:premium']);
    await run('npm', ['run', 'audit:entitlement']);
    await run('npm', ['run', 'audit:voice-runtime']);
    await run('npm', ['run', 'audit:free-speaking']);
    await run('npm', ['run', 'audit:teacher-lessons']);
}

main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
});
