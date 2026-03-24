import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
    { path: '/', icon: '🏠', label: 'Trang chủ' },
    { path: '/english', icon: '🇬🇧', label: 'English' },
    { path: '/chinese', icon: '🇨🇳', label: '中文' },
    { path: '/games', icon: '🎮', label: 'Trò chơi' },
    { path: '/achievements', icon: '🏆', label: 'Huy chương' },
];

export default function NavBar() {
    return (
        <nav className="navbar">
            {NAV_ITEMS.map(item => (
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
