import { FREE_SPEAKING_SCENARIOS } from './freeSpeakingCoachScenarios.js';

export const FREE_SPEAKING_VOICE_PACK_CONFIG = {
    'daily-small-talk': {
        voice: 'en-US-JennyNeural',
        voiceLabel: 'Jenny Neural',
        speakerKey: 'en-US-JennyNeural',
        variantMode: 'distinct_speaker',
        rate: '-4%',
        pitch: '+0Hz',
        volume: '+0%',
    },
    'job-interview-brief': {
        voice: 'en-GB-RyanNeural',
        voiceLabel: 'Ryan Neural',
        speakerKey: 'en-GB-RyanNeural',
        variantMode: 'distinct_speaker',
        rate: '-6%',
        pitch: '-1Hz',
        volume: '+0%',
    },
    'travel-help': {
        voice: 'en-AU-NatashaNeural',
        voiceLabel: 'Natasha Neural',
        speakerKey: 'en-AU-NatashaNeural',
        variantMode: 'distinct_speaker',
        rate: '-4%',
        pitch: '+0Hz',
        volume: '+0%',
    },
    'self-intro-cn': {
        voice: 'zh-CN-XiaoxiaoNeural',
        voiceLabel: 'Xiaoxiao Neural',
        speakerKey: 'zh-CN-XiaoxiaoNeural',
        variantMode: 'distinct_speaker',
        rate: '-10%',
        pitch: '+0Hz',
        volume: '+0%',
    },
    'ordering-cn': {
        voice: 'zh-CN-YunxiNeural',
        voiceLabel: 'Yunxi Neural',
        speakerKey: 'zh-CN-YunxiNeural',
        variantMode: 'distinct_speaker',
        rate: '-8%',
        pitch: '+0Hz',
        volume: '+0%',
    },
};

export function getFreeSpeakingStarterClipId() {
    return 'starter';
}

export function getFreeSpeakingClosingClipId() {
    return 'closing';
}

export function getFreeSpeakingPromptClipId(turnId) {
    return `${turnId}__prompt`;
}

export function getFreeSpeakingDefaultReplyClipId(turnId) {
    return `${turnId}__default-reply`;
}

export function getFreeSpeakingFollowUpClipId(turnId, followUpIndex) {
    return `${turnId}__followup-${followUpIndex + 1}`;
}

export function buildFreeSpeakingAudioBlueprint() {
    return FREE_SPEAKING_SCENARIOS.map((scenario) => ({
        scenarioId: scenario.id,
        lang: scenario.coachVoiceLang,
        voice: FREE_SPEAKING_VOICE_PACK_CONFIG[scenario.id],
        clips: [
            { id: getFreeSpeakingStarterClipId(), text: scenario.starter, kind: 'starter' },
            ...scenario.turns.flatMap((turn) => ([
                { id: getFreeSpeakingPromptClipId(turn.id), text: turn.prompt, kind: 'prompt', turnId: turn.id },
                { id: getFreeSpeakingDefaultReplyClipId(turn.id), text: turn.defaultReply, kind: 'default-reply', turnId: turn.id },
                ...(turn.followUps || []).map((followUp, index) => ({
                    id: getFreeSpeakingFollowUpClipId(turn.id, index),
                    text: followUp.reply,
                    kind: 'followup',
                    turnId: turn.id,
                })),
            ])),
            { id: getFreeSpeakingClosingClipId(), text: scenario.closing, kind: 'closing' },
        ],
    }));
}

export const FREE_SPEAKING_AUDIO_EXPECTED_CLIP_COUNT = buildFreeSpeakingAudioBlueprint()
    .reduce((sum, scenario) => sum + scenario.clips.length, 0);
