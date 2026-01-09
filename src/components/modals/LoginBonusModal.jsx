import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Calendar, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Particle effect placeholder (we can use the FX system later or simple CSS animations)

export const LoginBonusModal = ({ streak, onClaim }) => {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="relative w-full max-w-sm p-1 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-500 to-rose-500 shadow-[0_0_50px_rgba(34,211,238,0.3)]"
                    initial={{ scale: 0.8, y: 50 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", damping: 12 }}
                >
                    <div className="bg-[#0a0a0a] rounded-xl p-6 text-center overflow-hidden relative">
                        {/* Background Decor */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(34,211,238,0.2)_0%,transparent_70%)] animate-pulse" />
                        </div>

                        {/* Icon */}
                        <div className="relative mb-6 mx-auto w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-tr from-cyan-900/50 to-purple-900/50 border border-white/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                            <Calendar size={40} className="text-cyan-400" />
                            <motion.div
                                className="absolute -top-1 -right-1"
                                animate={{ rotate: [0, 15, -15, 0] }}
                                transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                            >
                                <Sparkles size={24} className="text-yellow-400 drop-shadow-glow" />
                            </motion.div>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2 font-orbitron">
                            {t('bonus.dailyLogin', 'Daily Login Bonus')}
                        </h2>

                        {/* Streak Display */}
                        <div className="mb-6">
                            <p className="text-gray-400 text-sm mb-1">{t('bonus.currentStreak', 'Current Streak')}</p>
                            <div className="text-4xl font-bold text-white font-mono tracking-wider flex items-center justify-center gap-2">
                                <span>{streak}</span>
                                <span className="text-lg text-purple-400">{t('bonus.days', 'DAYS')}</span>
                            </div>
                        </div>

                        {/* Reward Visualization */}
                        <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-cyan-300 font-bold text-lg mb-1">
                                +100 <span className="text-xs font-normal text-gray-400">Q-BITS</span>
                            </p>
                            <p className="text-xs text-gray-500">
                                {t('bonus.comeBackTomorrow', 'Come back tomorrow for more!')}
                            </p>
                        </div>

                        {/* Claim Button */}
                        <motion.button
                            onClick={onClaim}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 px-6 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold tracking-wide shadow-lg hover:shadow-cyan-500/30 transition-shadow relative overflow-hidden group"
                        >
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                <Check size={18} />
                                {t('bonus.claim', 'CLAIM REWARD')}
                            </span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </motion.button>

                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
