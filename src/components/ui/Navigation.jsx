/**
 * Navigation Component
 * Bottom tab navigation
 */
import React from 'react';
import { Home, Sword, Trophy } from 'lucide-react';

function Navigation({ activeTab, onTabChange }) {
    const tabs = [
        { id: 'home', icon: Home, label: 'Lobby' },
        { id: 'play', icon: Sword, label: 'Battle' },
        { id: 'profile', icon: Trophy, label: 'Rank' },
    ];

    return (
        <nav className="tab-nav">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => onTabChange(tab.id)}
                >
                    <tab.icon
                        size={22}
                        fill={activeTab === tab.id ? 'currentColor' : 'none'}
                        strokeWidth={2.5}
                    />
                    <span className="tab-label">{tab.label}</span>
                </button>
            ))}
        </nav>
    );
}

export default Navigation;
