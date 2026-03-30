import {
    readJson,
    videoLessonCatalogPath,
    videoLessonManifestPath,
} from './lib/videoLessonManifestShared.mjs';

const MONITORED_KEYS = new Set([
    'vi',
    'titleVi',
    'qVi',
    'explanationVi',
    'labelVi',
    'meaningVi',
    'exampleVi',
    'rationaleVi',
    'designGuardrailVi',
    'whyVi',
]);

const FORBIDDEN_PATTERNS = [
    /Xac dinh/,
    /Nhan ra va goi lai/,
    /Nguoi hoc/,
    /Goi y tieng Viet/,
    /Mot thong tin/,
    /Mot dap an/,
    /Tam dung/,
    /Doc tieu de/,
    /Hay goi lai/,
    /Lam mot lan/,
    /Cau hoi/,
    /Tieu de nao/,
    /Cac goi y/,
    /Moi dong tieng Anh/,
    /Dung ho tro song ngu/,
];

function shouldInspectValue(key) {
    return MONITORED_KEYS.has(key) || key.endsWith('Vi');
}

function scanNode(node, path, findings) {
    if (Array.isArray(node)) {
        node.forEach((entry, index) => scanNode(entry, `${path}[${index}]`, findings));
        return;
    }

    if (!node || typeof node !== 'object') {
        return;
    }

    for (const [key, value] of Object.entries(node)) {
        const nextPath = path ? `${path}.${key}` : key;

        if (typeof value === 'string' && shouldInspectValue(key)) {
            const matchedPattern = FORBIDDEN_PATTERNS.find((pattern) => pattern.test(value));
            if (matchedPattern) {
                findings.push({
                    path: nextPath,
                    fragment: matchedPattern.source,
                    value,
                });
            }
            continue;
        }

        scanNode(value, nextPath, findings);
    }
}

async function auditFile(filePath, label) {
    const data = await readJson(filePath);
    const findings = [];
    scanNode(data, '', findings);

    return {
        file: label,
        findings,
    };
}

async function main() {
    const reports = await Promise.all([
        auditFile(videoLessonCatalogPath, 'content/video-lessons/catalog.json'),
        auditFile(videoLessonManifestPath, 'public/data/video-manifests/video-lessons.json'),
    ]);

    const totalFindings = reports.reduce((sum, report) => sum + report.findings.length, 0);
    const output = {
        summary: {
            files: reports.length,
            findings: totalFindings,
            pass: totalFindings === 0,
        },
        reports,
    };

    console.log(JSON.stringify(output, null, 2));

    if (totalFindings > 0) {
        process.exitCode = 1;
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
