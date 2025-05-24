
import React, { useState, useEffect } from 'react';

const LiveTicker = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Last updated {formatTime(lastUpdated)}</span>
    </div>
  );
};

export default LiveTicker;
