import { assessFluency, calculateAccuracy, diffWords } from '../utils/speakingUtils';

const EN_STOP_WORDS = new Set([
    'the', 'a', 'an', 'is', 'are', 'am', 'was', 'were', 'be', 'been', 'being',
    'to', 'of', 'in', 'on', 'for', 'at', 'by', 'with', 'and', 'or', 'but',
    'do', 'does', 'did', 'have', 'has', 'had', 'i', 'you', 'he', 'she', 'it',
    'we', 'they', 'me', 'my', 'your', 'our', 'their', 'this', 'that', 'there',
    'here', 'as', 'from', 'about', 'into', 'out', 'up', 'down', 'if',
]);

const EN_VERBS = ['am', 'is', 'are', 'work', 'study', 'live', 'like', 'enjoy', 'have', 'want', 'go', 'read', 'watch', 'play', 'prefer', 'think', 'learn', 'speak', 'improve', 'practice'];
const EN_PRONOUNS = ['i', 'you', 'we', 'they', 'he', 'she', 'it'];
const EN_CONNECTORS = ['because', 'so', 'then', 'also', 'while', 'when', 'but', 'and', 'however'];
const EN_FILLERS = ['um', 'uh', 'erm', 'hmm', 'like', 'you know', 'sort of', 'kind of'];
const ZH_PRONOUNS = ['我', '你', '他', '她', '我们', '他们'];
const ZH_VERBS = ['是', '有', '喜欢', '会', '在', '去', '吃', '学', '住', '叫', '想', '看', '做', '说'];
const ZH_CONNECTORS = ['因为', '所以', '然后', '也', '还', '但是', '和', '如果'];
const ZH_FILLERS = ['嗯', '呃', '这个', '那个'];

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

function extractContentTokens(text, lang = 'en') {
    const tokens = tokenizeByLang(text, lang);
    if (lang === 'cn' || lang === 'zh') {
        return [...new Set(tokens)];
    }
    return [...new Set(tokens.filter((token) => token.length > 2 && !EN_STOP_WORDS.has(token)))];
}

function uniqueCount(items) {
    return new Set(items).size;
}

function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values) {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
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

function scoreFromFillerRatio(fillerRatio) {
    if (fillerRatio <= 0.02) return 94;
    if (fillerRatio <= 0.05) return 84;
    if (fillerRatio <= 0.09) return 72;
    if (fillerRatio <= 0.14) return 60;
    return 44;
}

function scoreFromSentenceControl(sentenceCount, tokenCount, lang = 'en') {
    if (!tokenCount) return 0;
    if (lang === 'cn' || lang === 'zh') {
        if (sentenceCount >= 2 && tokenCount >= 12) return 88;
        if (sentenceCount >= 1 && tokenCount >= 8) return 74;
        if (tokenCount >= 5) return 62;
        return 45;
    }

    if (sentenceCount >= 2 && tokenCount >= 18) return 90;
    if (sentenceCount >= 1 && tokenCount >= 10) return 76;
    if (tokenCount >= 6) return 62;
    return 44;
}

function statusFromScore(score) {
    if (score >= 85) return 'strong';
    if (score >= 70) return 'solid';
    if (score >= 55) return 'developing';
    return 'needs_work';
}

function createMetric(key, label, score, insight, labelVi = '', insightVi = '') {
    return {
        key,
        label,
        labelVi: labelVi || label,
        score: clamp(score),
        status: statusFromScore(score),
        insight,
        insightVi: insightVi || insight,
    };
}

function countFillerUnits(text, lang = 'en') {
    if (!text) return 0;

    if (lang === 'cn' || lang === 'zh') {
        return ZH_FILLERS.reduce((sum, filler) => sum + (String(text).split(filler).length - 1), 0);
    }

    const normalized = normalizeText(text, lang);
    return EN_FILLERS.reduce((sum, filler) => {
        if (filler.includes(' ')) {
            return sum + (normalized.split(filler).length - 1);
        }
        const matches = normalized.match(new RegExp(`\\b${filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g'));
        return sum + (matches?.length || 0);
    }, 0);
}

function countSentences(text, lang = 'en') {
    const raw = String(text || '').trim();
    if (!raw) return 0;
    if (lang === 'cn' || lang === 'zh') {
        return Math.max(1, raw.split(/[。！？]/).filter(Boolean).length);
    }
    return Math.max(1, raw.split(/[.!?]/).filter(Boolean).length);
}

function calculateCoverage(sourceTokens, referenceTokens) {
    if (!referenceTokens.length || !sourceTokens.length) return 0;
    const hits = referenceTokens.filter((token) => sourceTokens.includes(token)).length;
    return clamp((hits / referenceTokens.length) * 100);
}

function buildTranscriptStats(tokens, durationMs, fillerCount = 0) {
    const uniqueTokens = uniqueCount(tokens);
    const { wpm } = assessFluency(tokens.length || 1, durationMs || 0);
    return {
        tokenCount: tokens.length,
        uniqueTokens,
        wpm,
        lexicalDiversity: tokens.length > 0 ? uniqueTokens / tokens.length : 0,
        fillerCount,
        fillerRatio: tokens.length > 0 ? fillerCount / tokens.length : 0,
    };
}

function buildSignalBreakdown({ spokenText, spokenTokens, lang, promptText = '', sampleAnswer = '', transcriptStats }) {
    const promptTokens = extractContentTokens(promptText, lang);
    const sampleTokens = extractContentTokens(String(sampleAnswer || '').replace(/[_\s]+/g, ' '), lang);
    const contentTokens = extractContentTokens(spokenText, lang);
    const promptCoverage = calculateCoverage(contentTokens, promptTokens);
    const sampleCoverage = calculateCoverage(contentTokens, sampleTokens);
    const sentenceCount = countSentences(spokenText, lang);
    const contentDensity = spokenTokens.length > 0 ? contentTokens.length / spokenTokens.length : 0;

    return {
        fillerCount: transcriptStats.fillerCount,
        fillerRatio: Number(transcriptStats.fillerRatio.toFixed(2)),
        sentenceCount,
        promptCoverage,
        sampleCoverage,
        contentDensity: Number(contentDensity.toFixed(2)),
        contentTokenCount: contentTokens.length,
    };
}

function buildStrengths(metrics, lang = 'en') {
    return metrics
        .filter((metric) => metric.score >= 75)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map((metric) => {
            const en = `${metric.label} is a strength at ${metric.score}%.`;
            const vi = `${metric.labelVi || metric.label} là điểm mạnh ở mức ${metric.score}%.`;
            if (lang === 'cn' || lang === 'zh') return vi;
            return `${en} · ${vi}`;
        });
}

function buildRisks(metrics, lang = 'en') {
    return metrics
        .filter((metric) => metric.score < 70)
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
        .map((metric) => {
            const en = `Prioritize ${metric.label.toLowerCase()} in the next attempt.`;
            const vi = `Cần ưu tiên cải thiện ${(metric.labelVi || metric.label).toLowerCase()} ở lượt nói sau.`;
            return bilingualTip(en, vi, lang);
        });
}

function bilingualTip(en, vi, lang) {
    if (lang === 'cn' || lang === 'zh') return vi;
    return `${en} · ${vi}`;
}

function bilingualSentence(en, vi, lang) {
    if (lang === 'cn' || lang === 'zh') return vi;
    return `${en} · ${vi}`;
}

function buildRecommendations(metrics, signals, lang = 'en') {
    const lowMetrics = metrics.filter((metric) => metric.score < 70);
    if (lowMetrics.length === 0) {
        return [bilingualTip(
            'Keep the rhythm stable and expand one answer with one more supporting detail next time.',
            'Giữ nhịp nói ổn định và thử mở rộng câu trả lời thêm một ý nữa ở lượt tiếp theo.',
            lang,
        )];
    }

    const recommendations = [];
    const tipMap = {
        pronunciation: [
            'Replay the model once and mirror it in shorter chunks before saying the full sentence again.',
            'Nghe mẫu thêm một lượt rồi nói lại theo từng cụm ngắn trước khi ghép thành cả câu.',
        ],
        completeness: [
            'Complete the whole model sentence instead of stopping early or dropping the ending.',
            'Hoàn thành trọn câu mẫu, đừng dừng ở giữa hoặc bỏ phần cuối.',
        ],
        fluency: [
            'Keep a steadier pace and reduce long hesitation gaps between words.',
            'Giữ nhịp đều hơn và giảm khoảng ngập ngừng giữa các từ.',
        ],
        grammar: [
            'Use a clearer sentence frame with subject + verb + key detail.',
            'Dùng khung câu rõ hơn: chủ ngữ + động từ + thông tin chính.',
        ],
        vocabulary: [
            'Add more specific content words so the answer sounds richer and less generic.',
            'Thêm từ nội dung cụ thể hơn thay vì chỉ trả lời rất ngắn.',
        ],
        delivery: [
            'Reduce fillers and connect ideas more smoothly to sound more professional.',
            'Giảm filler và kết nối câu mượt hơn để bài nói chuyên nghiệp hơn.',
        ],
        relevance: [
            'Answer the prompt more directly and add at least one supporting detail.',
            'Bám sát câu hỏi hơn và thêm ít nhất một chi tiết hỗ trợ.',
        ],
        task_completion: [
            'Answer the prompt more directly and add at least one supporting detail.',
            'Bám sát câu hỏi hơn và thêm ít nhất một chi tiết hỗ trợ.',
        ],
    };

    for (const metric of lowMetrics) {
        const pair = tipMap[metric.key];
        if (pair) {
            recommendations.push(bilingualTip(pair[0], pair[1], lang));
        }
    }

    if (signals?.fillerRatio >= 0.1) {
        recommendations.push(bilingualTip(
            'If you need time to think, pause briefly instead of filling space with "um", "uh", or "like".',
            'Nếu cần nghĩ thêm ý, hãy tạm dừng ngắn thay vì lặp lại "ừm/ờ/like".',
            lang,
        ));
    }

    return [...new Set(recommendations)].slice(0, 3);
}

function buildExactMetrics(targetText, spokenText, lang, durationMs, promptText = '', sampleAnswer = '') {
    const diffs = diffWords(targetText, spokenText, lang);
    const accuracy = calculateAccuracy(diffs);
    const targetTokens = tokenizeByLang(targetText, lang);
    const spokenTokens = tokenizeByLang(spokenText, lang);
    const fillerCount = countFillerUnits(spokenText, lang);
    const transcriptStats = buildTranscriptStats(spokenTokens, durationMs, fillerCount);
    const signals = buildSignalBreakdown({
        spokenText,
        spokenTokens,
        lang,
        promptText,
        sampleAnswer,
        transcriptStats,
    });
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
    const fluencyScore = average([
        scoreFromWpm(transcriptStats.wpm),
        scoreFromFillerRatio(signals.fillerRatio),
    ]);
    const deliveryScore = average([
        scoreFromFillerRatio(signals.fillerRatio),
        scoreFromSentenceControl(signals.sentenceCount, spokenTokens.length, lang),
    ]);
    const taskCompletion = average([completeness, signals.promptCoverage || completeness]);

    const metrics = [
        createMetric('pronunciation', 'Pronunciation', accuracy,
            'Transcript-aligned articulation against the model sentence.',
            'Phát âm', 'Độ chính xác phát âm so với câu mẫu.'),
        createMetric('completeness', 'Completeness', completeness,
            'How much of the reference sentence was captured and finished.',
            'Hoàn thành', 'Bạn đã nói được bao nhiêu phần trăm câu mẫu.'),
        createMetric('fluency', 'Fluency', fluencyScore,
            'Speech pacing estimated from transcript length, duration, and filler load.',
            'Lưu loát', 'Nhịp nói ước tính từ độ dài, thời lượng, và từ đệm.'),
        createMetric('grammar', 'Structure', grammarControl,
            'Word order stability compared with the reference sentence.',
            'Cấu trúc', 'Thứ tự từ ổn định so với câu mẫu.'),
        createMetric('vocabulary', 'Vocabulary', vocabularyCoverage,
            'Coverage of the target vocabulary in the learner attempt.',
            'Từ vựng', 'Mức độ sử dụng từ vựng mục tiêu trong câu trả lời.'),
        createMetric('delivery', 'Delivery', deliveryScore,
            'Smoothness inferred from fillers, sentence control, and response stability.',
            'Trình bày', 'Độ mượt dựa trên từ đệm, cấu trúc câu và sự ổn định.'),
        createMetric('task_completion', 'Task', taskCompletion,
            'Whether the learner completed the full speaking task clearly.',
            'Nhiệm vụ', 'Bạn đã hoàn thành nhiệm vụ nói rõ ràng chưa.'),
    ];

    return {
        analysisType: 'reference',
        metrics,
        overallScore: clamp(average(metrics.map((metric) => metric.score))),
        transcriptStats,
        referenceDiffs: diffs,
        referenceWordFeedback: diffs.map((item) => ({
            word: item.word,
            status: item.status,
            score: item.similarity,
            spoken: item.spoken,
        })),
        signalBreakdown: signals,
    };
}

function buildOpenMetrics({ promptText, spokenText, lang, durationMs, sampleAnswer, expectedMinTokens, tip }) {
    const spokenTokens = tokenizeByLang(spokenText, lang);
    const fillerCount = countFillerUnits(spokenText, lang);
    const transcriptStats = buildTranscriptStats(spokenTokens, durationMs, fillerCount);
    const signals = buildSignalBreakdown({
        spokenText,
        spokenTokens,
        lang,
        promptText,
        sampleAnswer,
        transcriptStats,
    });
    const lexicalScore = clamp((transcriptStats.lexicalDiversity * 100 * 0.6) + (signals.contentDensity * 100 * 0.4) + Math.min(spokenTokens.length * 2.5, 20));
    const fluencyScore = average([
        durationMs > 0 ? scoreFromWpm(transcriptStats.wpm) : clamp(55 + Math.min(spokenTokens.length * 5, 35)),
        scoreFromFillerRatio(signals.fillerRatio),
    ]);

    let grammarScore = 40;
    let taskCompletion = clamp((spokenTokens.length / Math.max(expectedMinTokens, 1)) * 100);
    if (lang === 'cn' || lang === 'zh') {
        const hasPronoun = ZH_PRONOUNS.some((unit) => spokenText.includes(unit));
        const hasVerb = ZH_VERBS.some((unit) => spokenText.includes(unit));
        const hasConnector = ZH_CONNECTORS.some((unit) => spokenText.includes(unit));
        grammarScore = clamp((hasPronoun ? 28 : 0) + (hasVerb ? 34 : 0) + (spokenTokens.length >= expectedMinTokens ? 24 : spokenTokens.length * 4) + (hasConnector ? 14 : 0));
    } else {
        const normalized = normalizeText(spokenText, lang);
        const hasPronoun = EN_PRONOUNS.some((unit) => spokenTokens.includes(unit));
        const hasVerb = EN_VERBS.some((unit) => spokenTokens.includes(unit));
        const hasConnector = EN_CONNECTORS.some((unit) => normalized.includes(unit));
        grammarScore = clamp((hasPronoun ? 28 : 0) + (hasVerb ? 34 : 0) + (spokenTokens.length >= expectedMinTokens ? 24 : spokenTokens.length * 4) + (hasConnector ? 14 : 0));
    }

    const deliveryScore = average([
        scoreFromFillerRatio(signals.fillerRatio),
        scoreFromSentenceControl(signals.sentenceCount, spokenTokens.length, lang),
    ]);

    const relevanceScore = average([
        signals.promptCoverage,
        signals.sampleCoverage,
        taskCompletion,
    ]);

    if (!spokenTokens.length) {
        taskCompletion = 0;
        grammarScore = 0;
    } else {
        taskCompletion = average([taskCompletion, signals.promptCoverage, signals.sampleCoverage || taskCompletion]);
    }

    const promptInsight = tip || promptText || 'Open-ended response coaching from transcript only.';
    const metrics = [
        createMetric('fluency', 'Fluency', fluencyScore,
            'Response pacing estimated from transcript length, duration, and filler load.',
            'Lưu loát', 'Nhịp nói ước tính từ độ dài câu trả lời, thời lượng và từ đệm.'),
        createMetric('grammar', 'Structure', grammarScore,
            'Sentence-frame control inferred from transcript patterns.',
            'Cấu trúc', 'Khả năng kiểm soát khung câu (chủ ngữ + động từ + bổ ngữ).'),
        createMetric('vocabulary', 'Vocabulary', lexicalScore,
            'Lexical variety and amount of meaningful content in the response.',
            'Từ vựng', 'Độ đa dạng từ vựng và lượng nội dung có ý nghĩa trong câu trả lời.'),
        createMetric('relevance', 'Relevance', relevanceScore,
            'How directly the response stays on the prompt and sample direction.',
            'Liên quan', 'Câu trả lời bám sát câu hỏi và hướng gợi ý đến mức nào.'),
        createMetric('delivery', 'Delivery', deliveryScore,
            'How smoothly the response flows without too many filler units.',
            'Trình bày', 'Câu trả lời trôi chảy đến đâu, ít từ đệm (ừm, à, ờ).'),
        createMetric('task_completion', 'Task', taskCompletion, promptInsight,
            'Nhiệm vụ', 'Trả lời đúng yêu cầu câu hỏi với ít nhất một chi tiết cụ thể.'),
    ];

    return {
        analysisType: 'open_response',
        metrics,
        overallScore: clamp(average(metrics.map((metric) => metric.score))),
        transcriptStats,
        referenceDiffs: [],
        referenceWordFeedback: [],
        signalBreakdown: signals,
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
        ? buildExactMetrics(targetText, normalizedSpoken, lang, durationMs, promptText, sampleAnswer)
        : buildOpenMetrics({
            promptText,
            spokenText: normalizedSpoken,
            lang,
            durationMs,
            sampleAnswer,
            expectedMinTokens,
            tip,
        });

    const recommendations = buildRecommendations(analytics.metrics, analytics.signalBreakdown, lang);
    const strengths = buildStrengths(analytics.metrics, lang);
    const risks = buildRisks(analytics.metrics, lang);
    const topMetric = [...analytics.metrics].sort((a, b) => b.score - a.score)[0];
    const lowMetric = [...analytics.metrics].sort((a, b) => a.score - b.score)[0];

    return {
        ...analytics,
        spokenText: normalizedSpoken,
        strengths,
        risks,
        recommendations,
        coachModel: targetText ? 'heuristic_reference_coaching' : 'heuristic_open_response_coaching',
        evidenceLevel: targetText
            ? bilingualSentence(
                'Reference-aligned transcript coaching',
                'Huấn luyện dựa trên bản ghi và câu mẫu tham chiếu',
                lang,
            )
            : bilingualSentence(
                'Prompt-aligned transcript coaching',
                'Huấn luyện dựa trên bản ghi và mức độ bám sát câu hỏi',
                lang,
            ),
        analysisSummary: topMetric && lowMetric
            ? `Strongest: ${topMetric.label} · Mạnh nhất: ${topMetric.labelVi || topMetric.label}. Focus: ${lowMetric.label} · Cần cải thiện: ${lowMetric.labelVi || lowMetric.label}.`
            : 'Transcript-derived speaking coaching. · Phân tích dựa trên bản ghi giọng nói.',
        note: targetText
            ? bilingualSentence(
                'Feedback is inferred from transcript alignment, pacing, filler load, and sentence stability. It is not acoustic phoneme scoring.',
                'Phản hồi được suy ra từ mức độ khớp transcript, nhịp nói, từ đệm và độ ổn định câu. Đây không phải chấm âm vị học âm thanh.',
                lang,
            )
            : bilingualSentence(
                'Feedback is inferred from transcript quality, pacing, relevance, filler load, and sentence-pattern heuristics. It is not model-based conversation scoring.',
                'Phản hồi được suy ra từ chất lượng transcript, nhịp nói, độ liên quan, từ đệm và heuristic về mẫu câu. Đây không phải chấm hội thoại bằng mô hình AI.',
                lang,
            ),
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
        coachModel: analytics.coachModel,
        evidenceLevel: analytics.evidenceLevel,
        strengths: analytics.strengths || [],
        risks: analytics.risks || [],
        transcriptStats: analytics.transcriptStats,
        signalBreakdown: analytics.signalBreakdown || null,
    };
}
