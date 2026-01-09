/**
 * ProfileTab Component
 * User profile, stats, leaderboard, and achievements
 */
import React from 'react';
import { Trophy, User, Loader2 } from 'lucide-react';
import { getRatingTier } from '../../utils/rating';
import { MAX_VISIBLE_HISTORY, MAX_VISIBLE_RECORDS } from '../../utils/constants';

function ProfileTab({
    profile,
    leaderboard,
    leaderboardLoading,
    matchHistory,
    achievements,
    detailedStats,
    whiteWinRate,
    blackWinRate,
    gameRecords,
    retentionDays
}) {
    const tier = profile ? getRatingTier(profile.rating) : null;
    const winRate = profile && profile.gamesPlayed > 0
        ? Math.round((profile.wins / profile.gamesPlayed) * 100)
        : 0;

    return (
        <div className="animate-slide-up profile-tab">
            <h2 className="profile-title">ランキング</h2>

            {/* My Rank Card */}
            <div className="card profile-rank-card">
                <div className="profile-rank-content">
                    <div className="user-avatar user-avatar-lg">
                        <User color="white" size={28} />
                    </div>
                    <div className="profile-rank-info">
                        <h3 className="profile-name">
                            {profile?.documentId ? `Player_${profile.documentId.slice(0, 6).toUpperCase()}` : 'Guest'}
                        </h3>
                        <div className="rank-badge">
                            <Trophy size={14} />
                            <span>{tier?.nameJa || 'シルバー'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-value">{profile?.wins || 0}</div>
                    <div className="stat-label">勝利</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{winRate}%</div>
                    <div className="stat-label">勝率</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{profile?.rating || 1500}</div>
                    <div className="stat-label">レート</div>
                </div>
            </div>

            {/* Leaderboard */}
            <h3 className="section-header section-header-top">トップ 10 プレイヤー</h3>
            {leaderboardLoading ? (
                <div className="loading-container">
                    <Loader2 size={24} className="animate-spin loading-icon" />
                </div>
            ) : (
                <div className="leaderboard-list">
                    {leaderboard.map((player, i) => (
                        <div
                            key={player.id}
                            className={`friend-item ${i < 3 ? `top-${i + 1}` : ''}`}
                        >
                            <div className="leaderboard-player">
                                <div className={`leaderboard-rank rank-${i < 3 ? i + 1 : 'default'}`}>
                                    {player.rank}
                                </div>
                                <span className="leaderboard-name">{player.displayName}</span>
                            </div>
                            <div className="leaderboard-stats">
                                <span className="leaderboard-winrate">{player.winRate}%</span>
                                <span className="leaderboard-rating">{player.rating}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Match History */}
            {matchHistory && matchHistory.length > 0 && (
                <>
                    <h3 className="section-header section-header-top">最近の対局</h3>
                    <div className="match-history-list">
                        {matchHistory.slice(0, MAX_VISIBLE_HISTORY).map((match, i) => (
                            <div key={i} className="friend-item">
                                <div className="match-history-player">
                                    <div className={`match-result-dot ${match.result}`}></div>
                                    <span className="match-opponent">{match.opponentName}</span>
                                </div>
                                <span className={`match-rating-change ${match.ratingChange >= 0 ? 'positive' : 'negative'}`}>
                                    {match.ratingChange >= 0 ? '+' : ''}{match.ratingChange}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
                <>
                    <h3 className="section-header section-header-top">獲得バッジ</h3>
                    <div className="achievements-grid">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                title={achievement.description}
                                className="achievement-badge"
                            >
                                <span>{achievement.icon}</span>
                                <span>{achievement.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Detailed Stats */}
            {detailedStats && (
                <>
                    <h3 className="section-header section-header-top">詳細統計</h3>
                    <div className="detailed-stats-grid">
                        <div className="stat-card stat-card-sm">
                            <div className="stat-label-sm">先手（白）勝率</div>
                            <div className="stat-value-colored cyan">{whiteWinRate}%</div>
                        </div>
                        <div className="stat-card stat-card-sm">
                            <div className="stat-label-sm">後手（黒）勝率</div>
                            <div className="stat-value-colored rose">{blackWinRate}%</div>
                        </div>
                        <div className="stat-card stat-card-sm">
                            <div className="stat-label-sm">最長連勝</div>
                            <div className="stat-value-colored amber">{detailedStats.longestWinStreak || 0}</div>
                        </div>
                        <div className="stat-card stat-card-sm">
                            <div className="stat-label-sm">今週のプレイ</div>
                            <div className="stat-value-colored indigo">{detailedStats.gamesThisWeek || 0}</div>
                        </div>
                    </div>
                </>
            )}

            {/* Game Records */}
            {gameRecords && gameRecords.length > 0 && (
                <>
                    <h3 className="section-header section-header-top">棋譜記録</h3>
                    <p className="game-records-note">
                        ※ 棋譜は{retentionDays || 90}日後に自動的に削除されます
                    </p>
                    <div className="game-records-list">
                        {gameRecords.slice(0, MAX_VISIBLE_RECORDS).map((record, i) => (
                            <div key={i} className="friend-item">
                                <div className="game-record-info">
                                    <div className={`match-result-dot ${record.result}`}></div>
                                    <div>
                                        <span className="game-record-opponent">vs {record.opponentName}</span>
                                        <span className="game-record-moves">{record.moveCount}手</span>
                                    </div>
                                </div>
                                <span className="game-record-date">
                                    {new Date(record.playedAt).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default ProfileTab;
