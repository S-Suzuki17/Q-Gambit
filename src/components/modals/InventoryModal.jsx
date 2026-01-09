/**
 * InventoryModal Component
 * UI for viewing collected pieces, synthesizing them, and exchanging for tickets
 */
import React from 'react';
import { X, ArrowRight, ArrowUpCircle, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SYMBOLS } from '../../utils/quantumChess';

// Visual colors for ranks
const RANK_COLORS = {
    P: 'var(--text-secondary)',
    N: 'var(--cyan-glow)',
    B: 'var(--amber-glow)',
    R: 'var(--rose-glow)',
    Q: 'var(--primary-glow)',
    K: '#ffd700'
};

function InventoryModal({ inventory, rates, onSynthesize, onExchange, onClose }) {
    const { t } = useTranslation();
    const PIECE_RANKS = ['P', 'N', 'B', 'R', 'Q', 'K'];

    return (
        <div className="game-over-modal">
            <div className="card animate-zoom-in inventory-modal-content">
                <div className="rules-header">
                    <div className="rules-title-section">
                        <span className="rules-icon">🎒</span>
                        <h3 className="rules-title">{t('inventory.title', 'Inventory')}</h3>
                    </div>
                    <button className="icon-btn close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="inventory-grid">
                    {PIECE_RANKS.map((type, index) => {
                        const count = inventory[type] || 0;
                        const canSynthesize = count >= 2 && index < PIECE_RANKS.length - 1;
                        const nextType = PIECE_RANKS[index + 1];

                        return (
                            <div key={type} className="inventory-item">
                                <div className="piece-display">
                                    <span
                                        className="piece-symbol-lg"
                                        style={{ color: RANK_COLORS[type], filter: `drop-shadow(0 0 5px ${RANK_COLORS[type]})` }}
                                    >
                                        {SYMBOLS[type]}
                                    </span>
                                    <span className="piece-count">x{count}</span>
                                </div>

                                <div className="inventory-actions">
                                    {/* Synthesis Button */}
                                    {index < PIECE_RANKS.length - 1 && (
                                        <button
                                            className="btn btn-sm btn-secondary synth-btn"
                                            disabled={!canSynthesize}
                                            onClick={() => onSynthesize(nextType)}
                                            title={canSynthesize ? `Synthesize 2 ${type} into 1 ${nextType}` : `Need 2 ${type}`}
                                        >
                                            <ArrowUpCircle size={14} />
                                            <span className="synth-cost">2 {SYMBOLS[type]} &rarr; 1 {SYMBOLS[nextType]}</span>
                                        </button>
                                    )}

                                    {/* Exchange Button */}
                                    <button
                                        className="btn btn-sm btn-primary exchange-btn"
                                        disabled={count < 1}
                                        onClick={() => onExchange(type)}
                                        title={`Exchange 1 ${type} for ${rates[type]} Tickets`}
                                    >
                                        <Ticket size={14} />
                                        <span>{rates[type]} Games</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="inventory-footer">
                    <p className="inventory-hint">
                        {t('inventory.hint', 'Synthesize pieces to get more value! Higher ranks give exponentially more free games.')}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default InventoryModal;
