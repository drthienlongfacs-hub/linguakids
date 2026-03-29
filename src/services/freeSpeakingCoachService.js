import { FREE_SPEAKING_SCENARIOS } from '../data/freeSpeakingCoachScenarios';
import {
    getFreeSpeakingClosingClipId,
    getFreeSpeakingDefaultReplyClipId,
    getFreeSpeakingFollowUpClipId,
} from '../data/freeSpeakingCoachAudioContent';

function normalizeText(text, lang = 'en') {
    const value = String(text || '').trim();
    if (lang === 'cn') {
        return value.replace(/[，。！？、\s]/g, '');
    }
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenize(text, lang = 'en') {
    const normalized = normalizeText(text, lang);
    if (!normalized) return [];
    return lang === 'cn' ? normalized.split('').filter(Boolean) : normalized.split(/\s+/).filter(Boolean);
}

function average(values) {
    if (!values.length) return 0;
    return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getFreeSpeakingScenarios(lang = 'en') {
    return FREE_SPEAKING_SCENARIOS.filter((scenario) => scenario.lang === lang);
}

export function getFreeSpeakingScenarioById(id) {
    return FREE_SPEAKING_SCENARIOS.find((scenario) => scenario.id === id) || null;
}

export function buildCoachReply({ scenario, turnIndex, transcript }) {
    return resolveCoachReply({ scenario, turnIndex, transcript }).text;
}

export function resolveCoachReply({ scenario, turnIndex, transcript }) {
    const turn = scenario?.turns?.[turnIndex];
    if (!turn) {
        return {
            text: scenario?.closing || '',
            clipId: getFreeSpeakingClosingClipId(),
            replyMode: 'closing',
        };
    }

    const input = normalizeText(transcript, scenario.lang);
    if (!input) {
        return {
            text: turn.defaultReply,
            clipId: getFreeSpeakingDefaultReplyClipId(turn.id),
            replyMode: 'default',
        };
    }

    let bestReply = turn.defaultReply;
    let bestScore = 0;
    let clipId = getFreeSpeakingDefaultReplyClipId(turn.id);

    for (const [followUpIndex, followUp] of (turn.followUps || []).entries()) {
        const score = (followUp.keywords || []).reduce((sum, keyword) => {
            const normalizedKeyword = normalizeText(keyword, scenario.lang);
            if (!normalizedKeyword) return sum;
            return sum + (input.includes(normalizedKeyword) ? 1 : 0);
        }, 0);

        if (score > bestScore) {
            bestScore = score;
            bestReply = followUp.reply;
            clipId = getFreeSpeakingFollowUpClipId(turn.id, followUpIndex);
        }
    }

    return {
        text: bestReply || turn.defaultReply,
        clipId,
        replyMode: bestScore > 0 ? 'followup' : 'default',
    };
}

export function buildFreeSpeakingSummary({ scenario, turnResults }) {
    const metricMap = new Map();
    const vocabularyHits = new Set();
    const transcripts = [];
    const transcriptTokens = [];

    for (const turn of turnResults) {
        if (turn.transcript) {
            transcripts.push(turn.transcript);
        }

        for (const metric of turn.analysis?.metrics || []) {
            const existing = metricMap.get(metric.key) || {
                key: metric.key,
                label: metric.label,
                values: [],
                insight: metric.insight,
            };
            existing.values.push(metric.score);
            metricMap.set(metric.key, existing);
        }

        const turnTokens = tokenize(turn.transcript, scenario.lang);
        transcriptTokens.push(...turnTokens);
        for (const token of turnTokens) {
            if ((scenario.vocabulary || []).some((item) => normalizeText(item, scenario.lang).includes(token) || token.includes(normalizeText(item, scenario.lang)))) {
                vocabularyHits.add(token);
            }
        }
    }

    const metrics = Array.from(metricMap.values()).map((metric) => ({
        key: metric.key,
        label: metric.label,
        score: average(metric.values),
        insight: metric.insight,
    }));

    const overallScore = average(metrics.map((metric) => metric.score));
    const tokenCount = transcripts.reduce((sum, text) => sum + tokenize(text, scenario.lang).length, 0);
    const vocabularyTargetCount = (scenario.vocabulary || []).length;

    return {
        overallScore,
        metrics,
        totalTurns: turnResults.length,
        totalWords: tokenCount,
        uniqueWords: new Set(transcriptTokens).size,
        vocabularyProgress: vocabularyTargetCount > 0
            ? Math.min(100, Math.round((vocabularyHits.size / vocabularyTargetCount) * 100))
            : 0,
        transcriptBundle: transcripts.join(' '),
        strengths: metrics
            .filter((metric) => metric.score >= 75)
            .sort((a, b) => b.score - a.score)
            .slice(0, 2)
            .map((metric) => `${metric.label} ổn định ở mức ${metric.score}%.`),
        priorities: metrics
            .filter((metric) => metric.score < 70)
            .sort((a, b) => a.score - b.score)
            .slice(0, 2)
            .map((metric) => `Ưu tiên cải thiện ${metric.label.toLowerCase()} ở lượt nói tiếp theo.`),
    };
}
