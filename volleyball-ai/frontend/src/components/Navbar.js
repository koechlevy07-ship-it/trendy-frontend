import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    const links = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/matches', label: 'Matches', icon: '🏐' },
        { path: '/rankings', label: 'Rankings', icon: '🏆' },
        { path: '/players', label: 'Players', icon: '👤' },
        { path: '/upload', label: 'Upload Video', icon: '🎥' }
    ];

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span style={{ fontSize: '1.8rem' }}>🏐</span>
                <div>
                    <h1>VolleyAI</h1>
                    <div className="subtitle">AI Analytics Platform</div>
                </div>
            </div>
            <div className="nav-links">
                {links.map(link => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                    >
                        <span>{link.icon}</span>
                        <span>{link.label}</span>
                    </Link>
                ))}
            </div>
            <div className="navbar-footer">
                <div className="navbar-version">v2.0 — AI Platform</div>
            </div>
        </nav>
    );
};

export default Navbar;
