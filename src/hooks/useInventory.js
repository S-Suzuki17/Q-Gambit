import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'q-gambit-inventory';

// Piece Synthesis Hierarchy
const PIECE_RANKS = ['P', 'N', 'B', 'R', 'Q', 'K'];
const SYNTHESIS_COST = 2; // 2 lower rank = 1 higher rank

// Exchange Rates (Tickets per piece)
const EXCHANGE_RATES = {
    P: 1,
    N: 3,
    B: 7,
    R: 15,
    Q: 31,
    K: 63
};

export const useInventory = (grantBonusGame) => {
    const [inventory, setInventory] = useState({
        P: 0, N: 0, B: 0, R: 0, Q: 0, K: 0
    });

    // Load inventory
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setInventory(JSON.parse(saved));
            }
        } catch (e) {
            console.warn('Inventory load error:', e);
        }
    }, []);

    const saveInventory = (newInv) => {
        setInventory(newInv);
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newInv));
        } catch (e) { console.warn('Save error', e); }
    };

    const addPiece = useCallback((type = 'P', amount = 1) => {
        setInventory(prev => {
            const newInv = { ...prev, [type]: (prev[type] || 0) + amount };
            saveInventory(newInv); // We can call save here securely
            return newInv;
        });
    }, []);

    const synthesize = useCallback((targetType) => {
        const rankIndex = PIECE_RANKS.indexOf(targetType);
        if (rankIndex <= 0) return false;

        const sourceType = PIECE_RANKS[rankIndex - 1];

        // We read from 'inventory' state in scope to check logic, 
        // preventing side effects inside updater
        // Note: inventory might be stale in closure if not in deps, but we add it.
        const sourceCount = inventory[sourceType] || 0;

        if (sourceCount < SYNTHESIS_COST) return false;

        const newInv = {
            ...inventory,
            [sourceType]: sourceCount - SYNTHESIS_COST,
            [targetType]: (inventory[targetType] || 0) + 1
        };
        saveInventory(newInv);
        return true;
    }, [inventory]);

    const exchange = useCallback((type) => {
        const ticketValue = EXCHANGE_RATES[type];
        if (!ticketValue) return false;

        const count = inventory[type] || 0;
        if (count < 1) return false;

        // Update inventory
        const newInv = { ...inventory, [type]: count - 1 };
        saveInventory(newInv);

        // Grant tickets (Outside updater -> safe)
        if (grantBonusGame) {
            grantBonusGame(ticketValue);
        }
        return true;
    }, [inventory, grantBonusGame]);

    return {
        inventory,
        addPiece,
        synthesize,
        exchange,
        rates: EXCHANGE_RATES
    };
};
