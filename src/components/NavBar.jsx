import { NavLink } from 'react-router-dom';
import { useGame } from '../context/GameStateContext';
import { isAdultMode } from '../utils/userMode';

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
    { path: '/games', icon: '🧩', label: 'Practice' },
    { path: '/achievements', icon: '📊', label: 'Progress' },
];

export default function NavBar() {
    const { state } = useGame();
    const items = isAdultMode(state.userMode) ? NAV_ADULT : NAV_KIDS;

    return (
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
        </nav>
    );
}
