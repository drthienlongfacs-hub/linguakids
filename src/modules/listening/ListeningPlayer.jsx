import { useState, useRef, useEffect, useCallback } from 'react'; // useEffect used for cleanup
import { recordCapabilityEvent } from '../../services/capabilityService';

// Custom audio player with speed control, transcript sync, A/B loop
export default function ListeningPlayer({
    segments,
    onSegmentChange,
    langCode = 'en-US',
    showPinyin = false,
    audioManifest = null,
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [showTranscript, setShowTranscript] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [loopSegment, setLoopSegment] = useState(null);
    const [activeSegmentId, setActiveSegmentId] = useState(null);
    const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

    // We use Web Speech API's SpeechSynthesis for TTS since we don't have real audio files
    const utteranceRef = useRef(null);
    const timerRef = useRef(null);
    const segmentIndexRef = useRef(0);
    const audioRef = useRef(null);

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const controlledSegments = audioManifest?.segments || {};
    const hasControlledAudio = Object.keys(controlledSegments).length > 0;

    const totalDuration = segments.length > 0
        ? segments[segments.length - 1].endTime
        : 0;

    const stopPlaybackState = useCallback(() => {
        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        clearInterval(timerRef.current);
        setIsPlaying(false);
    }, []);

    function playControlledSegment(index) {
        if (index >= segments.length) {
            setIsPlaying(false);
            setCurrentTime(0);
            segmentIndexRef.current = 0;
            return;
        }

        const seg = segments[index];
        const source = controlledSegments[String(seg.id)];
        if (!source) {
            speakSegment(index);
            return;
        }

        window.speechSynthesis.cancel();
        const audio = new Audio(source);
        audioRef.current = audio;
        audio.playbackRate = speed;
        setActiveSegmentId(seg.id);
        setCurrentTime(seg.startTime);
        setCurrentSegmentIndex(index);
        onSegmentChange?.(seg.id);
        recordCapabilityEvent('listening_playback_started', {
            source: 'controlled_audio',
            lang: langCode,
            segmentId: seg.id,
        });

        audio.ontimeupdate = () => {
            const duration = audio.duration || 0;
            if (duration > 0) {
                const progress = Math.min(audio.currentTime / duration, 1);
                setCurrentTime(seg.startTime + progress * (seg.endTime - seg.startTime));
            }
        };

        audio.onended = () => {
            if (loopSegment === index) {
                playControlledSegment(index);
            } else {
                segmentIndexRef.current = index + 1;
                playSegment(index + 1);
            }
        };

        audio.onerror = () => {
            recordCapabilityEvent('listening_playback_error', {
                source: 'controlled_audio',
                lang: langCode,
                segmentId: seg.id,
            });
            speakSegment(index);
        };

        audio.play().catch(() => {
            recordCapabilityEvent('listening_playback_error', {
                source: 'controlled_audio',
                lang: langCode,
                segmentId: seg.id,
            });
            speakSegment(index);
        });
    }

    // Simulate playback using SpeechSynthesis
    function speakSegment(index) {
        if (index >= segments.length) {
            setIsPlaying(false);
            setCurrentTime(0);
            segmentIndexRef.current = 0;
            return;
        }

        window.speechSynthesis.cancel();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = '';
            audioRef.current = null;
        }
        const seg = segments[index];
        setActiveSegmentId(seg.id);
        setCurrentTime(seg.startTime);
        setCurrentSegmentIndex(index);
        onSegmentChange?.(seg.id);
        recordCapabilityEvent('listening_playback_started', {
            source: 'browser_tts',
            lang: langCode,
            segmentId: seg.id,
        });

        const utterance = new SpeechSynthesisUtterance(seg.text);
        utterance.lang = langCode;
        utterance.rate = speed;
        utterance.pitch = 1.02; // Slightly above 1.0 for warmth

        // Enhanced voice matching — try multiple platform-specific names
        const voices = window.speechSynthesis.getVoices();
        const langBase = langCode.split('-')[0];
        const langRegion = langCode.split('-')[1] || '';

        // Priority voice name lists per language
        const voiceHints = {
            'en': ['Samantha', 'Aaron', 'Allison', 'Google US English', 'Google UK English Female', 'Daniel', 'Serena', 'Karen'],
            'zh': ['Ting-Ting', 'Mei-Jia', 'Google 普通话', 'Google 中文', 'Microsoft Xiaoxiao'],
            'vi': ['Linh', 'Google Tiếng Việt', 'Microsoft HoaiMy'],
        };

        let preferredVoice = null;
        // 1. Try exact language match
        preferredVoice = voices.find(v => v.lang === langCode);
        // 2. Try hint names
        if (!preferredVoice && voiceHints[langBase]) {
            for (const hint of voiceHints[langBase]) {
                const found = voices.find(v => v.name.includes(hint) && v.lang.startsWith(langBase));
                if (found) { preferredVoice = found; break; }
            }
        }
        // 3. Enhanced/premium/local voices
        if (!preferredVoice) {
            const langVoices = voices.filter(v => v.lang.startsWith(langBase));
            preferredVoice = langVoices.find(v => v.name.toLowerCase().includes('enhanced') || v.name.toLowerCase().includes('natural'))
                || langVoices.find(v => v.localService)
                || langVoices[0];
        }

        if (preferredVoice) {
            utterance.voice = preferredVoice;
            utterance.lang = preferredVoice.lang;
        }

        utterance.onend = () => {
            if (loopSegment === index) {
                playSegment(index);
            } else {
                segmentIndexRef.current = index + 1;
                playSegment(index + 1);
            }
        };
        utterance.onerror = () => {
            recordCapabilityEvent('listening_playback_error', {
                source: 'browser_tts',
                lang: langCode,
                segmentId: seg.id,
            });
            setIsPlaying(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        // Update time progress
        const segDuration = (seg.endTime - seg.startTime) / speed;
        let elapsed = 0;
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            elapsed += 0.1;
            const progress = Math.min(elapsed / segDuration, 1);
            setCurrentTime(seg.startTime + progress * (seg.endTime - seg.startTime));
        }, 100);
    }

    function playSegment(index) {
        if (controlledSegments[String(segments[index]?.id)]) {
            playControlledSegment(index);
            return;
        }
        speakSegment(index);
    }

    const handlePlay = () => {
        if (isPlaying) {
            stopPlaybackState();
        } else {
            setIsPlaying(true);
            playSegment(segmentIndexRef.current);
        }
    };

    const handleSegmentClick = (index) => {
        stopPlaybackState();
        segmentIndexRef.current = index;
        if (isPlaying) {
            setIsPlaying(true);
            playSegment(index);
        } else {
            setActiveSegmentId(segments[index].id);
            setCurrentTime(segments[index].startTime);
            setCurrentSegmentIndex(index);
        }
    };

    const handleSpeedChange = () => {
        const idx = speeds.indexOf(speed);
        const nextSpeed = speeds[(idx + 1) % speeds.length];
        setSpeed(nextSpeed);
    };

    const toggleLoop = (index) => {
        setLoopSegment(loopSegment === index ? null : index);
    };

    useEffect(() => {
        // Load voices
        window.speechSynthesis.getVoices();
        return () => {
            stopPlaybackState();
        };
    }, [stopPlaybackState]);

    const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

    return (
        <div className="listening-player">
            {/* Waveform Visualization */}
            {isPlaying && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    gap: '3px', height: '40px', marginBottom: '12px',
                }}>
                    {Array.from({ length: 20 }, (_, i) => (
                        <div key={i} style={{
                            width: '4px', borderRadius: '4px',
                            background: 'var(--gradient-listening)',
                            animation: `waveBar 0.8s ease-in-out ${i * 0.04}s infinite alternate`,
                            height: `${12 + (i % 6) * 5}px`,
                        }} />
                    ))}
                </div>
            )}

            {/* Control Bar */}
            <div className="lp-controls">
                <button className="lp-play-btn" onClick={handlePlay}>
                    {isPlaying ? '⏸️' : '▶️'}
                </button>

                <div className="lp-progress-wrapper">
                    <div className="lp-progress-bar">
                        <div className="lp-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="lp-time">
                            {formatTime(currentTime)} / {formatTime(totalDuration)}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>
                            {currentSegmentIndex + 1}/{segments.length}
                        </span>
                    </div>
                </div>

                <button className="lp-speed-btn" onClick={handleSpeedChange}>
                    {speed}x
                </button>
            </div>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '10px',
                fontSize: '0.72rem',
                color: 'var(--color-text-light)',
            }}>
                <span>
                    Source: {hasControlledAudio ? 'Controlled audio pack' : 'Browser TTS'}
                </span>
                <span>
                    {hasControlledAudio ? 'Consistent cross-device playback' : 'Quality depends on browser voice'}
                </span>
            </div>

            {/* Toggle buttons */}
            <div className="lp-toggles">
                <button
                    className={`lp-toggle ${showTranscript ? 'active' : ''}`}
                    onClick={() => setShowTranscript(!showTranscript)}
                >
                    📝 Transcript
                </button>
                <button
                    className={`lp-toggle ${showTranslation ? 'active' : ''}`}
                    onClick={() => setShowTranslation(!showTranslation)}
                >
                    🇻🇳 Dịch
                </button>
            </div>

            {/* Transcript */}
            {showTranscript && (
                <div className="lp-transcript">
                    {segments.map((seg, idx) => (
                        <div
                            key={seg.id}
                            className={`lp-segment ${activeSegmentId === seg.id ? 'active' : ''}`}
                            onClick={() => handleSegmentClick(idx)}
                        >
                            <div className="lp-segment-header">
                                <span className="lp-segment-time">{formatTime(seg.startTime)}</span>
                                <button
                                    className={`lp-loop-btn ${loopSegment === idx ? 'active' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleLoop(idx); }}
                                    title={loopSegment === idx ? 'Tắt lặp' : 'Lặp đoạn này'}
                                >
                                    🔁
                                </button>
                            </div>
                            <p className="lp-segment-text">{seg.text}</p>
                            {showPinyin && seg.pinyin && (
                                <p
                                    className="lp-segment-translation"
                                    style={{ color: '#8B5CF6', marginBottom: showTranslation && seg.textVi ? '4px' : 0 }}
                                >
                                    {seg.pinyin}
                                </p>
                            )}
                            {showTranslation && seg.textVi && (
                                <p className="lp-segment-translation">{seg.textVi}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}
