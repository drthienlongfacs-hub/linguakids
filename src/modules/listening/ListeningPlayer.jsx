import { useState, useRef, useEffect, useCallback } from 'react';

// Custom audio player with speed control, transcript sync, A/B loop
export default function ListeningPlayer({ segments, onSegmentChange }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [speed, setSpeed] = useState(1);
    const [showTranscript, setShowTranscript] = useState(true);
    const [showTranslation, setShowTranslation] = useState(false);
    const [loopSegment, setLoopSegment] = useState(null);
    const [activeSegmentId, setActiveSegmentId] = useState(null);

    // We use Web Speech API's SpeechSynthesis for TTS since we don't have real audio files
    const utteranceRef = useRef(null);
    const timerRef = useRef(null);
    const segmentIndexRef = useRef(0);

    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

    const totalDuration = segments.length > 0
        ? segments[segments.length - 1].endTime
        : 0;

    // Simulate playback using SpeechSynthesis
    const speakSegment = useCallback((index) => {
        if (index >= segments.length) {
            setIsPlaying(false);
            setCurrentTime(0);
            segmentIndexRef.current = 0;
            return;
        }

        window.speechSynthesis.cancel();
        const seg = segments[index];
        setActiveSegmentId(seg.id);
        setCurrentTime(seg.startTime);
        onSegmentChange?.(seg.id);

        const utterance = new SpeechSynthesisUtterance(seg.text);
        utterance.lang = 'en-US';
        utterance.rate = speed;
        utterance.pitch = 1;

        // Try to find a good English voice
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Samantha'))
            || voices.find(v => v.lang.startsWith('en-US'))
            || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) utterance.voice = enVoice;

        utterance.onend = () => {
            if (loopSegment === index) {
                speakSegment(index); // loop same segment
            } else {
                segmentIndexRef.current = index + 1;
                speakSegment(index + 1);
            }
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);

        // Update time progress
        const segDuration = (seg.endTime - seg.startTime) / speed;
        const startMs = Date.now();
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            const elapsed = (Date.now() - startMs) / 1000;
            const progress = Math.min(elapsed / segDuration, 1);
            setCurrentTime(seg.startTime + progress * (seg.endTime - seg.startTime));
        }, 100);
    }, [segments, speed, loopSegment, onSegmentChange]);

    const handlePlay = () => {
        if (isPlaying) {
            window.speechSynthesis.cancel();
            clearInterval(timerRef.current);
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            speakSegment(segmentIndexRef.current);
        }
    };

    const handleSegmentClick = (index) => {
        window.speechSynthesis.cancel();
        clearInterval(timerRef.current);
        segmentIndexRef.current = index;
        if (isPlaying) {
            speakSegment(index);
        } else {
            setActiveSegmentId(segments[index].id);
            setCurrentTime(segments[index].startTime);
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
            window.speechSynthesis.cancel();
            clearInterval(timerRef.current);
        };
    }, []);

    const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

    return (
        <div className="listening-player">
            {/* Control Bar */}
            <div className="lp-controls">
                <button className="lp-play-btn" onClick={handlePlay}>
                    {isPlaying ? '⏸️' : '▶️'}
                </button>

                <div className="lp-progress-wrapper">
                    <div className="lp-progress-bar">
                        <div className="lp-progress-fill" style={{ width: `${progressPercent}%` }} />
                    </div>
                    <span className="lp-time">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                    </span>
                </div>

                <button className="lp-speed-btn" onClick={handleSpeedChange}>
                    {speed}x
                </button>
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
