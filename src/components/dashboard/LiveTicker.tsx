
import React, { useState, useEffect } from 'react';

const LiveTicker = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'fresh' | 'stale' | 'error'>('fresh');

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      
      // Simulate data freshness check
      const now = new Date();
      const timeDiff = (now.getTime() - lastUpdated.getTime()) / 1000;
      
      if (timeDiff < 60) {
        setConnectionStatus('fresh');
      } else if (timeDiff < 300) {
        setConnectionStatus('stale');
      } else {
        setConnectionStatus('error');
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastUpdated]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'fresh':
        return 'bg-green-500';
      case 'stale':
        return 'bg-amber-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusText = () => {
    const time = formatTime(lastUpdated);
    switch (connectionStatus) {
      case 'fresh':
        return `Last updated ${time}`;
      case 'stale':
        return `Updated ${time} (data may be stale)`;
      case 'error':
        return `Last update ${time} (connection issues)`;
      default:
        return `Last updated ${time}`;
    }
  };

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <div className={`w-2 h-2 rounded-full animate-pulse ${getStatusColor()}`}></div>
      <span>{getStatusText()}</span>
    </div>
  );
};

export default LiveTicker;
