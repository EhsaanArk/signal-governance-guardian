
import React from 'react';

const HeatmapLegend: React.FC = () => {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
      <span className="font-medium">Loss Events Intensity:</span>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-gray-100 rounded border"></div>
        <span>None (0)</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-yellow-200 rounded border"></div>
        <span>Low (1-2)</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-orange-300 rounded border"></div>
        <span>Medium (3-5)</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-red-400 rounded border"></div>
        <span>High (6-10)</span>
      </div>
      <div className="flex items-center gap-1">
        <div className="w-4 h-4 bg-red-600 rounded border"></div>
        <span>Critical (10+)</span>
      </div>
    </div>
  );
};

export default HeatmapLegend;
