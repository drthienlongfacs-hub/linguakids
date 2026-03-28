import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { gunzipSync } from 'node:zlib';
import { parse } from 'yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DATA_DIR = path.join(ROOT, 'public', 'data');

const ENGLISH_CAP = 32000;
const ENGLISH_PRACTICE_CAP = 12000;
const CHINESE_CAP = 12000;
const CHINESE_PRACTICE_CAP = 8000;

const ENGLISH_DOMAIN_EMOJI = {
    'noun.animal': '🐾',
    'noun.artifact': '🧰',
    'noun.body': '🫀',
    'noun.cognition': '🧠',
    'noun.communication': '💬',
    'noun.event': '🎟️',
    'noun.feeling': '😊',
    'noun.food': '🍽️',
    'noun.group': '👥',
    'noun.location': '🗺️',
    'noun.object': '📦',
    'noun.person': '🧑',
    'noun.plant': '🌿',
    'noun.possession': '💼',
    'noun.process': '⚙️',
    'noun.time': '⏰',
    'verb.body': '🏃',
    'verb.change': '🔄',
    'verb.cognition': '🧠',
    'verb.communication': '🗣️',
    'verb.consumption': '🍴',
    'verb.contact': '🤝',
    'verb.creation': '🛠️',
    'verb.emotion': '💓',
    'verb.motion': '🚶',
    'verb.perception': '👀',
    'verb.possession': '💼',
    'verb.social': '🤝',
    'verb.stative': '📍',
    'adj.all': '🎨',
    'adj.pert': '🧩',
    'adj.ppl': '✨',
    'adv.all': '⚡',
};

const COMMON_ENGLISH_DOMAINS = new Set([
    'noun.animal',
    'noun.artifact',
    'noun.body',
    'noun.communication',
    'noun.feeling',
    'noun.food',
    'noun.group',
    'noun.location',
    'noun.object',
    'noun.person',
    'noun.plant',
    'noun.time',
    'verb.body',
    'verb.change',
    'verb.communication',
    'verb.consumption',
    'verb.contact',
    'verb.creation',
    'verb.emotion',
    'verb.motion',
    'verb.perception',
    'verb.social',
    'adj.all',
    'adv.all',
]);

const COMMON_CHINESE_DOMAINS = new Set([
    'noun.animal',
    'noun.artifact',
    'noun.body',
    'noun.communication',
    'noun.feeling',
    'noun.food',
    'noun.location',
    'noun.object',
    'noun.person',
    'noun.plant',
    'noun.time',
    'verb.body',
    'verb.change',
    'verb.communication',
    'verb.consumption',
    'verb.contact',
    'verb.creation',
    'verb.emotion',
    'verb.motion',
    'verb.perception',
    'verb.social',
]);

const POS_LABELS = {
    n: 'noun',
    v: 'verb',
    a: 'adjective',
    s: 'adjective',
    r: 'adverb',
};

const ARPABET_TO_IPA = {
    AA: 'a',
    AE: 'ae',
    AH: 'uh',
    AO: 'aw',
    AW: 'aʊ',
    AY: 'aɪ',
    B: 'b',
    CH: 'tʃ',
    D: 'd',
    DH: 'ð',
    EH: 'e',
    ER: 'ɝ',
    EY: 'eɪ',
    F: 'f',
    G: 'g',
    HH: 'h',
    IH: 'i',
    IY: 'iː',
    JH: 'dʒ',
    K: 'k',
    L: 'l',
    M: 'm',
    N: 'n',
    NG: 'ŋ',
    OW: 'oʊ',
    OY: 'ɔɪ',
    P: 'p',
    R: 'r',
    S: 's',
    SH: 'ʃ',
    T: 't',
    TH: 'θ',
    UH: 'ʊ',
    UW: 'uː',
    V: 'v',
    W: 'w',
    Y: 'j',
    Z: 'z',
    ZH: 'ʒ',
};

function ensureOk(result, label) {
    if (result.status !== 0) {
        throw new Error(`${label} failed: ${result.stderr?.toString() || result.stdout?.toString() || 'unknown error'}`);
    }
}

function domainToLabel(domain) {
    if (!domain) return 'General';
    if (domain === 'noun.Tops') return 'General Concepts';
    return domain
        .replace(/^noun\./, 'Noun: ')
        .replace(/^verb\./, 'Verb: ')
        .replace(/^adj\./, 'Adjective: ')
        .replace(/^adv\./, 'Adverb: ')
        .replace(/\./g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toSentenceCase(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function sanitizeWhitespace(value) {
    return String(value || '')
        .replace(/\s+/g, ' ')
        .replace(/\s+([,.;:!?])/g, '$1')
        .trim();
}

function normalizeDefinition(value) {
    const cleaned = sanitizeWhitespace(value)
        .replace(/^to\s+/i, 'to ')
        .replace(/^[([]?obsolete[)\]]\s*/i, '')
        .replace(/^[([]?archaic[)\]]\s*/i, '');
    return cleaned.length > 240 ? `${cleaned.slice(0, 237)}...` : cleaned;
}

function englishLemmaAllowed(lemma) {
    if (!lemma || lemma.length < 2 || lemma.length > 32) return false;
    if (/[A-Z]/.test(lemma)) return false;
    if (/[^a-z' -]/.test(lemma)) return false;
    const parts = lemma.split(' ');
    if (parts.length > 3) return false;
    if (parts.some((part) => part.length === 0)) return false;
    return true;
}

function isGoodEnglishDefinition(definition) {
    if (!definition) return false;
    if (definition.length < 10 || definition.length > 240) return false;
    if (/^one of the/i.test(definition)) return true;
    if (/^[A-Z]/.test(definition)) return false;
    if (/^a title/i.test(definition)) return false;
    return true;
}

function englishExampleAllowed(example) {
    return Boolean(example) && example.length >= 8 && example.length <= 180;
}

function normalizeCmudictWord(raw) {
    return raw.toLowerCase().replace(/\(\d+\)$/, '');
}

function arpabetToIpa(pronunciation) {
    if (!pronunciation) return '';
    return pronunciation
        .split(/\s+/)
        .map((token) => token.replace(/[012]/g, ''))
        .map((token) => ARPABET_TO_IPA[token] || token.toLowerCase())
        .join(' ')
        .trim();
}

function convertNumericPinyin(input) {
    const toneMap = {
        a: ['a', 'ā', 'á', 'ǎ', 'à'],
        e: ['e', 'ē', 'é', 'ě', 'è'],
        i: ['i', 'ī', 'í', 'ǐ', 'ì'],
        o: ['o', 'ō', 'ó', 'ǒ', 'ò'],
        u: ['u', 'ū', 'ú', 'ǔ', 'ù'],
        v: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
        ü: ['ü', 'ǖ', 'ǘ', 'ǚ', 'ǜ'],
    };

    return input
        .trim()
        .split(/\s+/)
        .map((syllable) => {
            const match = syllable.match(/^([a-züv:]+)([1-5])$/i);
            if (!match) return syllable.replace(/u:/gi, 'ü').replace(/v/gi, 'ü');

            let [, letters, tone] = match;
            const toneNumber = Number(tone);
            letters = letters.replace(/u:/gi, 'ü').replace(/v/gi, 'ü');
            if (toneNumber === 5 || toneNumber === 0) return letters;

            let vowelIndex = letters.indexOf('a');
            if (vowelIndex === -1) vowelIndex = letters.indexOf('e');
            if (vowelIndex === -1 && letters.includes('ou')) vowelIndex = letters.indexOf('o');
            if (vowelIndex === -1) {
                const vowels = [...letters].map((char, index) => ({ char, index }))
                    .filter(({ char }) => /[aeiouü]/.test(char));
                vowelIndex = vowels.length ? vowels[vowels.length - 1].index : -1;
            }
            if (vowelIndex === -1) return letters;

            const vowel = letters[vowelIndex];
            const accented = toneMap[vowel]?.[toneNumber] || vowel;
            return `${letters.slice(0, vowelIndex)}${accented}${letters.slice(vowelIndex + 1)}`;
        })
        .join(' ');
}

function englishScore(candidate, curatedEnglish) {
    let score = 0;
    if (curatedEnglish.has(candidate.word.toLowerCase())) score += 200;
    if (candidate.singleToken) score += 60;
    if (candidate.pronunciation) score += 20;
    if (candidate.partOfSpeech === 'noun') score += 20;
    if (candidate.partOfSpeech === 'verb') score += 18;
    if (candidate.partOfSpeech === 'adjective') score += 16;
    if (COMMON_ENGLISH_DOMAINS.has(candidate.domain)) score += 40;
    if (candidate.definition.length >= 18 && candidate.definition.length <= 110) score += 20;
    if (candidate.example) score += 8;
    score += Math.max(0, 14 - candidate.word.length);
    return score;
}

function chineseScore(candidate, curatedChinese) {
    let score = 0;
    if (curatedChinese.has(candidate.character)) score += 200;
    if (candidate.inCow) score += 70;
    if (COMMON_CHINESE_DOMAINS.has(candidate.domain)) score += 35;
    if (candidate.character.length <= 2) score += 35;
    if (candidate.character.length <= 4) score += 15;
    if (candidate.example) score += 8;
    if (candidate.gloss.length >= 6 && candidate.gloss.length <= 90) score += 18;
    return score;
}

function isPlayableEnglish(entry) {
    return entry.word.length <= 16
        && !entry.word.includes(' ')
        && ['noun', 'verb', 'adjective', 'adverb'].includes(entry.partOfSpeech)
        && COMMON_ENGLISH_DOMAINS.has(entry.domain);
}

function isPlayableChinese(entry) {
    return entry.character.length <= 4
        && !/[A-Za-z0-9]/.test(entry.character)
        && entry.gloss.length <= 90
        && (entry.score >= 45 || entry.inCow);
}

function chineseTermAllowed(term) {
    if (!term || term.length < 1 || term.length > 4) return false;
    if (/[A-Za-z0-9]/.test(term)) return false;
    if (/[·•\-.]/.test(term)) return false;
    if (/[()（）【】\[\]{}]/.test(term)) return false;
    return true;
}

function glossAllowed(glossText) {
    if (!glossText) return false;
    if (/surname|variant of|old variant of|used in|abbr\.|classifier|CL:|place name|county in|town in|district in|prefecture|Kangxi radical/i.test(glossText)) {
        return false;
    }
    return glossText.length >= 4 && glossText.length <= 120;
}

function selectGloss(glosses) {
    for (const gloss of glosses) {
        const cleaned = sanitizeWhitespace(gloss.replace(/\([^)]*\)/g, '').replace(/Taiwan pr\.[^,;]*/gi, '').trim());
        if (glossAllowed(cleaned)) return cleaned;
    }
    return '';
}

function loadYamlFile(filePath) {
    return fs.readFile(filePath, 'utf8').then((raw) => parse(raw));
}

async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return response.text();
}

async function fetchBuffer(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
    return Buffer.from(await response.arrayBuffer());
}

async function loadCurrentCurriculum() {
    const englishModule = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'english.js')).href);
    const chineseModule = await import(pathToFileURL(path.join(ROOT, 'src', 'data', 'chinese.js')).href);
    return {
        curatedEnglish: new Set(englishModule.ALL_ENGLISH_WORDS.map((item) => item.word.toLowerCase())),
        curatedChinese: new Set(chineseModule.ALL_CHINESE_WORDS.map((item) => item.character)),
    };
}

async function loadEnglishWordnet() {
    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'linguakids-ewn-'));
    const cloneResult = spawnSync('git', ['clone', '--depth', '1', 'https://github.com/globalwordnet/english-wordnet.git', tempDir], {
        encoding: 'utf8',
        stdio: 'pipe',
    });
    ensureOk(cloneResult, 'git clone english-wordnet');

    const yamlDir = path.join(tempDir, 'src', 'yaml');
    const fileNames = await fs.readdir(yamlDir);
    const entryFiles = fileNames.filter((file) => file.startsWith('entries-')).sort();
    const synsetFiles = fileNames.filter((file) => !file.startsWith('entries-') && file !== 'frames.yaml').sort();

    const synsets = new Map();
    for (const fileName of synsetFiles) {
        const records = await loadYamlFile(path.join(yamlDir, fileName));
        const domain = fileName.replace(/\.yaml$/, '');
        for (const [synsetId, payload] of Object.entries(records || {})) {
            synsets.set(synsetId, {
                definition: normalizeDefinition(Array.isArray(payload.definition) ? payload.definition[0] : payload.definition),
                example: englishExampleAllowed(Array.isArray(payload.example) ? payload.example[0] : payload.example)
                    ? sanitizeWhitespace(Array.isArray(payload.example) ? payload.example[0] : payload.example)
                    : '',
                domain,
                members: Array.isArray(payload.members) ? payload.members.map((item) => sanitizeWhitespace(item)) : [],
                partOfSpeech: POS_LABELS[payload.partOfSpeech] || POS_LABELS[synsetId.slice(-1)] || 'noun',
            });
        }
    }

    const cmudictRaw = await fetchText('https://raw.githubusercontent.com/cmusphinx/cmudict/master/cmudict.dict');
    const cmudict = new Map();
    for (const line of cmudictRaw.split('\n')) {
        if (!line || line.startsWith(';;;')) continue;
        const parts = line.trim().split(/\s+/);
        const word = normalizeCmudictWord(parts.shift());
        if (!word || cmudict.has(word)) continue;
        const arpabet = parts.join(' ');
        cmudict.set(word, { arpabet, ipa: arpabetToIpa(arpabet) });
    }

    return { tempDir, entryFiles, synsets, cmudict, yamlDir };
}

async function buildEnglishLexicon(resources, curatedEnglish) {
    const candidates = [];
    const seen = new Set();

    for (const fileName of resources.entryFiles) {
        const records = await loadYamlFile(path.join(resources.yamlDir, fileName));
        for (const [lemma, payload] of Object.entries(records || {})) {
            if (!englishLemmaAllowed(lemma)) continue;

            const normalizedLemma = sanitizeWhitespace(lemma.toLowerCase());
            let best = null;

            for (const [posKey, posPayload] of Object.entries(payload || {})) {
                const partOfSpeech = POS_LABELS[posKey];
                if (!partOfSpeech) continue;

                const pronunciation = Array.isArray(posPayload?.pronunciation)
                    ? sanitizeWhitespace(posPayload.pronunciation[0]?.value || '')
                    : '';

                for (const sense of posPayload?.sense || []) {
                    const synset = resources.synsets.get(sense.synset);
                    if (!synset || !isGoodEnglishDefinition(synset.definition)) continue;

                    const cmu = resources.cmudict.get(normalizedLemma);
                    const candidate = {
                        id: `en:${normalizedLemma}:${partOfSpeech}`,
                        word: toSentenceCase(normalizedLemma),
                        wordLower: normalizedLemma,
                        vietnamese: synset.definition,
                        definition: synset.definition,
                        example: synset.example,
                        exampleVi: synset.example,
                        partOfSpeech,
                        pronunciation: pronunciation || cmu?.ipa || '',
                        pronunciationRaw: cmu?.arpabet || '',
                        domain: synset.domain,
                        domainLabel: domainToLabel(synset.domain),
                        englishSynonyms: synset.members.slice(0, 5),
                        cefr: curatedEnglish.has(normalizedLemma) ? 'Curriculum' : 'Extended',
                        source: ['Open English WordNet', pronunciation || cmu ? 'CMU Pronouncing Dictionary' : 'Open English WordNet'],
                        emoji: ENGLISH_DOMAIN_EMOJI[synset.domain] || '📘',
                        singleToken: !normalizedLemma.includes(' '),
                    };

                    candidate.score = englishScore(candidate, curatedEnglish);
                    if (!best || candidate.score > best.score) best = candidate;
                }
            }

            if (!best) continue;
            if (seen.has(best.id)) continue;
            seen.add(best.id);
            candidates.push(best);
        }
    }

    candidates.sort((left, right) => right.score - left.score || left.wordLower.localeCompare(right.wordLower));

    const full = candidates.slice(0, ENGLISH_CAP).map((entry, index) => ({
        rank: index + 1,
        ...entry,
    }));

    const practice = full.filter(isPlayableEnglish).slice(0, ENGLISH_PRACTICE_CAP);

    return { full, practice };
}

function parseCow(raw, synsets) {
    const cow = new Map();
    for (const line of raw.split('\n')) {
        if (!line || line.startsWith('#')) continue;
        const [synsetId, type, lemma] = line.split('\t');
        if (type !== 'cmn:lemma' || !lemma) continue;
        const cleanedLemma = sanitizeWhitespace(lemma);
        const values = cow.get(cleanedLemma) || [];
        const synset = synsets.get(synsetId);
        values.push({
            synsetId,
            domain: synset?.domain || 'noun.Tops',
            definition: synset?.definition || '',
            example: synset?.example || '',
            englishMembers: synset?.members?.slice(0, 5) || [],
        });
        cow.set(cleanedLemma, values);
    }
    return cow;
}

async function buildChineseLexicon(synsets, curatedChinese) {
    const cowRaw = await fetchText('https://raw.githubusercontent.com/omwn/omw-data/master/wns/cow/wn-data-cmn.tab');
    const cow = parseCow(cowRaw, synsets);

    const cedictBuffer = await fetchBuffer('https://www.mdbg.net/chinese/export/cedict/cedict_1_0_ts_utf-8_mdbg.txt.gz');
    const cedictRaw = gunzipSync(cedictBuffer).toString('utf8');

    const byTerm = new Map();
    for (const line of cedictRaw.split('\n')) {
        const cleanLine = line.trim();
        if (!cleanLine || cleanLine.startsWith('#')) continue;
        const match = cleanLine.match(/^(\S+)\s+(\S+)\s+\[(.+?)\]\s+\/(.+)\/$/);
        if (!match) continue;

        const [, , simplified, numericPinyin, glossBlob] = match;
        if (!chineseTermAllowed(simplified)) continue;

        const glosses = glossBlob.split('/').map((item) => sanitizeWhitespace(item)).filter(Boolean);
        const gloss = selectGloss(glosses);
        if (!gloss) continue;

        const cowMatches = cow.get(simplified) || [];
        const preferredCow = cowMatches.find((item) => COMMON_CHINESE_DOMAINS.has(item.domain)) || cowMatches[0] || null;
        const domain = preferredCow?.domain || 'noun.Tops';
        const definition = preferredCow?.definition || gloss;
        const example = preferredCow?.example || '';
        const englishMembers = preferredCow?.englishMembers || [];

        const candidate = {
            id: `zh:${simplified}`,
            character: simplified,
            word: simplified,
            pinyin: convertNumericPinyin(numericPinyin),
            vietnamese: gloss,
            definition,
            gloss,
            example,
            partOfSpeech: domain.startsWith('verb.') ? 'verb' : domain.startsWith('adj.') ? 'adjective' : domain.startsWith('adv.') ? 'adverb' : 'noun',
            domain,
            domainLabel: domainToLabel(domain),
            englishSynonyms: englishMembers,
            source: preferredCow ? ['CC-CEDICT', 'Chinese Open Wordnet', 'Open English WordNet'] : ['CC-CEDICT'],
            emoji: ENGLISH_DOMAIN_EMOJI[domain] || '📗',
            inCow: Boolean(preferredCow),
        };

        candidate.score = chineseScore(candidate, curatedChinese);

        const previous = byTerm.get(simplified);
        if (!previous || candidate.score > previous.score) {
            byTerm.set(simplified, candidate);
        }
    }

    const full = [...byTerm.values()]
        .sort((left, right) => right.score - left.score || left.character.localeCompare(right.character, 'zh-Hans-CN'))
        .slice(0, CHINESE_CAP)
        .map((entry, index) => ({
            rank: index + 1,
            ...entry,
        }));

    const practice = full.filter(isPlayableChinese).slice(0, CHINESE_PRACTICE_CAP);

    return { full, practice };
}

function summarize(entries, practice, key) {
    const byDomain = {};
    for (const entry of entries) {
        byDomain[entry.domainLabel] = (byDomain[entry.domainLabel] || 0) + 1;
    }
    const topDomains = Object.entries(byDomain)
        .sort((left, right) => right[1] - left[1])
        .slice(0, 12)
        .map(([label, count]) => ({ label, count }));

    return {
        total: entries.length,
        practice: practice.length,
        sample: entries.slice(0, 5).map((entry) => entry[key]),
        topDomains,
    };
}

async function writeJson(fileName, value) {
    await fs.writeFile(path.join(PUBLIC_DATA_DIR, fileName), JSON.stringify(value, null, 2), 'utf8');
}

async function main() {
    console.log('Building standard lexicon...');
    await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });

    const { curatedEnglish, curatedChinese } = await loadCurrentCurriculum();
    const englishResources = await loadEnglishWordnet();
    try {
        const english = await buildEnglishLexicon(englishResources, curatedEnglish);
        const chinese = await buildChineseLexicon(englishResources.synsets, curatedChinese);

        const meta = {
            generatedAt: new Date().toISOString(),
            sources: [
                {
                    id: 'open-english-wordnet',
                    label: 'Open English WordNet',
                    url: 'https://github.com/globalwordnet/english-wordnet',
                    license: 'WordNet License + CC BY 4.0',
                },
                {
                    id: 'cmudict',
                    label: 'CMU Pronouncing Dictionary',
                    url: 'https://github.com/cmusphinx/cmudict',
                    license: 'BSD-style license',
                },
                {
                    id: 'cc-cedict',
                    label: 'CC-CEDICT',
                    url: 'https://www.mdbg.net/chinese/dictionary?page=cc-cedict',
                    license: 'CC BY-SA 4.0',
                },
                {
                    id: 'cow',
                    label: 'Chinese Open Wordnet',
                    url: 'https://bond-lab.github.io/cow/',
                    license: 'WordNet license (via OMW)',
                },
            ],
            english: summarize(english.full, english.practice, 'word'),
            chinese: summarize(chinese.full, chinese.practice, 'character'),
            comparison: {
                currentEnglishCurriculum: curatedEnglish.size,
                currentChineseCurriculum: curatedChinese.size,
                upgradedEnglishMultiplier: Number((english.full.length / curatedEnglish.size).toFixed(1)),
                upgradedChineseMultiplier: Number((chinese.full.length / curatedChinese.size).toFixed(1)),
                upgradedCombinedMultiplier: Number((((english.full.length + chinese.full.length) / (curatedEnglish.size + curatedChinese.size)).toFixed(1))),
            },
        };

        await Promise.all([
            writeJson('standard-lexicon-en.json', english.full),
            writeJson('standard-lexicon-en-practice.json', english.practice),
            writeJson('standard-lexicon-zh.json', chinese.full),
            writeJson('standard-lexicon-zh-practice.json', chinese.practice),
            writeJson('standard-lexicon-meta.json', meta),
        ]);

        console.log(`English full: ${english.full.length}, practice: ${english.practice.length}`);
        console.log(`Chinese full: ${chinese.full.length}, practice: ${chinese.practice.length}`);
        console.log(`Combined multiplier vs current core vocab: ${meta.comparison.upgradedCombinedMultiplier}x`);
    } finally {
        await fs.rm(englishResources.tempDir, { recursive: true, force: true });
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
