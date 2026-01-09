import React, { useEffect, useRef } from 'react';
import { fxSys } from '../../utils/fxSys';

const PARTICLE_COUNT = 30;
const GRAVITY = 0.5;
const FRICTION = 0.95;

function FXCanvas() {
    const canvasRef = useRef(null);
    const particles = useRef([]);
    const ripples = useRef([]);
    const frameId = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        const createExplosion = ({ x, y, color }) => {
            // Convert board coords to pixel coords
            // Board is 8x8. We assume canvas covers the board perfectly.
            const cellSize = canvas.width / 8;
            const px = x * cellSize + cellSize / 2;
            // Invert Y because board 0 is bottom
            // Wait, looking at ChessBoard.jsx:
            // "White is at bottom (rows 0-1 visually at bottom)" -> 0 is bottom.
            // HTML coordinates: 0 is top.
            // So board y=0 is canvas y=height - cellSize.
            const py = canvas.height - (y * cellSize + cellSize / 2);

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                particles.current.push({
                    x: px,
                    y: py,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: color || '#fff',
                    life: 1.0,
                    size: Math.random() * 4 + 2
                });
            }
        };

        const createRipple = ({ x, y, color }) => {
            const cellSize = canvas.width / 8;
            const px = x * cellSize + cellSize / 2;
            const py = canvas.height - (y * cellSize + cellSize / 2);

            ripples.current.push({
                x: px,
                y: py,
                radius: 0,
                color: color || '#22d3ee',
                life: 1.0,
                maxRadius: cellSize * 1.5
            });
        };

        const handleFX = (type, data) => {
            // Check settings
            if (localStorage.getItem('q-gambit-graphics') === 'low') return;

            if (type === 'explode') createExplosion(data);
            if (type === 'ripple') createRipple(data);
        };

        const unsubscribe = fxSys.subscribe(handleFX);

        const loop = () => {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalCompositeOperation = 'screen'; // Glowing effect

            // Update & Draw Particles
            for (let i = particles.current.length - 1; i >= 0; i--) {
                const p = particles.current[i];
                p.x += p.vx;
                p.y += p.vy;
                // p.vy += GRAVITY; // Zero gravity for space feel? Or light gravity?
                p.vx *= FRICTION;
                p.vy *= FRICTION;
                p.life -= 0.02;

                if (p.life <= 0) {
                    particles.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = p.life;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Update & Draw Ripples
            for (let i = ripples.current.length - 1; i >= 0; i--) {
                const r = ripples.current[i];
                r.radius += (r.maxRadius - r.radius) * 0.1;
                r.life -= 0.03;

                if (r.life <= 0) {
                    ripples.current.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = r.life;
                ctx.strokeStyle = r.color;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                ctx.stroke();
            }

            ctx.globalAlpha = 1.0;
            ctx.globalCompositeOperation = 'source-over';
            frameId.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            unsubscribe();
            cancelAnimationFrame(frameId.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fx-canvas"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 20
            }}
        />
    );
}

export default React.memo(FXCanvas);
