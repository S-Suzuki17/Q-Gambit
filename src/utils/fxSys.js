/**
 * FX System
 * Simple event bus for triggering visual effects from game logic
 */

class FXSystem {
    constructor() {
        this.listeners = new Set();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    trigger(type, data) {
        this.listeners.forEach(cb => cb(type, data));
    }

    // Convenience methods
    explode(x, y, color) {
        this.trigger('explode', { x, y, color });
    }

    ripple(x, y, color) {
        this.trigger('ripple', { x, y, color });
    }

    scan(y, color) {
        this.trigger('scan', { y, color });
    }
}

export const fxSys = new FXSystem();
