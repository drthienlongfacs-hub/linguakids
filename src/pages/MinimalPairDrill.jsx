// MinimalPairDrill — Train ears to distinguish similar-sounding English words
// Critical for pronunciation accuracy: ship/sheep, sit/set, bat/bet, etc.
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import StarBurst from '../components/StarBurst';
import { speakText } from '../utils/speakText';

const PAIRS = [
    { a: 'ship', b: 'sheep', ipa: '/ɪ/ vs /iː/', vi: 'tàu vs con cừu', tip: 'Short /ɪ/ (ship) vs Long /iː/ (sheep)' },
    { a: 'sit', b: 'seat', ipa: '/ɪ/ vs /iː/', vi: 'ngồi (ngắn) vs ghế', tip: 'Short /ɪ/ vs Long /iː/' },
    { a: 'bat', b: 'bet', ipa: '/æ/ vs /e/', vi: 'con dơi vs đặt cược', tip: 'Open /æ/ (bat) vs Mid /e/ (bet)' },
    { a: 'cat', b: 'cut', ipa: '/æ/ vs /ʌ/', vi: 'con mèo vs cắt', tip: '/æ/ mouth wide (cat) vs /ʌ/ relaxed (cut)' },
    { a: 'bed', b: 'bad', ipa: '/e/ vs /æ/', vi: 'giường vs tệ', tip: 'Mid /e/ (bed) vs Open /æ/ (bad)' },
    { a: 'fit', b: 'feet', ipa: '/ɪ/ vs /iː/', vi: 'vừa vs bàn chân', tip: 'Short vowel vs Long vowel' },
    { a: 'pull', b: 'pool', ipa: '/ʊ/ vs /uː/', vi: 'kéo vs hồ bơi', tip: 'Short /ʊ/ vs Long /uː/' },
    { a: 'live', b: 'leave', ipa: '/ɪ/ vs /iː/', vi: 'sống vs rời đi', tip: 'Short (live) vs Long (leave)' },
    { a: 'hat', b: 'hut', ipa: '/æ/ vs /ʌ/', vi: 'nón vs túp lều', tip: 'Wide mouth (hat) vs Relaxed (hut)' },
    { a: 'pen', b: 'pan', ipa: '/e/ vs /æ/', vi: 'bút vs chảo', tip: 'Mid tongue (pen) vs Low tongue (pan)' },
    { a: 'right', b: 'light', ipa: '/r/ vs /l/', vi: 'đúng vs ánh sáng', tip: 'Tongue curled (right) vs Tongue forward (light)' },
    { a: 'rice', b: 'lice', ipa: '/r/ vs /l/', vi: 'gạo vs chấy', tip: '/r/ tongue back vs /l/ tongue front' },
    { a: 'think', b: 'sink', ipa: '/θ/ vs /s/', vi: 'nghĩ vs bồn rửa', tip: 'Tongue between teeth (think) vs Behind teeth (sink)' },
    { a: 'three', b: 'tree', ipa: '/θr/ vs /tr/', vi: 'ba vs cây', tip: 'Th sound (three) vs T sound (tree)' },
    { a: 'vest', b: 'west', ipa: '/v/ vs /w/', vi: 'áo ghi-lê vs phía tây', tip: 'Teeth on lip (vest) vs Rounded lips (west)' },
];

function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[b[i], b[j]] = [b[j], b[i]]; } return b; }
const TOTAL = 8;

export default function MinimalPairDrill() {
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const [pairs] = useState(() => shuffle(PAIRS).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [target, setTarget] = useState(null); // which word was spoken
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [celebration, setCelebration] = useState(0);
    const [complete, setComplete] = useState(false);
    const [phase, setPhase] = useState('listen'); // listen | answer

    const pair = pairs[idx];

    const speak = useCallback((text, rate = 0.8) => {
        speakText(text, { lang: 'en-US', rate });
    }, []);

    const playRandom = () => {
        const word = Math.random() < 0.5 ? pair.a : pair.b;
        setTarget(word);
        speak(word);
        setPhase('answer');
        setSelected(null);
    };

    const handleSelect = (word) => {
        setSelected(word);
        if (word === target) { setScore(s => s + 1); addXP(10); setCelebration(c => c + 1); }
    };

    const next = () => {
        if (idx + 1 >= TOTAL) setComplete(true);
        else { setIdx(i => i + 1); setPhase('listen'); setTarget(null); setSelected(null); }
    };

    if (complete) {
        const pct = Math.round((score / TOTAL) * 100);
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem' }}>{pct >= 80 ? '👂' : '💪'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Listening Accuracy</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: pct >= 70 ? '#22C55E' : '#F59E0B' }}>{score}/{TOTAL} ({pct}%)</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '16px auto' }}>
                    <button className="btn btn--primary btn--block" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/')}>🏠 Home</button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">👂 Minimal Pairs</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>
            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: 'var(--gradient-english)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            {/* Pair display */}
            <div style={{ margin: '16px 0', padding: '20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 700, marginBottom: '6px' }}>🔊 Phân biệt cặp phát âm:</div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{pair.a}</div>
                        <button onClick={() => speak(pair.a)} style={{ fontSize: '0.7rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '2px 10px', cursor: 'pointer', marginTop: '4px' }}>🔊</button>
                    </div>
                    <div style={{ fontSize: '1.2rem', color: 'var(--color-text-light)', alignSelf: 'center' }}>vs</div>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{pair.b}</div>
                        <button onClick={() => speak(pair.b)} style={{ fontSize: '0.7rem', background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', padding: '2px 10px', cursor: 'pointer', marginTop: '4px' }}>🔊</button>
                    </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{pair.ipa} — {pair.vi}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontStyle: 'italic', marginTop: '4px' }}>💡 {pair.tip}</div>
            </div>

            {phase === 'listen' && (
                <div style={{ textAlign: 'center' }}>
                    <button onClick={playRandom} className="btn btn--primary btn--large" style={{ width: '100px', height: '100px', borderRadius: '50%', fontSize: '2.5rem' }}>🔊</button>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginTop: '8px' }}>Bấm nghe → nhận diện từ nào!</p>
                </div>
            )}

            {phase === 'answer' && (
                <div>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px' }}>🎯 Bạn nghe từ nào?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        {[pair.a, pair.b].map(word => {
                            const isCorrect = word === target;
                            const isSelected = selected === word;
                            let bg = 'var(--color-card)', border = '2px solid var(--color-border)';
                            if (selected !== null) {
                                if (isCorrect) { bg = '#22C55E15'; border = '2px solid #22C55E'; }
                                else if (isSelected) { bg = '#EF444415'; border = '2px solid #EF4444'; }
                            }
                            return (
                                <button key={word} onClick={() => !selected && handleSelect(word)} disabled={selected !== null}
                                    style={{ padding: '20px', borderRadius: 'var(--radius-lg)', border, background: bg, cursor: selected ? 'default' : 'pointer', fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-text)' }}>
                                    {selected !== null && isCorrect && '✅ '}{selected !== null && isSelected && !isCorrect && '❌ '}{word}
                                </button>
                            );
                        })}
                    </div>
                    {selected !== null && (
                        <div style={{ marginTop: '10px' }}>
                            <button onClick={() => speak(target)} className="btn btn--outline" style={{ marginRight: '8px' }}>🔊 Nghe lại</button>
                            <button onClick={next} className="btn btn--primary">
                                {idx + 1 >= TOTAL ? '📊 Kết quả' : '➡️ Cặp tiếp'}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
