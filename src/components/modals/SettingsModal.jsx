/**
 * SettingsModal Component
 * Volume and graphics settings
 */
import React, { useState } from 'react';
import { Settings, Volume2, VolumeX, Monitor, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { audioSys } from '../../utils/audioSys';

function SettingsModal({ onClose }) {
    const { t } = useTranslation();
    const [masterVol, setMasterVol] = useState(audioSys.masterVolume * 100);
    const [sfxVol, setSfxVol] = useState(audioSys.sfxVolume * 100);
    const [graphicsHigh, setGraphicsHigh] = useState(
        localStorage.getItem('q-gambit-graphics') !== 'low'
    );

    const handleMasterChange = (e) => {
        const val = parseInt(e.target.value);
        setMasterVol(val);
        audioSys.setMasterVolume(val / 100);
    };

    const handleSfxChange = (e) => {
        const val = parseInt(e.target.value);
        setSfxVol(val);
        audioSys.setSfxVolume(val / 100);
    };

    const toggleGraphics = (high) => {
        setGraphicsHigh(high);
        localStorage.setItem('q-gambit-graphics', high ? 'high' : 'low');
        // Reload to apply graphics (simple approach) or just use state in app
        window.dispatchEvent(new Event('graphics-change'));
    };

    return (
        <div className="game-over-modal">
            <div className="card animate-zoom-in settings-content">
                <div className="settings-header">
                    <div className="settings-title-section">
                        <Settings size={24} className="settings-icon" />
                        <h3 className="settings-title">{t('settings.title')}</h3>
                    </div>
                    <button className="icon-btn close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="settings-body">
                    {/* Audio Section */}
                    <div className="settings-section">
                        <h4 className="settings-section-title">
                            <Volume2 size={16} />
                            {t('settings.audio')}
                        </h4>

                        <div className="setting-row">
                            <label>{t('settings.master_volume')}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={masterVol}
                                onChange={handleMasterChange}
                                className="volume-slider"
                            />
                            <span className="volume-value">{masterVol}%</span>
                        </div>

                        <div className="setting-row">
                            <label>{t('settings.sfx_volume')}</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sfxVol}
                                onChange={handleSfxChange}
                                className="volume-slider"
                            />
                            <span className="volume-value">{sfxVol}%</span>
                        </div>
                    </div>

                    {/* Graphics Section */}
                    <div className="settings-section">
                        <h4 className="settings-section-title">
                            <Monitor size={16} />
                            {t('settings.graphics')}
                        </h4>

                        <div className="graphics-options">
                            <button
                                className={`graphics-btn ${graphicsHigh ? 'active' : ''}`}
                                onClick={() => toggleGraphics(true)}
                            >
                                <span className="graphics-label">HIGH</span>
                                {graphicsHigh && <Check size={16} />}
                            </button>
                            <button
                                className={`graphics-btn ${!graphicsHigh ? 'active' : ''}`}
                                onClick={() => toggleGraphics(false)}
                            >
                                <span className="graphics-label">LOW</span>
                                {!graphicsHigh && <Check size={16} />}
                            </button>
                        </div>
                        <p className="settings-hint">
                            {t(graphicsHigh ? 'settings.high_desc' : 'settings.low_desc')}
                        </p>
                    </div>
                </div>

                <div className="settings-footer">
                    <button className="btn btn-primary" onClick={onClose}>
                        {t('settings.close')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsModal;
