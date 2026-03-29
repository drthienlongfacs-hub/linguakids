const STORAGE_KEY = 'linguakids_video_lesson_telemetry_v1';

function readState() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function recordVideoLessonTelemetry(eventName, payload = {}) {
    const state = readState();
    const next = {
        ...state,
        updatedAt: new Date().toISOString(),
        counters: {
            public_lesson_open: 0,
            video_source_error: 0,
            video_source_playable: 0,
            subtitle_toggle: 0,
            quiz_start: 0,
            quiz_complete: 0,
            ...state.counters,
        },
        recentEvents: Array.isArray(state.recentEvents) ? state.recentEvents : [],
    };

    next.counters[eventName] = (next.counters[eventName] || 0) + 1;
    next.recentEvents = [
        {
            eventName,
            payload,
            at: next.updatedAt,
        },
        ...next.recentEvents,
    ].slice(0, 30);

    writeState(next);
}

export function getVideoLessonTelemetrySummary() {
    const state = readState();
    const counters = {
        public_lesson_open: 0,
        video_source_error: 0,
        video_source_playable: 0,
        subtitle_toggle: 0,
        quiz_start: 0,
        quiz_complete: 0,
        ...(state.counters || {}),
    };
    const sourceAttempts = counters.video_source_error + counters.video_source_playable;
    const sourceErrorRate = sourceAttempts > 0 ? counters.video_source_error / sourceAttempts : null;
    const quizCompletionRate = counters.quiz_start > 0 ? counters.quiz_complete / counters.quiz_start : null;
    const subtitleToggleRate = counters.public_lesson_open > 0 ? counters.subtitle_toggle / counters.public_lesson_open : null;

    return {
        updatedAt: state.updatedAt || null,
        counters,
        rates: {
            video_source_error_rate: sourceErrorRate,
            quiz_complete_rate: quizCompletionRate,
            subtitle_toggle_rate: subtitleToggleRate,
        },
        recentEvents: Array.isArray(state.recentEvents) ? state.recentEvents : [],
    };
}
