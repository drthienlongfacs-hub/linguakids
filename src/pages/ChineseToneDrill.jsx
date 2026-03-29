// ChineseToneDrill — Practice Chinese tones (4 tones + neutral)
// Uses SpeechSynthesis with zh-CN for native-quality tone modeling
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';
import { speakText } from '../utils/speakText';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

const TONE_INFO = [
    { tone: 1, mark: 'ā', name: 'High flat', nameVi: 'Thanh cao bằng', color: '#3B82F6', visual: '—' },
    { tone: 2, mark: 'á', name: 'Rising', nameVi: 'Thanh lên', color: '#10B981', visual: '/' },
    { tone: 3, mark: 'ǎ', name: 'Dipping', nameVi: 'Thanh xuống lên', color: '#F59E0B', visual: 'V' },
    { tone: 4, mark: 'à', name: 'Falling', nameVi: 'Thanh xuống', color: '#EF4444', visual: '\\' },
];

const EXERCISES = [
    { pinyin: 'mā', char: '妈', meaning: 'mother / mẹ', tone: 1 },
    { pinyin: 'má', char: '麻', meaning: 'hemp / gai', tone: 2 },
    { pinyin: 'mǎ', char: '马', meaning: 'horse / ngựa', tone: 3 },
    { pinyin: 'mà', char: '骂', meaning: 'scold / mắng', tone: 4 },
    { pinyin: 'shī', char: '师', meaning: 'teacher / thầy', tone: 1 },
    { pinyin: 'shí', char: '十', meaning: 'ten / mười', tone: 2 },
    { pinyin: 'shǐ', char: '史', meaning: 'history / lịch sử', tone: 3 },
    { pinyin: 'shì', char: '是', meaning: 'is / là', tone: 4 },
    { pinyin: 'bā', char: '八', meaning: 'eight / tám', tone: 1 },
    { pinyin: 'bá', char: '拔', meaning: 'pull / nhổ', tone: 2 },
    { pinyin: 'bǎ', char: '把', meaning: 'hold / giữ', tone: 3 },
    { pinyin: 'bà', char: '爸', meaning: 'father / bố', tone: 4 },
    { pinyin: 'tāng', char: '汤', meaning: 'soup / canh', tone: 1 },
    { pinyin: 'táng', char: '糖', meaning: 'sugar / đường', tone: 2 },
    { pinyin: 'tǎng', char: '躺', meaning: 'lie down / nằm', tone: 3 },
    { pinyin: 'tàng', char: '趟', meaning: 'trip / lần', tone: 4 },
    { pinyin: 'fēi', char: '飞', meaning: 'fly / bay', tone: 1 },
    { pinyin: 'féi', char: '肥', meaning: 'fat / béo', tone: 2 },
    { pinyin: 'fěi', char: '匪', meaning: 'bandit / tặc', tone: 3 },
    { pinyin: 'fèi', char: '费', meaning: 'cost / phí', tone: 4 },
];

function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }

const TOTAL = 10;

export default function ChineseToneDrill() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [exercises] = useState(() => shuffle(EXERCISES).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [phase, setPhase] = useState('listen'); // listen | identify | speak
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);
    const [listening, setListening] = useState(false);
    const [spoken, setSpoken] = useState('');

    const ex = exercises[idx];

    const speak = useCallback((text, rate = 0.7) => {
        speakText(text, { lang: 'zh-CN', rate });
    }, []);

    const handleToneSelect = (tone) => {
        setSelected(tone);
        if (tone === ex.tone) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
    };

    const startSpeaking = useCallback(() => {
        if (!SpeechRecognition) return;
        setSpoken('');
        const rec = new SpeechRecognition();
        rec.lang = 'zh-CN'; rec.continuous = false; rec.interimResults = false;
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript;
            setSpoken(transcript);
            if (transcript.includes(ex.char)) { addXP(15); setCelebration(c => c + 1); setScore(s => s + 1); }
            setListening(false);
        };
        rec.onerror = () => setListening(false);
        rec.onend = () => setListening(false);
        rec.start(); setListening(true);
    }, [ex]);

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setPhase('listen'); setSelected(null); setSpoken(''); }
    };

    if (complete) {
        const pct = Math.round((score / (TOTAL * 2)) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>🏮</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Tone Master</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{pct}%</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    const toneInfo = TONE_INFO.find(t => t.tone === ex.tone);

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🏮 Tone Drill</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: '#EF4444' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            {/* Character display */}
            <div style={{ textAlign: 'center', margin: '16px 0', padding: '24px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '6px' }}>{ex.char}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: toneInfo?.color }}>{ex.pinyin}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{ex.meaning}</div>
                <button onClick={() => speak(ex.char)} style={{ marginTop: '10px', padding: '8px 20px', borderRadius: 'var(--radius-full)', background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 700 }}>🔊 Nghe</button>
            </div>

            {phase === 'listen' && (
                <div>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>🎯 Chọn thanh điệu đúng:</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {TONE_INFO.map(t => {
                            const isCorrect = t.tone === ex.tone;
                            const isSelected = selected === t.tone;
                            let bg = `${t.color}10`, border = `2px solid ${t.color}30`;
                            if (selected !== null) {
                                if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                                else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                            }
                            return (
                                <button key={t.tone} onClick={() => selected === null && handleToneSelect(t.tone)} disabled={selected !== null}
                                    style={{ padding: '14px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t.visual}</div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: t.color }}>Tone {t.tone}</div>
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>{t.nameVi}</div>
                                    {selected !== null && isCorrect && <div style={{ color: '#22C55E', fontWeight: 700, marginTop: '2px' }}>✅</div>}
                                </button>
                            );
                        })}
                    </div>
                    {selected !== null && (
                        <button className="btn btn--primary btn--block" style={{ marginTop: '12px' }} onClick={() => setPhase('speak')}>🎙️ Bây giờ nói theo</button>
                    )}
                </div>
            )}

            {phase === 'speak' && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>🎙️ Nói theo: <strong style={{ color: toneInfo?.color }}>{ex.pinyin}</strong></p>
                    <button onClick={startSpeaking} disabled={listening}
                        style={{
                            width: '80px', height: '80px', borderRadius: '50%', border: 'none',
                            background: listening ? '#EF4444' : '#DC2626', color: 'white', fontSize: '2rem',
                            cursor: 'pointer', boxShadow: listening ? '0 0 0 8px #EF444440' : '0 0 0 8px #DC262630',
                            animation: listening ? 'pulse 1.2s infinite' : 'none',
                        }}>{listening ? '⏹️' : '🎙️'}</button>
                    {spoken && (
                        <div style={{ marginTop: '10px', padding: '10px', borderRadius: 'var(--radius-lg)', background: spoken.includes(ex.char) ? '#22C55E10' : '#F59E0B10', border: `2px solid ${spoken.includes(ex.char) ? '#22C55E' : '#F59E0B'}` }}>
                            <div style={{ fontSize: '1.2rem' }}>{spoken.includes(ex.char) ? '✅ Chính xác!' : '💪 Thử lại!'}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>Nhận dạng: "{spoken}"</div>
                        </div>
                    )}
                    <button className="btn btn--primary btn--block" style={{ marginTop: '12px' }} onClick={next}>
                        {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}
