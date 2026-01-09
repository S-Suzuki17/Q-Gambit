/**
 * RulesModal Component
 * Visual guide to Quantum Chess rules
 */
import React, { useState } from 'react';
import { BookOpen, X, ChevronRight, ChevronLeft, Target, GitMerge, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SYMBOLS } from '../../utils/quantumChess';

function RulesModal({ onClose }) {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);

    const pages = [
        {
            title: t('rules.superposition_title'),
            icon: <GitMerge size={32} color="var(--cyan-glow)" />,
            content: t('rules.superposition_content'),
            visual: (
                <div className="rules-visual">
                    <div className="quantum-orb-container rule-orb">
                        <div className="possibilities-orbit rule-orbit">
                            {['k', 'r', 'n'].map((type, idx) => {
                                const angle = (idx / 3) * 2 * Math.PI - Math.PI / 2;
                                return (
                                    <span key={type} className="possibility-symbol white"
                                        style={{ transform: `translate(${Math.cos(angle) * 12}px, ${Math.sin(angle) * 12}px)` }}>
                                        {SYMBOLS[type]}
                                    </span>
                                );
                            })}
                        </div>
                        <div className="quantum-core white" style={{ width: 8, height: 8 }} />
                    </div>
                </div>
            )
        },
        {
            title: t('rules.entanglement_title'),
            icon: <AlertTriangle size={32} color="var(--amber-glow)" />,
            content: t('rules.entanglement_content'),
            visual: (
                <div className="rules-visual">
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div className="chess-piece white is-rule">{SYMBOLS['n']}</div>
                        <div style={{ width: 40, height: 2, background: 'var(--border-glow)' }}></div>
                        <div className="chess-piece white is-rule" style={{ opacity: 0.3 }}>{SYMBOLS['n']}</div>
                    </div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                        One Knight observed &rarr; Others lose Knight possibility
                    </p>
                </div>
            )
        },
        {
            title: t('rules.victory_title'),
            icon: <Target size={32} color="var(--rose-glow)" />,
            content: t('rules.victory_content'),
            visual: (
                <div className="rules-visual">
                    <span className="chess-piece black" style={{ filter: 'drop-shadow(0 0 10px var(--rose-glow))' }}>♚</span>
                </div>
            )
        }
    ];

    return (
        <div className="game-over-modal">
            <div className="card animate-zoom-in rules-modal-content">
                <div className="rules-header">
                    <div className="rules-title-section">
                        <BookOpen size={24} className="rules-icon" />
                        <h3 className="rules-title">{t('nav.how_to_play')}</h3>
                    </div>
                    <button className="icon-btn close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="rules-body">
                    <div className="rules-page">
                        <div className="rules-page-icon">
                            {pages[page].icon}
                        </div>
                        <h4 className="rules-page-title">{pages[page].title}</h4>
                        {pages[page].visual}
                        <p className="rules-page-content">
                            {pages[page].content}
                        </p>
                    </div>
                </div>

                <div className="rules-footer">
                    <button
                        className="btn btn-secondary rules-nav-btn"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft size={16} />
                    </button>

                    <div className="rules-dots">
                        {pages.map((_, i) => (
                            <div key={i} className={`rules-dot ${i === page ? 'active' : ''}`} />
                        ))}
                    </div>

                    {page === pages.length - 1 ? (
                        <button className="btn btn-primary rules-nav-btn" onClick={onClose}>
                            {t('rules.close')}
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary rules-nav-btn"
                            onClick={() => setPage(p => Math.min(pages.length - 1, p + 1))}
                        >
                            <ChevronRight size={16} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RulesModal;
