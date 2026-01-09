/**
 * Navigation Component
 * Bottom tab navigation
 */
import React from 'react';
import { Home, Swords, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Navigation = ({ activeTab, onTabChange }) => {
    const { t } = useTranslation();

    return (
        <nav className="bottom-nav">
            <button
                className={`nav-btn ${activeTab === 'home' ? 'active' : ''}`}
                onClick={() => onTabChange('home')}
            >
                <Home size={24} />
                <span>{t('nav.lobby')}</span>
            </button>
            <button
                className={`nav-btn ${activeTab === 'battle' ? 'active' : ''}`}
                onClick={() => onTabChange('play')}
            >
                <Swords size={24} />
                <span>{t('nav.battle')}</span>
            </button>
            <button
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => onTabChange('profile')}
            >
                <User size={24} />
                <span>{t('nav.profile')}</span>
            </button>
        </nav>
    );
};

export default Navigation;
