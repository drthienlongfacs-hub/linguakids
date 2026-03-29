import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';
import SearchOverlay from './SearchOverlay';

const NAV_KIDS = [
    { path: '/', icon: '🏠', label: 'Trang chủ' },
    { path: '/english', icon: '🇬🇧', label: 'English' },
    { path: '/chinese', icon: '🇨🇳', label: '中文' },
    { path: '/games', icon: '🎮', label: 'Trò chơi' },
    { path: '/achievements', icon: '🏆', label: 'Huy chương' },
];

const NAV_ADULT = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/english', icon: '🇬🇧', label: 'English' },
    { path: '/chinese', icon: '🇨🇳', label: '中文' },
    { path: '/leaderboard', icon: '🏆', label: 'Ranking' },
    { path: '/progress', icon: '📊', label: 'Progress' },
];

export default function NavBar() {
    const { state } = useGame();
    const items = isAdultMode(state.userMode) ? NAV_ADULT : NAV_KIDS;
    const [searchOpen, setSearchOpen] = useState(false);

    return (
        <>
            <nav className="navbar">
                {items.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
                {/* Search button — iOS 26 style circular */}
                <button
                    onClick={() => setSearchOpen(true)}
                    className="nav-search-btn"
                    aria-label="Search"
                    title="Search (⌘K)"
                >
                    <span className="nav-icon">🔍</span>
                </button>
            </nav>
            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </>
    );
}
