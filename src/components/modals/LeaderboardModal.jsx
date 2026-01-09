import React from 'react';
import { X, Trophy, Crown, Medal, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import { formatRatingChange } from '../../utils/rating';

export default function LeaderboardModal({ onClose, user }) {
    const { t } = useTranslation();
    const { leaderboard, loading, error } = useLeaderboard();

    const getRankIcon = (rank) => {
        if (rank === 1) return <Crown className="text-yellow-400" size={24} />;
        if (rank === 2) return <Medal className="text-gray-300" size={24} />;
        if (rank === 3) return <Award className="text-amber-600" size={24} />;
        return <span className="rank-text font-bold text-lg text-cyan-500">#{rank}</span>;
    };

    const getTierColor = (tier) => {
        switch (tier) {
            case 'grandmaster': return 'bg-red-500/20 text-red-300 border-red-500/50';
            case 'master': return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
            case 'diamond': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
            case 'gold': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
            case 'silver': return 'bg-gray-400/20 text-gray-300 border-gray-400/50';
            case 'bronze': return 'bg-orange-700/20 text-orange-300 border-orange-700/50';
            default: return 'bg-slate-700/50 text-slate-400 border-slate-600';
        }
    };

    return (
        <div className="modal-overlay animate-fade-in">
            <div className="modal-content animate-scale-in max-w-2xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="modal-header relative">
                    <button onClick={onClose} className="absolute left-0 top-0 p-2 text-cyan-400 hover:text-cyan-300 transition-colors">
                        <X size={24} />
                    </button>
                    <div className="flex items-center gap-3 justify-center w-full">
                        <Trophy className="text-yellow-400 animate-pulse-slow" size={28} />
                        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-amber-500">
                            {t('leaderboard.title', 'Leaderboard')}
                        </h2>
                    </div>
                </div>

                {/* Body */}
                <div className="modal-body overflow-y-auto custom-scrollbar p-6 space-y-4">

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center text-rose-400 py-8">
                            <p>{t('errors.failedToLoad', 'Failed to load leaderboard')}</p>
                            <p className="text-sm opacity-70 mt-2">{error}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {leaderboard.map((player) => (
                                <div
                                    key={player.id}
                                    className={`
                                        relative flex items-center justify-between p-4 rounded-xl border transition-all hover:bg-white/5
                                        ${player.id === user?.uid
                                            ? 'bg-cyan-900/40 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                                            : 'bg-slate-800/40 border-white/10'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 flex justify-center">
                                            {getRankIcon(player.rank)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-lg text-white tracking-wide">
                                                    {player.displayName}
                                                </span>
                                                {player.id === user?.uid && (
                                                    <span className="ml-2 text-xs bg-cyan-500 text-black px-2 py-0.5 rounded-full font-bold">
                                                        YOU
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-xs px-2 py-0.5 rounded border ${getTierColor(player.tier?.tier)}`}>
                                                    {player.tier?.name}
                                                </span>
                                                <span className="text-xs text-slate-400">
                                                    {player.gamesPlayed} Games • {player.winRate}% WR
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <span className="text-xl font-mono font-bold text-cyan-300">
                                            {player.rating}
                                        </span>
                                        <span className="text-xs text-slate-500">Rating</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
