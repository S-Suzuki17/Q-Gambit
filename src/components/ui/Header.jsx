/**
 * Header Component
 * Top navigation bar with user info
 */
import React from 'react';
import { User, LogOut, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Header = ({ user, userData, handleLogout, setShowAuthModal }) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'ja' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="game-header">
            <div className="header-content">
                <div className="logo-section">
                    <h1 className="game-title">{t('app.title')}</h1>
                    <span className="version-badge">BETA 0.9.5</span>
                </div>

                <div className="user-section">
                    <button
                        onClick={toggleLanguage}
                        className="lang-btn"
                        aria-label="Toggle Language"
                    >
                        <Globe size={18} />
                        <span>{i18n.language === 'en' ? 'JP' : 'EN'}</span>
                    </button>

                    {user ? (
                        <div className="user-info">
                            <div className="user-details">
                                <span className="user-name">{userData?.displayName || 'Player'}</span>
                                <span className="user-rating">R: {userData?.rating || 1000}</span>
                            </div>
                            <button onClick={handleLogout} className="icon-btn" aria-label="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <button onClick={() => setShowAuthModal(true)} className="login-btn">
                            <User size={18} />
                            <span>Login</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
