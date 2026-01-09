/**
 * Header Component
 * Top navigation bar with user info
 */
import React from 'react';
import { User, Bell, Sword } from 'lucide-react';

function Header({ user, rating, tier, gamesPlayed }) {
    return (
        <header className="header">
            <div className="header-left">
                <div className="user-avatar">
                    <User color="white" size={20} />
                </div>
                <div className="header-user-info">
                    <p className="header-rating">{rating}</p>
                    <p className="header-tier">{tier?.nameJa || 'シルバー'}</p>
                </div>
            </div>
            <div className="header-right">
                <div className="currency-badge">
                    <Sword size={14} color="var(--indigo-glow)" />
                    <span className="currency-text">{gamesPlayed || 0} 戦</span>
                </div>
                <button className="header-notification-btn">
                    <Bell size={20} />
                </button>
            </div>
        </header>
    );
}

export default Header;
