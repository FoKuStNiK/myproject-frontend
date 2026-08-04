import React from 'react';
import './Sidebar.css';

function Sidebar({ activePage, onPageChange }) {
    const menuItems = [
        { id: 'home', label: 'Главная', icon: '🏠' },
        { id: 'news', label: 'Новости', icon: '📰' },
        { id: 'achievements', label: 'Достижения', icon: '🏆' },
        { id: 'support', label: 'Поддержка', icon: '💬' }
    ];

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <h2>Мой Сайт</h2>
                <p className="sidebar-sub">Версия 2.0</p>
            </div>
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.id}
                        className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
                        onClick={() => onPageChange(item.id)}
                    >
                        <span className="icon">{item.icon}</span>
                        <span className="label">{item.label}</span>
                        {activePage === item.id && <span className="badge">✓</span>}
                    </li>
                ))}
            </ul>
            <div className="sidebar-footer">
                <p>© 2026</p>
            </div>
        </nav>
    );
}

export default Sidebar;