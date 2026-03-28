// PronunciationLab — Real-time pronunciation practice with Web Speech API feedback
// Leverages free SpeechRecognition + SpeechSynthesis APIs for native-teacher experience
import { useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ALL_ENGLISH_WORDS } from '../data/english';
import { ALL_CHINESE_WORDS } from '../data/chinese';
import { useGame } from '../context/GameStateContext';
import { usePracticeLexicon } from '../hooks/usePracticeLexicon';
import { isAdultMode } from '../utils/userMode';
import StarBurst from '../components/StarBurst';

function shuffle(arr) {
    const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a;
}

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

function getScore(target, spoken) {
    const t = target.toLowerCase().trim();
    const s = spoken.toLowerCase().trim();
    if (t === s) return 100;
    // Levenshtein-based similarity
    const len = Math.max(t.length, s.length);
    if (len === 0) return 100;
    const dp = Array.from({ length: t.length + 1 }, (_, i) => {
        const row = Array(s.length + 1).fill(0);
        row[0] = i; return row;
    });
    for (let j = 0; j <= s.length; j++) dp[0][j] = j;
    for (let i = 1; i <= t.length; i++)
        for (let j = 1; j <= s.length; j++)
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (t[i - 1] !== s[j - 1] ? 1 : 0));
    return Math.max(0, Math.round((1 - dp[t.length][s.length] / len) * 100));
}

function scoreColor(score) {
    if (score >= 90) return '#22C55E';
    if (score >= 70) return '#F59E0B';
    if (score >= 50) return '#EF4444';
    return '#94A3B8';
}

function scoreEmoji(score) {
    if (score >= 90) return '🌟';
    if (score >= 70) return '👍';
    if (score >= 50) return '💪';
    return '🔄';
}

const TOTAL = 8;

export default function PronunciationLab() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const { addXP, state } = useGame();
    const isEN = lang !== 'cn';
    const adult = isAdultMode(state.userMode);
    const { items: allWords, loading: lexiconLoading, sourceLabel } = usePracticeLexicon({
        lang,
        adult,
        fallbackEnglish: ALL_ENGLISH_WORDS,
        fallbackChinese: ALL_CHINESE_WORDS,
    });
    const sessionKey = `${lang}:${sourceLabel}:${allWords.length}:${allWords[0]?.id || allWords[0]?.word || allWords[0]?.character || 'empty'}`;

    if (lexiconLoading || allWords.length === 0) {
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
                <div className="mascot__character">🎙️</div>
                <p style={{ fontFamily: 'var(--font-display)', marginTop: '16px' }}>
                    {adult ? 'Đang tải ngân hàng dữ liệu chuẩn...' : 'Đang chuẩn bị...'}
                </p>
            </div>
        );
    }

    return (
        <PronunciationSession
            key={sessionKey}
            addXP={addXP}
            allWords={allWords}
            isEN={isEN}
            navigate={navigate}
            sourceLabel={sourceLabel}
            state={state}
        />
    );
}

function PronunciationSession({ addXP, allWords, isEN, navigate, sourceLabel, state }) {
    const [words] = useState(() => shuffle(allWords).slice(0, TOTAL));
    const [idx, setIdx] = useState(0);
    const [listening, setListening] = useState(false);
    const [spoken, setSpoken] = useState('');
    const [score, setScore] = useState(null);
    const [results, setResults] = useState([]);
    const [complete, setComplete] = useState(false);
    const [celebration, setCelebration] = useState(0);
    const [error, setError] = useState('');
    const recognizerRef = useRef(null);

    const speak = useCallback((text) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isEN ? 'en-US' : 'zh-CN';
        utterance.rate = 0.85;
        window.speechSynthesis.speak(utterance);
    }, [isEN]);

    function startListening() {
        if (!SpeechRecognition) {
            setError('Trình duyệt không hỗ trợ Speech Recognition. Dùng Chrome/Edge.');
            return;
        }

        setError('');
        setSpoken('');
        setScore(null);
        const rec = new SpeechRecognition();
        rec.lang = isEN ? 'en-US' : 'zh-CN';
        rec.continuous = false;
        rec.interimResults = false;
        rec.maxAlternatives = 1;

        rec.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const currentWord = words[idx];
            const target = isEN ? currentWord.word : currentWord.character;
            const nextScore = getScore(target, transcript);

            setSpoken(transcript);
            setScore(nextScore);

            if (nextScore >= 70) {
                addXP(nextScore >= 90 ? 15 : 10);
                setCelebration((value) => value + 1);
            }

            setResults((previous) => [...previous, { target, spoken: transcript, score: nextScore }]);
            setListening(false);
        };

        rec.onerror = (event) => {
            if (event.error === 'no-speech') setError('Không nghe thấy. Thử lại?');
            else setError(`Lỗi: ${event.error}`);
            setListening(false);
        };

        rec.onend = () => setListening(false);
        recognizerRef.current = rec;
        rec.start();
        setListening(true);
    }

    function next() {
        if (idx + 1 >= TOTAL) {
            setComplete(true);
        } else {
            setIdx((value) => value + 1);
            setSpoken('');
            setScore(null);
            setError('');
        }
    }

    if (complete) {
        const avg = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0;
        const perfect = results.filter(r => r.score >= 90).length;
        return (
            <div className="page" style={{ textAlign: 'center', paddingTop: '50px' }}>
                <StarBurst trigger={celebration} />
                <div style={{ fontSize: '5rem', marginBottom: '12px' }}>{avg >= 80 ? '🏆' : avg >= 60 ? '💪' : '📚'}</div>
                <h2 style={{ fontFamily: 'var(--font-display)' }}>Kết quả phát âm</h2>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: scoreColor(avg) }}>{avg}%</p>
                <p style={{ color: 'var(--color-text-light)' }}>
                    🌟 {perfect}/{TOTAL} hoàn hảo · +{results.reduce((a, r) => a + (r.score >= 90 ? 15 : r.score >= 70 ? 10 : 0), 0)} XP
                </p>

                <div style={{ textAlign: 'left', maxWidth: '400px', margin: '16px auto' }}>
                    {results.map((r, i) => (
                        <div key={i} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 12px', borderRadius: 'var(--radius-md)', marginBottom: '4px',
                            background: 'var(--color-card)', border: `1px solid ${scoreColor(r.score)}33`,
                        }}>
                            <span style={{ fontWeight: 700 }}>{r.target}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>→ {r.spoken}</span>
                            <span style={{ fontWeight: 700, color: scoreColor(r.score) }}>{r.score}% {scoreEmoji(r.score)}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '12px auto' }}>
                    <button className="btn btn--primary btn--block btn--large" onClick={() => window.location.reload()}>🔄 Luyện lại</button>
                    <button className="btn btn--outline btn--block" onClick={() => navigate('/games')}>🎮 Trò chơi</button>
                </div>
            </div>
        );
    }

    const w = words[idx];
    const target = isEN ? w.word : w.character;

    return (
        <div className="page">
            <StarBurst trigger={celebration} />
            <div className="page-header">
                <button className="page-header__back" onClick={() => navigate('/games')}>←</button>
                <h2 className="page-header__title">🎙️ Phòng luyện phát âm</h2>
                <div className="xp-badge">⭐ {state.xp}</div>
            </div>

            <div className="lesson-progress">
                <div className="progress-bar" style={{ flex: 1 }}>
                    <div className="progress-bar__fill" style={{ width: `${(idx / TOTAL) * 100}%`, background: isEN ? 'var(--gradient-english)' : 'var(--gradient-chinese)' }} />
                </div>
                <span className="lesson-progress__text">{idx + 1}/{TOTAL}</span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.78rem', color: 'var(--color-text-light)' }}>
                {sourceLabel === 'standard' ? 'Nguồn: Standard lexicon' : 'Nguồn: Curriculum'}
            </div>

            {/* Target word */}
            <div style={{
                textAlign: 'center', margin: '20px 0', padding: '28px',
                borderRadius: 'var(--radius-lg)', background: 'var(--color-card)', boxShadow: 'var(--shadow-md)',
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{w.emoji}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '4px' }}>{target}</div>
                {!isEN && w.pinyin && <div style={{ color: 'var(--color-text-light)', fontSize: '1rem' }}>{w.pinyin}</div>}
                <div style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginTop: '4px' }}>{w.vietnamese}</div>

                <button onClick={() => speak(target)} style={{
                    marginTop: '12px', padding: '8px 20px', border: 'none', borderRadius: 'var(--radius-full)',
                    background: 'var(--color-primary)', color: 'white', fontWeight: 700,
                    cursor: 'pointer', fontSize: '0.9rem',
                }}>
                    🔊 Nghe mẫu
                </button>
            </div>

            {/* Record button */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <button onClick={startListening} disabled={listening}
                    style={{
                        width: '100px', height: '100px', borderRadius: '50%', border: 'none',
                        background: listening ? '#EF4444' : 'var(--gradient-english)',
                        color: 'white', fontSize: '2.5rem', cursor: 'pointer',
                        boxShadow: listening ? '0 0 0 8px #EF444440' : '0 0 0 8px #3B82F620',
                        transition: 'all 0.3s', animation: listening ? 'pulse 1.2s infinite' : 'none',
                    }}
                >
                    {listening ? '⏹️' : '🎙️'}
                </button>
                <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                    {listening ? '🔴 Đang nghe... Nói rõ ràng!' : 'Bấm để nói'}
                </p>
            </div>

            {error && (
                <div style={{ textAlign: 'center', color: 'var(--color-error)', fontSize: '0.85rem', margin: '8px 0' }}>
                    ⚠️ {error}
                </div>
            )}

            {/* Score result */}
            {score !== null && (
                <div style={{
                    textAlign: 'center', padding: '16px', borderRadius: 'var(--radius-lg)',
                    background: `${scoreColor(score)}10`, border: `2px solid ${scoreColor(score)}`,
                    margin: '12px 0',
                }}>
                    <div style={{ fontSize: '2rem' }}>{scoreEmoji(score)}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color: scoreColor(score) }}>
                        {score}%
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', marginTop: '4px' }}>
                        Bạn nói: "<strong>{spoken}</strong>"
                    </div>
                    {score >= 90 && <div style={{ color: '#22C55E', fontWeight: 700, marginTop: '4px' }}>Tuyệt vời! +15 XP ⭐</div>}
                    {score >= 70 && score < 90 && <div style={{ color: '#F59E0B', fontWeight: 700, marginTop: '4px' }}>Tốt! +10 XP ⭐</div>}
                    {score < 70 && <div style={{ color: '#EF4444', fontSize: '0.8rem', marginTop: '4px' }}>Thử lại hoặc nghe mẫu 🔊</div>}

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
                        {score < 70 && (
                            <button className="btn btn--outline" onClick={startListening}>🔄 Thử lại</button>
                        )}
                        <button className="btn btn--primary" onClick={next}>
                            {idx + 1 >= TOTAL ? '📊 Xem kết quả' : '➡️ Từ tiếp theo'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
