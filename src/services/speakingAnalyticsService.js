import { assessFluency, calculateAccuracy, diffWords } from '../utils/speakingUtils';

const EN_STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
    'to', 'of', 'in', 'on', 'for', 'at', 'by', 'with', 'and', 'or', 'but',
    'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'me', 'my', 'your', 'our', 'their', 'this', 'that',
]);

const EN_VERBS = ['am', 'is', 'are', 'work', 'study', 'live', 'like', 'enjoy', 'have', 'want', 'go', 'read', 'watch', 'play', 'prefer', 'think', 'learn', 'speak'];
const EN_PRONOUNS = ['i', 'you', 'we', 'they', 'he', 'she', 'it'];
const ZH_PRONOUNS = ['我', '你', '他', '她', '我们', '他们'];
const ZH_VERBS = ['是', '有', '喜欢', '会', '在', '去', '吃', '学', '住', '叫', '想', '看', '做', '说'];
const ZH_CONNECTORS = ['因为', '所以', '然后', '也', '还', '但是', '和'];

function normalizeText(text, lang = 'en') {
    const value = String(text || '').trim();
    if (lang === 'cn' || lang === 'zh') {
        return value.replace(/[，。！？、\s]/g, '');
    }
    return value
        .toLowerCase()
        .replace(/[^a-z0-9\s'-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function tokenizeByLang(text, lang = 'en') {
    const normalized = normalizeText(text, lang);
    if (!normalized) return [];
    if (lang === 'cn' || lang === 'zh') {
        return normalized.split('').filter(Boolean);
    }
    return normalized.split(/\s+/).filter(Boolean);
}

function uniqueCount(items) {
    return new Set(items).size;
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
}

function scoreFromWpm(wpm) {
    if (!wpm) return 50;
    if (wpm >= 145) return 92;
    if (wpm >= 120) return 84;
    if (wpm >= 95) return 75;
    if (wpm >= 75) return 66;
    if (wpm >= 55) return 56;
    return 42;
}

function statusFromScore(score) {
    if (score >= 85) return 'strong';
    if (score >= 70) return 'solid';
    if (score >= 55) return 'developing';
    return 'needs_work';
}

function createMetric(key, label, score, insight) {
    return {
        key,
        label,
        score: clamp(score),
        status: statusFromScore(score),
        insight,
    };
}

function buildRecommendations(metrics, lang = 'en') {
    const lowMetrics = metrics.filter((metric) => metric.score < 70);
    if (lowMetrics.length === 0) {
        return lang === 'cn' || lang === 'zh'
            ? ['Giữ nhịp nói ổn định và thử trả lời dài hơn ở lượt tiếp theo.']
            : ['Good control. Try one longer response next time to stretch fluency.'];
    }

    const recommendations = [];
    for (const metric of lowMetrics) {
        if (metric.key === 'pronunciation') {
            recommendations.push(lang === 'cn' || lang === 'zh'
                ? 'Nghe mẫu thêm một lượt rồi bám sát từng từ hoặc từng chữ trước khi nói lại.'
                : 'Replay the model once and mirror the phrase in shorter chunks before retrying.');
        } else if (metric.key === 'completeness') {
            recommendations.push(lang === 'cn' || lang === 'zh'
                ? 'Hãy nói đủ ý hơn, đừng bỏ sót từ khóa hoặc phần cuối của câu.'
                : 'Complete more of the target sentence before stopping.');
        } else if (metric.key === 'fluency') {
            recommendations.push(lang === 'cn' || lang === 'zh'
                ? 'Giữ nhịp đều hơn, giảm ngập ngừng và nối câu mượt hơn.'
                : 'Keep a steadier rhythm and reduce long pauses between words.');
        } else if (metric.key === 'grammar') {
            recommendations.push(lang === 'cn' || lang === 'zh'
                ? 'Dùng khung câu rõ hơn: chủ ngữ + động từ + thông tin chính.'
                : 'Use a clearer sentence frame with subject + verb + key detail.');
        } else if (metric.key === 'vocabulary') {
            recommendations.push(lang === 'cn' || lang === 'zh'
                ? 'Thêm 1-2 từ nội dung cụ thể hơn thay vì trả lời quá ngắn.'
                : 'Add one or two more specific content words to make the response richer.');
        } else if (metric.key === 'task_completion') {
            recommendations.push(lang === 'cn' || lang === 'zh'
                ? 'Trả lời sát yêu cầu của câu hỏi hơn và thêm ít nhất một chi tiết mở rộng.'
                : 'Answer the task more directly and add at least one supporting detail.');
        }
    }

    return [...new Set(recommendations)].slice(0, 3);
}

function buildTranscriptStats(tokens, durationMs) {
    const uniqueTokens = uniqueCount(tokens);
    const { wpm } = assessFluency(tokens.length || 1, durationMs || 0);
    return {
        tokenCount: tokens.length,
        uniqueTokens,
        wpm,
        lexicalDiversity: tokens.length > 0 ? uniqueTokens / tokens.length : 0,
    };
}

function buildExactMetrics(targetText, spokenText, lang, durationMs) {
    const diffs = diffWords(targetText, spokenText, lang);
    const accuracy = calculateAccuracy(diffs);
    const targetTokens = tokenizeByLang(targetText, lang);
    const spokenTokens = tokenizeByLang(spokenText, lang);
    const transcriptStats = buildTranscriptStats(spokenTokens, durationMs);
    const matchedCount = diffs.filter((item) => item.status === 'perfect' || item.status === 'close').length;
    const completeness = targetTokens.length > 0 ? (matchedCount / targetTokens.length) * 100 : 0;
    const orderMatches = targetTokens.reduce((sum, token, index) => (
        spokenTokens[index] === token ? sum + 1 : sum
    ), 0);
    const grammarControl = targetTokens.length > 0 ? (orderMatches / targetTokens.length) * 100 : 0;
    const uniqueTarget = uniqueCount(targetTokens);
    const uniqueMatched = uniqueCount(diffs
        .filter((item) => item.status === 'perfect' || item.status === 'close')
        .map((item) => item.word));
    const vocabularyCoverage = uniqueTarget > 0 ? (uniqueMatched / uniqueTarget) * 100 : 0;
    const taskCompletion = completeness;
    const fluencyScore = scoreFromWpm(transcriptStats.wpm);

    const metrics = [
        createMetric('pronunciation', 'Pronunciation', accuracy, 'Transcript-aligned articulation against the model sentence.'),
        createMetric('completeness', 'Completeness', completeness, 'How much of the reference sentence was captured.'),
        createMetric('fluency', 'Fluency', fluencyScore, 'Speech pacing estimated from transcript length and duration.'),
        createMetric('grammar', 'Structure', grammarControl, 'Word order stability compared with the reference sentence.'),
        createMetric('vocabulary', 'Vocabulary', vocabularyCoverage, 'Coverage of target vocabulary in the learner attempt.'),
        createMetric('task_completion', 'Task', taskCompletion, 'Whether the learner completed the full speaking task.'),
    ];

    const overallScore = metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length;

    return {
        analysisType: 'reference',
        metrics,
        overallScore: clamp(overallScore),
        transcriptStats,
        referenceDiffs: diffs,
    };
}

function buildOpenMetrics({ promptText, spokenText, lang, durationMs, sampleAnswer, expectedMinTokens, tip }) {
    const spokenTokens = tokenizeByLang(spokenText, lang);
    const transcriptStats = buildTranscriptStats(spokenTokens, durationMs);
    const lexicalScore = clamp((transcriptStats.lexicalDiversity * 100) + Math.min(spokenTokens.length * 4, 25));
    const fluencyScore = durationMs > 0
        ? scoreFromWpm(transcriptStats.wpm)
        : clamp(55 + Math.min(spokenTokens.length * 5, 35));

    let grammarScore = 40;
    let taskCompletion = clamp((spokenTokens.length / Math.max(expectedMinTokens, 1)) * 100);
    if (lang === 'cn' || lang === 'zh') {
        const hasPronoun = ZH_PRONOUNS.some((unit) => spokenText.includes(unit));
        const hasVerb = ZH_VERBS.some((unit) => spokenText.includes(unit));
        const hasConnector = ZH_CONNECTORS.some((unit) => spokenText.includes(unit));
        grammarScore = clamp((hasPronoun ? 30 : 0) + (hasVerb ? 35 : 0) + (spokenTokens.length >= expectedMinTokens ? 25 : spokenTokens.length * 4) + (hasConnector ? 10 : 0));
    } else {
        const normalized = normalizeText(spokenText, lang);
        const words = spokenTokens;
        const hasPronoun = EN_PRONOUNS.some((unit) => words.includes(unit));
        const hasVerb = EN_VERBS.some((unit) => words.includes(unit));
        const hasConnector = /\b(because|and|but|so|also|then|when|while)\b/.test(normalized);
        grammarScore = clamp((hasPronoun ? 30 : 0) + (hasVerb ? 35 : 0) + (words.length >= expectedMinTokens ? 25 : words.length * 4) + (hasConnector ? 10 : 0));
    }

    const sampleTokens = tokenizeByLang(String(sampleAnswer || '').replace(/[_\s]+/g, ' '), lang)
        .filter((token) => lang === 'cn' || lang === 'zh' ? token !== '＿' : !EN_STOP_WORDS.has(token));
    if (sampleTokens.length > 0) {
        const overlap = sampleTokens.filter((token) => spokenTokens.includes(token)).length;
        taskCompletion = clamp((taskCompletion * 0.7) + ((overlap / sampleTokens.length) * 100 * 0.3));
    }

    if (!spokenTokens.length) {
        taskCompletion = 0;
        grammarScore = 0;
    }

    const promptInsight = tip || promptText || 'Open-ended response coaching from transcript only.';
    const metrics = [
        createMetric('fluency', 'Fluency', fluencyScore, 'Response pacing estimated from transcript length and duration.'),
        createMetric('grammar', 'Structure', grammarScore, 'Sentence-frame control inferred from transcript patterns.'),
        createMetric('vocabulary', 'Vocabulary', lexicalScore, 'Lexical variety and amount of meaningful content in the response.'),
        createMetric('task_completion', 'Task', taskCompletion, promptInsight),
    ];

    const overallScore = metrics.reduce((sum, metric) => sum + metric.score, 0) / metrics.length;
    return {
        analysisType: 'open_response',
        metrics,
        overallScore: clamp(overallScore),
        transcriptStats,
        referenceDiffs: [],
    };
}

export function analyzeSpeakingAttempt({
    spokenText,
    lang = 'en',
    durationMs = 0,
    targetText = '',
    promptText = '',
    sampleAnswer = '',
    tip = '',
    expectedMinTokens = 4,
}) {
    const normalizedSpoken = String(spokenText || '').trim();
    const analytics = targetText
        ? buildExactMetrics(targetText, normalizedSpoken, lang, durationMs)
        : buildOpenMetrics({
            promptText,
            spokenText: normalizedSpoken,
            lang,
            durationMs,
            sampleAnswer,
            expectedMinTokens,
            tip,
        });

    return {
        ...analytics,
        spokenText: normalizedSpoken,
        recommendations: buildRecommendations(analytics.metrics, lang),
        coachModel: 'heuristic_transcript_coaching',
        note: targetText
            ? 'Feedback is inferred from transcript alignment, pacing, and structure heuristics.'
            : 'Feedback is inferred from transcript quality, response length, and sentence-pattern heuristics.',
    };
}

export function buildSpeakingRecap({
    lessonId,
    lessonTitle,
    lang = 'en',
    promptText = '',
    targetText = '',
    transcript = '',
    analytics,
    source = 'speaking',
}) {
    return {
        id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
        createdAt: new Date().toISOString(),
        lessonId,
        lessonTitle,
        lang,
        promptText,
        targetText,
        transcript,
        source,
        overallScore: analytics.overallScore,
        analysisType: analytics.analysisType,
        metrics: analytics.metrics,
        recommendations: analytics.recommendations,
        note: analytics.note,
        transcriptStats: analytics.transcriptStats,
    };
}
