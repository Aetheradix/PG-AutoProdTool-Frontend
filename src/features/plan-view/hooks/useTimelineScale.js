import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const ZOOM_STEPS = [50, 75, 100, 125, 150, 200];

/**
 * useTimelineScale hook
 *
 * Handles dynamic timeline width scaling, responsive resize tracking,
 * and user zoom controls (Zoom In, Zoom Out, Fit to Screen).
 *
 * Ensures that the currently selected time range automatically fits the
 * available viewport without horizontal scrolling whenever readable,
 * and gracefully provides scrolling with a smart minimum width or when zoomed.
 */
export const useTimelineScale = ({
  slotCount = 1,
  fixedLeftWidth = 192,
  minSlotWidth = 50,
  initialZoom = 'fit',
  scrollRef = null,
}) => {
  const localContainerRef = useRef(null);
  const containerRef = scrollRef || localContainerRef;

  const [containerWidth, setContainerWidth] = useState(0);
  const [zoomMode, setZoomMode] = useState(initialZoom); // 'fit' | 50 | 75 | 100 | 125 | 150 | 200

  // Track container width with ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      if (el) {
        setContainerWidth(el.clientWidth || 0);
      }
    };

    // Initial measurement
    measure();

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          measure();
        } else {
          measure();
        }
      }
    });

    ro.observe(el);
    window.addEventListener('resize', measure);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [containerRef]);

  const safeSlotCount = Math.max(slotCount, 1);
  const availableTimelineWidth = Math.max(containerWidth - fixedLeftWidth, 0);

  // Natural slot width if we spread slots across the available viewport
  const naturalSlotWidth =
    availableTimelineWidth > 0 ? availableTimelineWidth / safeSlotCount : minSlotWidth;

  const isFit = zoomMode === 'fit';

  // Calculate effective slot width based on mode
  const { effectiveSlotWidth, isOverflowing, totalTimelineWidth, totalWidth } = useMemo(() => {
    let slotW;
    let overflowing = false;

    if (isFit) {
      if (naturalSlotWidth >= minSlotWidth) {
        slotW = naturalSlotWidth;
        overflowing = false;
      } else {
        // Range has too many slots to fit legibly in screen -> apply smart minimum width
        slotW = minSlotWidth;
        overflowing = true;
      }
    } else {
      // Numerical zoom percentage (e.g. 75%, 100%, 125%, 150%, 200%)
      const base = Math.max(naturalSlotWidth, minSlotWidth);
      slotW = Math.max(Math.round(base * (zoomMode / 100)), 35);
      overflowing = slotW * safeSlotCount > availableTimelineWidth + 1;
    }

    const timelineW = overflowing ? Math.round(slotW * safeSlotCount) : availableTimelineWidth;
    const fullW = fixedLeftWidth + timelineW;

    return {
      effectiveSlotWidth: slotW,
      isOverflowing: overflowing,
      totalTimelineWidth: timelineW,
      totalWidth: fullW,
    };
  }, [isFit, zoomMode, naturalSlotWidth, minSlotWidth, safeSlotCount, availableTimelineWidth, fixedLeftWidth]);

  // Zoom In
  const zoomIn = useCallback(() => {
    setZoomMode((prev) => {
      if (prev === 'fit') return 125;
      const idx = ZOOM_STEPS.findIndex((s) => s >= prev);
      if (idx === -1 || idx === ZOOM_STEPS.length - 1) return 200;
      return ZOOM_STEPS[idx + 1];
    });
  }, []);

  // Zoom Out
  const zoomOut = useCallback(() => {
    setZoomMode((prev) => {
      if (prev === 'fit') return 75;
      const idx = ZOOM_STEPS.findIndex((s) => s >= prev);
      if (idx <= 0) return 50;
      return ZOOM_STEPS[idx - 1];
    });
  }, []);

  // Fit to Screen
  const zoomFit = useCallback(() => {
    setZoomMode('fit');
    if (containerRef.current) {
      containerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [containerRef]);

  const canZoomIn = zoomMode === 'fit' || zoomMode < 200;
  const canZoomOut = zoomMode === 'fit' || zoomMode > 50;

  const zoomLevelDisplay = useMemo(() => {
    if (isFit) return 'Fit';
    return `${zoomMode}%`;
  }, [isFit, zoomMode]);

  return {
    containerRef,
    containerWidth,
    availableTimelineWidth,
    effectiveSlotWidth,
    totalTimelineWidth,
    totalWidth,
    isOverflowing,
    isFit,
    zoomMode,
    zoomIn,
    zoomOut,
    zoomFit,
    canZoomIn,
    canZoomOut,
    zoomLevelDisplay,
  };
};
