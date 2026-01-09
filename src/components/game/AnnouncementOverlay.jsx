import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const AnnouncementOverlay = ({ message, subMessage, type = 'info' }) => {
    // type: 'info', 'warning' (check), 'danger' (mate), 'success' (win)

    const colors = {
        info: 'from-cyan-400 to-blue-500',
        warning: 'from-yellow-400 to-orange-500',
        danger: 'from-red-500 to-rose-600',
        success: 'from-green-400 to-emerald-600'
    };

    return (
        <AnimatePresence>
            {message && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 50 }}
                        animate={{ opacity: 1, scale: 1.2, y: 0 }}
                        exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="text-center relative"
                    >
                        {/* Glitch/Shadow Effect */}
                        <motion.h1
                            className={`text-6xl md:text-8xl font-black italic tracking-tighter bg-gradient-to-br ${colors[type] || colors.info} bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] filter contrast-125`}
                            animate={{
                                textShadow: [
                                    "0 0 0px rgba(0,0,0,0)",
                                    "-2px 2px 0px rgba(0,255,255,0.5)",
                                    "2px -2px 0px rgba(255,0,0,0.5)",
                                    "0 0 0px rgba(0,0,0,0)"
                                ],
                                skew: [0, -5, 5, 0]
                            }}
                            transition={{ duration: 0.2, repeat: 3, repeatType: "mirror" }}
                        >
                            {message}
                        </motion.h1>

                        {subMessage && (
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-white font-bold text-xl md:text-2xl mt-2 tracking-widest uppercase bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm"
                            >
                                {subMessage}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Shockwave visual */}
                    <motion.div
                        className={`absolute rounded-full border-4 border-white/30`}
                        initial={{ width: 0, height: 0, opacity: 0.8 }}
                        animate={{ width: 500, height: 500, opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
            )}
        </AnimatePresence>
    );
};
