import { useState, useCallback } from 'react';

// Dictation Exercise: listen to segment → type what you hear → check accuracy
export default function DictationExercise({ segments, onComplete }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState(null);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [isFinished, setIsFinished] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const current = segments[currentIndex];

    const speakText = useCallback((text, rate = 1) => {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'en-US';
        u.rate = rate;
        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang.startsWith('en-US'))
            || voices.find(v => v.lang.startsWith('en'));
        if (enVoice) u.voice = enVoice;
        u.onstart = () => setIsPlaying(true);
        u.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(u);
    }, []);

    const handleCheck = () => {
        const original = current.text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
        const typed = userInput.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

        const origWords = original.split(/\s+/);
        const typedWords = typed.split(/\s+/);

        // Word-by-word comparison using LCS for alignment
        const diff = compareWords(origWords, typedWords);
        const correctCount = diff.filter(d => d.status === 'correct').length;
        const accuracy = Math.round((correctCount / origWords.length) * 100);

        setResult({ diff, accuracy, original: current.text });
        setScore(prev => ({
            correct: prev.correct + correctCount,
            total: prev.total + origWords.length,
        }));
    };

    const handleNext = () => {
        if (currentIndex + 1 >= segments.length) {
            setIsFinished(true);
            onComplete?.(score);
        } else {
            setCurrentIndex(currentIndex + 1);
            setUserInput('');
            setResult(null);
        }
    };

    if (isFinished) {
        const totalAccuracy = score.total > 0
            ? Math.round((score.correct / score.total) * 100) : 0;
        return (
            <div className="dictation-complete">
                <div className="dictation-score-card">
                    <h3>✅ Hoàn thành Dictation!</h3>
                    <div className="dictation-final-score">
                        <span className="score-number">{totalAccuracy}%</span>
                        <span className="score-label">Accuracy</span>
                    </div>
                    <p>{score.correct} / {score.total} từ đúng</p>
                    <div className="dictation-rating">
                        {totalAccuracy >= 90 ? '🌟 Xuất sắc!' :
                            totalAccuracy >= 70 ? '👏 Tốt lắm!' :
                                totalAccuracy >= 50 ? '💪 Cần luyện thêm!' :
                                    '📚 Nghe lại nhiều lần nhé!'}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dictation-exercise">
            <div className="dictation-header">
                <span className="dictation-progress">
                    Câu {currentIndex + 1} / {segments.length}
                </span>
                <div className="dictation-progress-bar">
                    <div
                        className="dictation-progress-fill"
                        style={{ width: `${((currentIndex + (result ? 1 : 0)) / segments.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="dictation-audio-controls">
                <button
                    className="dict-play-btn"
                    onClick={() => speakText(current.text, 1)}
                    disabled={isPlaying}
                >
                    {isPlaying ? '🔊 Đang phát...' : '▶️ Nghe'}
                </button>
                <button
                    className="dict-slow-btn"
                    onClick={() => speakText(current.text, 0.6)}
                    disabled={isPlaying}
                >
                    🐌 Nghe chậm
                </button>
            </div>

            {!result ? (
                <>
                    <textarea
                        className="dictation-input"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="Nghe và gõ lại những gì bạn nghe được..."
                        rows={4}
                        autoFocus
                    />
                    <button
                        className="dictation-check-btn"
                        onClick={handleCheck}
                        disabled={!userInput.trim()}
                    >
                        ✓ Kiểm tra
                    </button>
                </>
            ) : (
                <div className="dictation-result">
                    <div className={`dictation-accuracy ${result.accuracy >= 80 ? 'good' : result.accuracy >= 50 ? 'ok' : 'poor'}`}>
                        {result.accuracy}% chính xác
                    </div>

                    <div className="dictation-diff">
                        <p className="diff-label">📖 Bản gốc:</p>
                        <div className="diff-words">
                            {result.diff.map((d, i) => (
                                <span key={i} className={`diff-word ${d.status}`}>
                                    {d.word}
                                </span>
                            ))}
                        </div>
                    </div>

                    {current.textVi && (
                        <p className="dictation-translation">🇻🇳 {current.textVi}</p>
                    )}

                    <button className="dictation-next-btn" onClick={handleNext}>
                        {currentIndex + 1 >= segments.length ? '🏁 Kết thúc' : '→ Câu tiếp'}
                    </button>
                </div>
            )}
        </div>
    );
}

// Simple word comparison — highlights correct, incorrect, and missing words
function compareWords(original, typed) {
    const result = [];
    const typedSet = new Set(typed.map(w => w.toLowerCase()));

    for (let i = 0; i < original.length; i++) {
        const origWord = original[i];
        if (i < typed.length) {
            if (typed[i].toLowerCase() === origWord.toLowerCase()) {
                result.push({ word: origWord, status: 'correct' });
            } else if (typedSet.has(origWord.toLowerCase())) {
                result.push({ word: origWord, status: 'misplaced' });
            } else {
                result.push({ word: origWord, status: 'incorrect', typed: typed[i] });
            }
        } else {
            result.push({ word: origWord, status: 'missing' });
        }
    }

    return result;
}
