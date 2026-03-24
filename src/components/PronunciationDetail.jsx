// PronunciationDetail — Visual pronunciation feedback with IPA tips
// Evidence: Apps providing specific error+comparison show better outcomes (IASTATE 2024)
import { useState, useRef, useCallback } from 'react';

// Vietnamese child → English common error patterns with IPA tips
const PHONETIC_TIPS = {
    'th': {
        error: 'Con hay đọc "th" thành "t" hoặc "d"',
        tip: 'Đặt đầu lưỡi giữa 2 hàm răng, thổi nhẹ',
        ipa: '/θ/ (voiceless) hoặc /ð/ (voiced)',
        examples: ['three → /θriː/', 'the → /ðə/', 'think → /θɪŋk/'],
    },
    'r': {
        error: 'Âm "r" tiếng Anh khác tiếng Việt',
        tip: 'Cuộn lưỡi lên, không chạm trần miệng',
        ipa: '/ɹ/ (retroflex approximant)',
        examples: ['red → /ɹɛd/', 'run → /ɹʌn/'],
    },
    'l': {
        error: 'Cuối từ, "l" phải giữ lưỡi',
        tip: 'Đầu lưỡi chạm vòm miệng phía trước, giữ',
        ipa: '/l/ hoặc /ɫ/ (dark L cuối từ)',
        examples: ['ball → /bɔːɫ/', 'people → /piːpɫ/'],
    },
    'sh': {
        error: 'Con hay đọc "sh" thành "s"',
        tip: 'Tròn môi, lưỡi lùi về sau, thổi rộng',
        ipa: '/ʃ/ (voiceless postalveolar fricative)',
        examples: ['ship → /ʃɪp/', 'shore → /ʃɔːr/'],
    },
    'v': {
        error: 'Âm "v" phải cắn nhẹ môi dưới',
        tip: 'Răng trên chạm môi dưới, rung dây thanh',
        ipa: '/v/ (voiced labiodental fricative)',
        examples: ['very → /vɛri/', 'love → /lʌv/'],
    },
    'z': {
        error: 'Con hay đọc "z" thành "s"',
        tip: 'Giống "s" nhưng rung dây thanh (đặt tay lên cổ để cảm nhận)',
        ipa: '/z/ (voiced alveolar fricative)',
        examples: ['zoo → /zuː/', 'buzz → /bʌz/'],
    },
    'w': {
        error: 'Âm "w" khác "v"',
        tip: 'Tròn môi thật nhỏ, phát ra "oo" rồi mở',
        ipa: '/w/ (voiced labial-velar approximant)',
        examples: ['water → /wɔːtər/', 'will → /wɪl/'],
    },
    'ng': {
        error: 'Cuối từ "ng" hơi khác tiếng Việt',
        tip: 'Lưỡi sau chạm vòm mềm, khí qua mũi',
        ipa: '/ŋ/ (velar nasal)',
        examples: ['sing → /sɪŋ/', 'king → /kɪŋ/'],
    },
};

/**
 * Get relevant phonetic tip for a word based on letters it contains
 */
export function getPhoneticTips(word) {
    const tips = [];
    const lower = word.toLowerCase();

    // Check each pattern
    for (const [pattern, tip] of Object.entries(PHONETIC_TIPS)) {
        if (lower.includes(pattern)) {
            tips.push({ pattern, ...tip });
        }
    }
    return tips;
}

/**
 * PronunciationDetail component — shows word-by-word analysis + IPA tips
 */
export default function PronunciationDetail({ result, targetWord, onPlayback }) {
    const [showTips, setShowTips] = useState(false);
    const tips = targetWord ? getPhoneticTips(targetWord) : [];

    if (!result) return null;

    return (
        <div className="animate-pop-in" style={{
            background: 'white', borderRadius: '16px', padding: '16px',
            marginTop: '16px', border: `2px solid ${result.color || '#E5E7EB'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
            {/* Score header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px',
            }}>
                <div style={{
                    fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 800,
                    color: result.color || '#1E1B4B',
                }}>
                    {result.label}
                </div>
                <div style={{
                    background: result.color || '#E5E7EB', color: 'white',
                    borderRadius: '20px', padding: '4px 14px',
                    fontWeight: 800, fontSize: '0.9rem',
                }}>
                    {result.score}%
                </div>
            </div>

            {/* Word-by-word display */}
            {result.words && result.words.length > 0 && (
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px',
                    justifyContent: 'center',
                }}>
                    {result.words.map((w, i) => (
                        <span key={i} style={{
                            padding: '4px 10px', borderRadius: '8px', fontSize: '1rem',
                            fontWeight: 700, fontFamily: 'var(--font-display)',
                            color: w.color || '#374151',
                            background: w.status === 'perfect' ? '#D1FAE5' :
                                w.status === 'close' ? '#FEF3C7' :
                                    w.status === 'wrong' ? '#FEE2E2' :
                                        w.status === 'missing' ? '#F3F4F6' : '#F9FAFB',
                            border: `1.5px solid ${w.color || '#E5E7EB'}`,
                            textDecoration: w.status === 'missing' ? 'line-through' : 'none',
                        }}>
                            {w.status === 'perfect' ? '✅ ' : w.status === 'close' ? '🟡 ' : w.status === 'missing' ? '❌ ' : '🔴 '}
                            {w.word}
                        </span>
                    ))}
                </div>
            )}

            {/* Confidence indicator */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px',
                fontSize: '0.8rem', color: 'var(--color-text-light)',
            }}>
                <span>Độ tin cậy:</span>
                <div style={{
                    flex: 1, height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden',
                }}>
                    <div style={{
                        width: `${Math.min(100, result.score)}%`, height: '100%',
                        background: result.score >= 80 ? '#10B981' : result.score >= 50 ? '#F59E0B' : '#EF4444',
                        borderRadius: '3px', transition: 'width 0.5s ease',
                    }} />
                </div>
                <span style={{ fontWeight: 700, color: result.color }}>{result.score}%</span>
            </div>

            {/* What user said */}
            {result.spoken && (
                <div style={{
                    padding: '8px 12px', background: '#F0F9FF', borderRadius: '10px',
                    fontSize: '0.85rem', marginBottom: '10px', borderLeft: '3px solid #3B82F6',
                }}>
                    <strong>Con nói:</strong> "{result.spoken}"
                </div>
            )}

            {/* Playback button */}
            {onPlayback && (
                <button
                    onClick={onPlayback}
                    style={{
                        width: '100%', padding: '10px', borderRadius: '10px',
                        border: '2px solid #8B5CF6', background: '#F5F3FF',
                        color: '#7C3AED', fontWeight: 700, cursor: 'pointer',
                        fontFamily: 'var(--font-display)', fontSize: '0.9rem',
                        marginBottom: tips.length > 0 ? '10px' : '0',
                    }}
                >
                    🔊 Nghe lại phát âm chuẩn
                </button>
            )}

            {/* IPA Tips */}
            {tips.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowTips(!showTips)}
                        style={{
                            width: '100%', padding: '8px', borderRadius: '10px',
                            border: '1px dashed #D1D5DB', background: '#FEFCE8',
                            color: '#92400E', cursor: 'pointer', fontSize: '0.85rem',
                            fontWeight: 600,
                        }}
                    >
                        {showTips ? '▼' : '▶'} 💡 Mẹo phát âm ({tips.length} âm cần lưu ý)
                    </button>
                    {showTips && (
                        <div style={{ marginTop: '8px' }}>
                            {tips.map((tip, i) => (
                                <div key={i} style={{
                                    padding: '10px 12px', background: '#FFFBEB',
                                    borderRadius: '10px', marginBottom: '8px',
                                    border: '1px solid #FCD34D', fontSize: '0.82rem',
                                }}>
                                    <div style={{ fontWeight: 700, color: '#92400E', marginBottom: '3px' }}>
                                        🔤 "{tip.pattern}" — {tip.ipa}
                                    </div>
                                    <div style={{ color: '#78350F' }}>⚠️ {tip.error}</div>
                                    <div style={{ color: '#065F46', marginTop: '3px' }}>✅ {tip.tip}</div>
                                    <div style={{ color: '#6B7280', marginTop: '3px', fontStyle: 'italic' }}>
                                        VD: {tip.examples.join(', ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
