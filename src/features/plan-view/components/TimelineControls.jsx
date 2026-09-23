import React from 'react';
import { CompressOutlined } from '@ant-design/icons';

/**
 * Professional Timeline View zoom and fit controls.
 * Clean, compact toolbar group.
 */
export const TimelineControls = ({
  zoomLevelDisplay = 'Fit',
  isFit = true,
  canZoomIn = true,
  canZoomOut = true,
  onZoomIn,
  onZoomOut,
  onZoomFit,
}) => {
  return (
    <div className="inline-flex items-center bg-white border border-slate-200/90 rounded-lg p-0.5 shadow-xs">
      <span className="text-[11px] font-semibold text-slate-500 px-2 select-none hidden sm:inline">
        Timeline View
      </span>
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className="w-7 h-6.5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-sm transition-colors cursor-pointer select-none"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        −
      </button>
      <span className="text-[11px] font-bold text-slate-700 w-11 text-center select-none font-mono tracking-tight">
        {zoomLevelDisplay}
      </span>
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className="w-7 h-6.5 flex items-center justify-center rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent font-bold text-sm transition-colors cursor-pointer select-none"
        title="Zoom In"
        aria-label="Zoom In"
      >
        +
      </button>
      <button
        type="button"
        onClick={onZoomFit}
        className={`px-2.5 h-6.5 flex items-center gap-1 rounded text-[11px] font-semibold transition-all cursor-pointer select-none ${
          isFit
            ? 'bg-blue-600 text-white shadow-xs'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
        }`}
        title="Fit timeline to screen width"
      >
        <CompressOutlined className="text-[10px]" />
        <span>Fit</span>
      </button>
    </div>
  );
};
