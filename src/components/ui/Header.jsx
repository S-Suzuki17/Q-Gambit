/**
 * Header Component
 * Top navigation bar with user info
 */
import React, { useState } from 'react';
import { User, LogOut, Globe, Settings, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SettingsModal from '../modals/SettingsModal';

const Header = ({ user, userData, handleLogout, setShowAuthModal, setShowLeaderboardModal }) => {
    const { t, i18n } = useTranslation();
    const [showSettings, setShowSettings] = useState(false);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ja' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <>
            <header className="game-header">
                <div className="header-content">
                    <div className="logo-section">
                        <h1 className="game-title">{t('app.title')}</h1>
                        <span className="version-badge">v1.0.0</span>
                    </div>

                    <div className="user-section">
                        <button
                            onClick={() => setShowLeaderboardModal(true)}
                            className="icon-btn"
                            aria-label="Leaderboard"
                        >
                            <Trophy size={20} className="text-yellow-400" />
                        </button>

                        <button
                            onClick={() => setShowSettings(true)}
                            className="icon-btn"
                            aria-label="Settings"
                        >
                            <Settings size={20} />
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="lang-btn"
                            aria-label="Toggle Language"
                        >
                            <Globe size={18} />
                            <span>{i18n.language === 'en' ? 'JP' : 'EN'}</span>
                        </button>

                        {user && !user.isAnonymous ? (
                            <div className="user-info">
                                {user.photoURL && (
                                    <img src={user.photoURL} alt="" className="user-avatar-img" />
                                )}
                                <div className="user-details">
                                    <span className="user-name">{user.displayName || 'Player'}</span>
                                    <span className="user-rating">R: {userData?.rating || 1000}</span>
                                </div>
                                <button onClick={handleLogout} className="icon-btn" aria-label="Logout">
                                    <LogOut size={20} />
                                </button>
                            </div>
                        ) : (
                            <button onClick={() => setShowAuthModal(true)} className="login-btn">
                                <User size={18} />
                                <span>{t('auth.login', 'Login')}</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}
        </>
    );
};

export default Header;
