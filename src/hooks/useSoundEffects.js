/**
 * useSoundEffects Hook - Game Sound Effects
 * Plays sounds for moves, wins, losses, and UI interactions
 */
import { useCallback, useRef, useEffect } from 'react';

// Sound URLs (using Web Audio API frequency tones)
const SOUNDS = {
    move: { frequency: 440, duration: 0.1, type: 'sine' },
    capture: { frequency: 220, duration: 0.15, type: 'square' },
    check: { frequency: 880, duration: 0.2, type: 'sawtooth' },
    win: { frequencies: [523, 659, 784], duration: 0.3, type: 'sine' },
    lose: { frequencies: [392, 330, 262], duration: 0.4, type: 'triangle' },
    click: { frequency: 600, duration: 0.05, type: 'sine' },
    matchFound: { frequencies: [440, 554, 659], duration: 0.2, type: 'sine' },
    countdown: { frequency: 880, duration: 0.1, type: 'square' },
    chat: { frequency: 520, duration: 0.08, type: 'sine' },
};

const LOCAL_STORAGE_KEY = 'qgambit_sound_settings';

export function useSoundEffects() {
    const audioContextRef = useRef(null);
    const enabledRef = useRef(true);
    const volumeRef = useRef(0.3);

    // Load settings
    useEffect(() => {
        try {
            const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (saved) {
                const { enabled, volume } = JSON.parse(saved);
                enabledRef.current = enabled ?? true;
                volumeRef.current = volume ?? 0.3;
            }
        } catch (e) {
            console.warn('[Sound] Settings load error:', e);
        }
    }, []);

    // Get or create audio context
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContextRef.current;
    }, []);

    // Play a single tone
    const playTone = useCallback((frequency, duration, type = 'sine') => {
        if (!enabledRef.current) return;

        try {
            const ctx = getAudioContext();
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(volumeRef.current, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            console.warn('[Sound] Play error:', e);
        }
    }, [getAudioContext]);

    // Play a chord (multiple frequencies)
    const playChord = useCallback((frequencies, duration, type = 'sine') => {
        if (!enabledRef.current) return;

        frequencies.forEach((freq, i) => {
            setTimeout(() => {
                playTone(freq, duration, type);
            }, i * 100);
        });
    }, [playTone]);

    // Sound effect functions
    const playMove = useCallback(() => {
        playTone(SOUNDS.move.frequency, SOUNDS.move.duration, SOUNDS.move.type);
    }, [playTone]);

    const playCapture = useCallback(() => {
        playTone(SOUNDS.capture.frequency, SOUNDS.capture.duration, SOUNDS.capture.type);
    }, [playTone]);

    const playCheck = useCallback(() => {
        playTone(SOUNDS.check.frequency, SOUNDS.check.duration, SOUNDS.check.type);
    }, [playTone]);

    const playWin = useCallback(() => {
        playChord(SOUNDS.win.frequencies, SOUNDS.win.duration, SOUNDS.win.type);
    }, [playChord]);

    const playLose = useCallback(() => {
        playChord(SOUNDS.lose.frequencies, SOUNDS.lose.duration, SOUNDS.lose.type);
    }, [playChord]);

    const playClick = useCallback(() => {
        playTone(SOUNDS.click.frequency, SOUNDS.click.duration, SOUNDS.click.type);
    }, [playTone]);

    const playMatchFound = useCallback(() => {
        playChord(SOUNDS.matchFound.frequencies, SOUNDS.matchFound.duration, SOUNDS.matchFound.type);
    }, [playChord]);

    const playCountdown = useCallback(() => {
        playTone(SOUNDS.countdown.frequency, SOUNDS.countdown.duration, SOUNDS.countdown.type);
    }, [playTone]);

    const playChat = useCallback(() => {
        playTone(SOUNDS.chat.frequency, SOUNDS.chat.duration, SOUNDS.chat.type);
    }, [playTone]);

    // Settings
    const setEnabled = useCallback((enabled) => {
        enabledRef.current = enabled;
        try {
            const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...saved, enabled }));
        } catch (e) { }
    }, []);

    const setVolume = useCallback((volume) => {
        volumeRef.current = Math.max(0, Math.min(1, volume));
        try {
            const saved = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ ...saved, volume: volumeRef.current }));
        } catch (e) { }
    }, []);

    return {
        playMove,
        playCapture,
        playCheck,
        playWin,
        playLose,
        playClick,
        playMatchFound,
        playCountdown,
        playChat,
        setEnabled,
        setVolume,
        isEnabled: () => enabledRef.current,
        getVolume: () => volumeRef.current,
    };
}
