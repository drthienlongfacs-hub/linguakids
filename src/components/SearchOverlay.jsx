// SearchOverlay.jsx — iOS 26 Spotlight-style DEEP SEARCH
// Deep search across pages + 120+ video lessons + lesson content
// Features: fuzzy matching, categorized results, recent searches, keyboard nav, video content search

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import {
    flattenVisibleVideoLessons,
    getLessonFocusVocabulary,
    loadVideoLessonManifest,
} from '../services/videoLessonManifestService';
import { isAdultMode } from '../utils/userMode';

// ============ SEARCHABLE INDEX ============
const SEARCH_INDEX = [
    // 🏠 Main
    { path: '/', title: 'Home', titleVi: 'Trang chủ', cat: 'main', icon: '🏠', tags: ['home', 'main', 'start', 'trang chủ'] },
    { path: '/english', title: 'Learn English', titleVi: 'Học Tiếng Anh', cat: 'learn', icon: '🇬🇧', tags: ['english', 'learn', 'tiếng anh'] },
    { path: '/chinese', title: 'Learn Chinese', titleVi: 'Học Tiếng Trung', cat: 'learn', icon: '🇨🇳', tags: ['chinese', 'mandarin', 'tiếng trung', '中文'] },
    { path: '/kids-library', title: 'Kids Library', titleVi: 'Thư viện cho bé', cat: 'main', icon: '📚', tags: ['library', 'kids', 'thư viện', 'books'] },
    { path: '/video-lessons', title: 'Video Lessons', titleVi: 'Bài học Video', cat: 'learn', icon: '🎬', tags: ['video', 'watch', 'youtube', 'xem', 'phonics', 'stories', 'songs'] },
    { path: '/settings', title: 'Settings', titleVi: 'Cài đặt', cat: 'main', icon: '⚙️', tags: ['settings', 'cài đặt'] },

    // 🎮 Games
    { path: '/games', title: 'Game Hub', titleVi: 'Trò chơi', cat: 'game', icon: '🎮', tags: ['games', 'play', 'trò chơi'] },
    { path: '/game/memory/en', title: 'Memory Game', titleVi: 'Trò ghi nhớ', cat: 'game', icon: '🧩', tags: ['memory', 'matching', 'ghi nhớ'] },
    { path: '/game/quiz/en', title: 'Quiz Game', titleVi: 'Trắc nghiệm', cat: 'game', icon: '❓', tags: ['quiz', 'question', 'trắc nghiệm'] },
    { path: '/game/sentence/en', title: 'Sentence Builder', titleVi: 'Xây câu', cat: 'game', icon: '🔨', tags: ['sentence', 'builder', 'xây câu'] },
    { path: '/matching', title: 'Matching Game', titleVi: 'Ghép đôi', cat: 'game', icon: '🎯', tags: ['matching', 'pair', 'ghép đôi'] },
    { path: '/spelling-bee/en', title: 'Spelling Bee', titleVi: 'Đánh vần', cat: 'game', icon: '🐝', tags: ['spelling', 'bee', 'đánh vần'] },

    // 🗣️ Speaking
    { path: '/speaking', title: 'Speaking Hub', titleVi: 'Luyện nói', cat: 'speaking', icon: '🗣️', tags: ['speaking', 'nói', 'pronunciation', 'phát âm'] },
    { path: '/conversation-ai', title: 'AI Conversation', titleVi: 'Hội thoại AI', cat: 'speaking', icon: '💬', tags: ['conversation', 'ai', 'chat', 'hội thoại', 'voice', 'giọng nói'] },
    { path: '/speaking-cn', title: 'Speaking Chinese', titleVi: 'Luyện nói Trung', cat: 'speaking', icon: '🗣️', tags: ['speaking', 'chinese', 'nói', 'tiếng trung'] },
    { path: '/free-speaking', title: 'Free Speaking Coach', titleVi: 'Luyện nói tự do', cat: 'speaking', icon: '🎙️', tags: ['free speaking', 'coach', 'nói tự do'] },

    // 👂 Listening
    { path: '/listening', title: 'Listening Hub', titleVi: 'Luyện nghe', cat: 'listening', icon: '👂', tags: ['listening', 'nghe', 'audio'] },
    { path: '/listening-cn', title: 'Listening Chinese', titleVi: 'Nghe Tiếng Trung', cat: 'listening', icon: '👂', tags: ['listening', 'chinese', 'nghe'] },

    // 📖 Reading
    { path: '/reading', title: 'Reading Hub', titleVi: 'Luyện đọc', cat: 'reading', icon: '📖', tags: ['reading', 'đọc', 'comprehension'] },
    { path: '/stories/en', title: 'English Stories', titleVi: 'Truyện tiếng Anh', cat: 'reading', icon: '📕', tags: ['story', 'stories', 'truyện'] },

    // ✍️ Writing
    { path: '/writing', title: 'Writing Hub', titleVi: 'Luyện viết', cat: 'writing', icon: '✍️', tags: ['writing', 'viết', 'essay'] },
    { path: '/game/stroke', title: 'Stroke Writer', titleVi: 'Viết nét chữ', cat: 'writing', icon: '✏️', tags: ['stroke', 'handwriting', 'viết nét'] },
    { path: '/typing/en', title: 'Typing Practice', titleVi: 'Tập gõ phím', cat: 'writing', icon: '⌨️', tags: ['typing', 'keyboard', 'gõ phím'] },

    // 📝 Grammar
    { path: '/grammar', title: 'Grammar Hub', titleVi: 'Ngữ pháp', cat: 'grammar', icon: '📝', tags: ['grammar', 'ngữ pháp', 'tense', 'thì'] },
    { path: '/grammar-cn', title: 'Chinese Grammar', titleVi: 'Ngữ pháp Trung', cat: 'grammar', icon: '📝', tags: ['grammar', 'chinese', 'ngữ pháp'] },
    { path: '/cloze/en', title: 'Fill in the Blank', titleVi: 'Điền vào chỗ trống', cat: 'grammar', icon: '📄', tags: ['cloze', 'fill', 'blank', 'điền'] },

    // 📊 Progress & Vocabulary
    { path: '/progress', title: 'Progress', titleVi: 'Tiến độ', cat: 'main', icon: '📊', tags: ['progress', 'tiến độ', 'stats'] },
    { path: '/vocabulary', title: 'Vocabulary', titleVi: 'Từ vựng', cat: 'learn', icon: '📒', tags: ['vocabulary', 'từ vựng', 'words'] },
    { path: '/achievements', title: 'Achievements', titleVi: 'Huy chương', cat: 'main', icon: '🏆', tags: ['achievements', 'huy chương', 'badge'] },
    { path: '/leaderboard', title: 'Leaderboard', titleVi: 'Bảng xếp hạng', cat: 'main', icon: '🏅', tags: ['leaderboard', 'ranking', 'xếp hạng'] },
    { path: '/review', title: 'Daily Review', titleVi: 'Ôn tập hàng ngày', cat: 'learn', icon: '🔄', tags: ['review', 'daily', 'ôn tập', 'spaced repetition'] },

    // 🎓 Exam Prep
    { path: '/exam-prep', title: 'Exam Prep', titleVi: 'Luyện thi', cat: 'exam', icon: '🎓', tags: ['exam', 'test', 'thi', 'prep'] },
    { path: '/ielts-sim', title: 'IELTS Simulator', titleVi: 'Thi thử IELTS', cat: 'exam', icon: '🎓', tags: ['ielts', 'simulator', 'thi thử'] },
    { path: '/hsk-sim', title: 'HSK Simulator', titleVi: 'Thi thử HSK', cat: 'exam', icon: '🎓', tags: ['hsk', 'chinese', 'thi thử'] },
    { path: '/placement', title: 'Placement Test', titleVi: 'Kiểm tra trình độ', cat: 'exam', icon: '📋', tags: ['placement', 'level', 'trình độ'] },

    // 🗂️ Conversation & Phrases
    { path: '/conversations/en', title: 'Conversations', titleVi: 'Hội thoại', cat: 'speaking', icon: '💬', tags: ['conversation', 'hội thoại', 'dialogue'] },
    { path: '/phrases/en', title: 'Phrase Practice', titleVi: 'Luyện cụm từ', cat: 'learn', icon: '💭', tags: ['phrases', 'cụm từ', 'expression'] },

    // 🧩 Specialized
    { path: '/lexicon/en', title: 'Standard Lexicon', titleVi: 'Từ điển chuẩn', cat: 'learn', icon: '📖', tags: ['lexicon', 'dictionary', 'từ điển'] },
    { path: '/parent-dashboard', title: 'Parent Dashboard', titleVi: 'Bảng điều khiển phụ huynh', cat: 'main', icon: '👨‍👩‍👧', tags: ['parent', 'dashboard', 'phụ huynh'] },
    { path: '/roadmap', title: 'Learning Roadmap', titleVi: 'Lộ trình học', cat: 'main', icon: '🗺️', tags: ['roadmap', 'path', 'lộ trình'] },
];

const CATEGORY_LABELS = {
    main: { en: 'Main', vi: 'Chính' },
    learn: { en: 'Learn', vi: 'Học' },
    game: { en: 'Games', vi: 'Trò chơi' },
    speaking: { en: 'Speaking', vi: 'Nói' },
    listening: { en: 'Listening', vi: 'Nghe' },
    reading: { en: 'Reading', vi: 'Đọc' },
    writing: { en: 'Writing', vi: 'Viết' },
    grammar: { en: 'Grammar', vi: 'Ngữ pháp' },
    exam: { en: 'Exam Prep', vi: 'Luyện thi' },
    video: { en: '🎬 Videos', vi: '🎬 Video' },
};

const STORAGE_KEY = 'linguakids_recent_searches';

function getRecentSearches() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}

function addRecentSearch(item) {
    const recent = getRecentSearches().filter(r => r.path !== item.path);
    recent.unshift({ path: item.path, title: item.title, icon: item.icon });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, 8)));
}

export default function SearchOverlay({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { state } = useGame();
    const adult = isAdultMode(state.userMode);
    const [query, setQuery] = useState('');
    const [selectedIdx, setSelectedIdx] = useState(0);
    const [videoIndexState, setVideoIndexState] = useState({ ready: false, items: [] });
    const inputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            setQuery('');
            setSelectedIdx(0);
            inputRef.current?.focus();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || videoIndexState.ready) {
            return undefined;
        }

        let active = true;

        loadVideoLessonManifest()
            .then((manifest) => {
                if (!active) return;
                const items = flattenVisibleVideoLessons(manifest).map((video) => ({
                    path: '/video-lessons',
                    title: video.title,
                    titleVi: video.titleVi,
                    cat: 'video',
                    icon: video.category.icon,
                    tags: [
                        video.channel || '',
                        video.category.title,
                        video.category.titleVi,
                        video.level.title,
                        video.level.titleVi,
                        video.id,
                        ...getLessonFocusVocabulary(video).map((entry) => entry.term),
                        ...getLessonFocusVocabulary(video).map((entry) => entry.meaningVi),
                    ].filter(Boolean),
                    meta: `${video.level.level} · ${video.channel || 'reference source'}`,
                    isVideo: true,
                }));
                setVideoIndexState({ ready: true, items });
            })
            .catch(() => {
                if (!active) return;
                setVideoIndexState({ ready: true, items: [] });
            });

        return () => {
            active = false;
        };
    }, [isOpen, videoIndexState.ready]);

    // Keyboard shortcut: Cmd/Ctrl + K
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                if (isOpen) onClose();
                else onClose?.(); // toggle
            }
            if (isOpen && e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    // Deep search across pages + videos
    const FULL_INDEX = useMemo(() => [...SEARCH_INDEX, ...videoIndexState.items], [videoIndexState.items]);
    const results = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase().trim();
        const words = q.split(/\s+/);
        return FULL_INDEX.filter(item => {
            const searchable = [
                item.title, item.titleVi, ...(item.tags || []), item.meta || ''
            ].join(' ').toLowerCase();
            return words.every(word => searchable.includes(word));
        }).slice(0, 20); // Show more results for deep search
    }, [query, FULL_INDEX]);

    // Group by category
    const grouped = useMemo(() => {
        const groups = {};
        results.forEach(item => {
            if (!groups[item.cat]) groups[item.cat] = [];
            groups[item.cat].push(item);
        });
        return groups;
    }, [results]);

    const flatResults = results;

    // Keyboard navigation
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIdx(i => Math.min(i + 1, flatResults.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIdx(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && flatResults[selectedIdx]) {
            const item = flatResults[selectedIdx];
            addRecentSearch(item);
            navigate(item.path);
            onClose();
        }
    }, [flatResults, selectedIdx, navigate, onClose]);

    const handleSelect = useCallback((item) => {
        addRecentSearch(item);
        navigate(item.path);
        onClose();
    }, [navigate, onClose]);

    const recent = getRecentSearches();

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div onClick={onClose} style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(4px)', zIndex: 9998, animation: 'fadeIn 0.15s ease',
            }} />

            {/* Search Panel */}
            <div style={{
                position: 'fixed', top: '12%', left: '50%', transform: 'translateX(-50%)',
                width: 'min(92vw, 520px)', maxHeight: '70vh', zIndex: 9999,
                background: 'var(--color-card)', borderRadius: '20px',
                border: '1px solid var(--color-border)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset',
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                animation: 'slideDown 0.2s ease',
            }}>
                {/* Search Input */}
                <div style={{
                    padding: '16px', display: 'flex', alignItems: 'center', gap: '10px',
                    borderBottom: '1px solid var(--color-border)',
                }}>
                    <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>🔍</span>
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => { setQuery(e.target.value); setSelectedIdx(0); }}
                        onKeyDown={handleKeyDown}
                        placeholder={adult ? 'Search features, lessons, games...' : 'Tìm bài học, trò chơi, tính năng...'}
                        style={{
                            flex: 1, border: 'none', outline: 'none', fontSize: '1rem',
                            background: 'transparent', color: 'var(--color-text)',
                            fontWeight: 500,
                        }}
                    />
                    <kbd style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '0.6rem',
                        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-light)', fontFamily: 'monospace',
                    }}>ESC</kbd>
                </div>

                {/* Results */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                    {/* No query: show recent + suggested */}
                    {!query.trim() && (
                        <>
                            {recent.length > 0 && (
                                <div style={{ padding: '4px 16px' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                        {adult ? 'Recent' : 'Gần đây'}
                                    </div>
                                    {recent.map((r) => (
                                        <div key={r.path} onClick={() => { navigate(r.path); onClose(); }}
                                            style={{
                                                padding: '8px 12px', borderRadius: '10px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                transition: 'background 0.15s',
                                                background: 'transparent',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{r.icon}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.title}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ padding: '4px 16px', marginTop: recent.length ? '8px' : '0' }}>
                                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                                    {adult ? 'Quick Access' : 'Truy cập nhanh'}
                                </div>
                                {['conversation-ai', 'speaking', 'grammar', 'games', 'reading'].map(id => {
                                    const item = SEARCH_INDEX.find(s => s.path === `/${id}`);
                                    if (!item) return null;
                                    return (
                                        <div key={item.path} onClick={() => handleSelect(item)}
                                            style={{
                                                padding: '8px 12px', borderRadius: '10px', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                transition: 'background 0.15s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--color-bg)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{adult ? item.title : item.titleVi}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {/* Search results by category */}
                    {query.trim() && Object.keys(grouped).length === 0 && (
                        <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--color-text-light)' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                            <div style={{ fontSize: '0.85rem' }}>
                                {adult ? `No results for "${query}"` : `Không tìm thấy "${query}"`}
                            </div>
                        </div>
                    )}

                    {Object.entries(grouped).map(([cat, items]) => (
                        <div key={cat} style={{ marginBottom: '4px' }}>
                            <div style={{
                                padding: '4px 16px', fontSize: '0.68rem', fontWeight: 700,
                                color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.5px',
                            }}>
                                {adult ? CATEGORY_LABELS[cat]?.en : CATEGORY_LABELS[cat]?.vi}
                            </div>
                            {items.map((item) => {
                                const globalIdx = flatResults.indexOf(item);
                                const isSelected = globalIdx === selectedIdx;
                                return (
                                    <div key={item.path} onClick={() => handleSelect(item)}
                                        onMouseEnter={() => setSelectedIdx(globalIdx)}
                                        style={{
                                            padding: '8px 16px', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', gap: '10px',
                                            borderRadius: '10px', margin: '0 8px',
                                            background: isSelected ? 'var(--color-primary)' : 'transparent',
                                            color: isSelected ? '#fff' : 'var(--color-text)',
                                            transition: 'all 0.1s',
                                        }}>
                                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                                {adult ? item.title : item.titleVi}
                                            </div>
                                            <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>
                                                {item.meta || item.path}
                                            </div>
                                        </div>
                                        {isSelected && <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>↵</span>}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '8px 16px', borderTop: '1px solid var(--color-border)',
                    display: 'flex', gap: '12px', justifyContent: 'center',
                    fontSize: '0.62rem', color: 'var(--color-text-light)',
                }}>
                    <span>↑↓ {adult ? 'navigate' : 'di chuyển'}</span>
                    <span>↵ {adult ? 'open' : 'mở'}</span>
                    <span>esc {adult ? 'close' : 'đóng'}</span>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideDown { from { opacity: 0; transform: translateX(-50%) translateY(-12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
            `}</style>
        </>
    );
}
