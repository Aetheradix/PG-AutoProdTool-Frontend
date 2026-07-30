import React, { useRef, useEffect, useState } from 'react';

/**
 * Computes the fill percentage (0–100) for display in the visual level bar.
 *
 * - If unit is '%', use current_value directly (capped at 100).
 * - If unit is 'kg', we don't have a true max capacity in the API response,
 *   so we estimate max as 4× the dead-stock threshold. This gives a sensible
 *   visual: a tank sitting right at deadstock (~25%) looks low, and a tank
 *   with 4× deadstock or more looks full.
 */
function computeFillPercent(currentValue, deadstockValue, unit) {
    if (unit === '%') {
        return Math.min(Math.max(currentValue, 0), 100);
    }
    // kg unit: estimate max = 4 × deadstock, give at least some fill if value > 0
    const estimatedMax = deadstockValue * 4;
    if (!estimatedMax || estimatedMax === 0) return 0;
    return Math.min((currentValue / estimatedMax) * 100, 100);
}

/**
 * Returns color tokens based on the hex_code / status from the API.
 * We map to curated palette values for a more premium look.
 */
function getStatusColors(hexCode, fillPercent) {
    const lowerHex = (hexCode || '').toLowerCase();
    if (lowerHex === '#dc3545' || lowerHex === '#c00000') {
        // Danger / low — red palette
        return {
            fillFrom: '#ef4444',
            fillTo: '#dc2626',
            glowColor: 'rgba(239,68,68,0.35)',
            badgeBg: 'rgba(239,68,68,0.12)',
            badgeText: '#dc2626',
            badgeBorder: 'rgba(239,68,68,0.25)',
            label: 'LOW',
        };
    }
    if (lowerHex === '#ffc107' || lowerHex === '#fd7e14') {
        // Warning — amber palette
        return {
            fillFrom: '#f59e0b',
            fillTo: '#d97706',
            glowColor: 'rgba(245,158,11,0.35)',
            badgeBg: 'rgba(245,158,11,0.12)',
            badgeText: '#b45309',
            badgeBorder: 'rgba(245,158,11,0.25)',
            label: 'MED',
        };
    }
    // Default — success / green palette
    return {
        fillFrom: '#22c55e',
        fillTo: '#16a34a',
        glowColor: 'rgba(34,197,94,0.30)',
        badgeBg: 'rgba(34,197,94,0.12)',
        badgeText: '#15803d',
        badgeBorder: 'rgba(34,197,94,0.25)',
        label: 'OK',
    };
}

/** Format tank_name into a readable label: remove suffixes, replace _ with space */
function formatTankName(name) {
    return name
        .replace(/_Level$/i, '')
        .replace(/_/g, ' ')
        .trim();
}

const RMTankCard = ({ tank }) => {
    const { name, value, unit, hexCode, dead_stock } = tank;

    const fillPercent = computeFillPercent(value, dead_stock, unit);
    const colors = getStatusColors(hexCode, fillPercent);
    const displayLabel = formatTankName(name);

    // Animate fill on mount
    const [animatedFill, setAnimatedFill] = useState(0);
    useEffect(() => {
        const raf = requestAnimationFrame(() => {
            setTimeout(() => setAnimatedFill(fillPercent), 80);
        });
        return () => cancelAnimationFrame(raf);
    }, [fillPercent]);

    // Display value string
    const displayValue =
        unit === '%'
            ? `${value.toFixed(1)}%`
            : `${value.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`;

    const fillPercentRounded = Math.round(animatedFill);

    return (
        <div
            className="rm-tank-card"
            style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e8edf5',
                padding: '16px 14px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 0 0 0 transparent',
                transition: 'box-shadow 0.25s, transform 0.25s',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '220px',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.10), 0 0 0 1px ${colors.fillFrom}40`;
                e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
        >
            {/* Header with Title and Badge */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div
                    style={{
                        background: colors.badgeBg,
                        color: colors.badgeText,
                        border: `1px solid ${colors.badgeBorder}`,
                        borderRadius: '6px',
                        padding: '1px 6px',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '0.06em',
                        lineHeight: '1.3',
                        alignSelf: 'center',
                    }}
                >
                    {colors.label}
                </div>
                <div
                    title={displayLabel}
                    style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#334155',
                        textAlign: 'center',
                        letterSpacing: '0.02em',
                        lineHeight: '1.25',
                        maxWidth: '100%',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis',
                        textTransform: 'uppercase',
                        minHeight: '26px',
                    }}
                >
                    {displayLabel}
                </div>
            </div>

            {/* Visual tank container */}
            <div
                style={{
                    width: '52px',
                    height: '100px',
                    background: '#f1f5f9',
                    borderRadius: '10px',
                    border: '2px solid #cbd5e1',
                    position: 'relative',
                    overflow: 'hidden',
                    flexShrink: 0,
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.07)',
                }}
            >
                {/* Tick marks on the side */}
                {[75, 50, 25].map((tick) => (
                    <div
                        key={tick}
                        style={{
                            position: 'absolute',
                            right: '-1px',
                            bottom: `${tick}%`,
                            width: '7px',
                            height: '1px',
                            background: '#94a3b8',
                        }}
                    />
                ))}

                {/* Animated fill */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${animatedFill}%`,
                        background: `linear-gradient(180deg, ${colors.fillFrom} 0%, ${colors.fillTo} 100%)`,
                        transition: 'height 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        boxShadow: `0 -4px 12px ${colors.glowColor}`,
                    }}
                >
                    {/* Shimmer wave */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: '-50%',
                            width: '200%',
                            height: '4px',
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                            animation: 'shimmer-wave 2.5s infinite linear',
                        }}
                    />
                </div>

                {/* Percentage overlay inside tank */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: 800,
                        color: animatedFill > 50 ? 'rgba(255,255,255,0.95)' : '#334155',
                        textShadow: animatedFill > 50 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none',
                        zIndex: 1,
                        letterSpacing: '-0.02em',
                        pointerEvents: 'none',
                    }}
                >
                    {fillPercentRounded}%
                </div>
            </div>

            {/* Value display */}
            <div style={{ textAlign: 'center' }}>
                <div
                    style={{
                        fontSize: '14px',
                        fontWeight: 800,
                        color: '#0f172a',
                        letterSpacing: '-0.02em',
                        lineHeight: '1.1',
                    }}
                >
                    {displayValue}
                </div>
                {dead_stock && (
                    <div
                        style={{
                            fontSize: '10px',
                            color: '#94a3b8',
                            marginTop: '3px',
                            fontWeight: 500,
                        }}
                    >
                        Dead stock: {dead_stock} {unit === 'kg' ? 'kg' : '%'}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RMTankCard;
