
import React, { createContext, useState, ReactNode, useEffect } from 'react';

interface TrackingContextProps {
  trackingActive: boolean;
  trackingTimeLeft: number;
  setTrackingActive: React.Dispatch<React.SetStateAction<boolean>>;
  setTrackingTimeLeft: React.Dispatch<React.SetStateAction<number>>;
  startTracking: () => void;
  resetTracking: () => void;
}

export const TrackingContext = createContext<TrackingContextProps>({
  trackingActive: false,
  trackingTimeLeft: 0,
  setTrackingActive: () => {},
  setTrackingTimeLeft: () => {},
  startTracking: () => {},
  resetTracking: () => {},
});

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [trackingActive, setTrackingActive] = useState(false);
  const [trackingTimeLeft, setTrackingTimeLeft] = useState(0);
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (trackingActive && trackingTimeLeft > 0) {
      timer = setInterval(() => {
        setTrackingTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setTrackingActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [trackingActive, trackingTimeLeft]);

  const startTracking = () => {
    setTrackingActive(true);
    setTrackingTimeLeft(3600); // 1 hora en segundos
  };

  const resetTracking = () => {
    setTrackingActive(false);
    setTrackingTimeLeft(0);
  };

  return (
    <TrackingContext.Provider
      value={{ trackingActive, trackingTimeLeft, setTrackingActive, setTrackingTimeLeft, startTracking, resetTracking }}
    >
      {children}
    </TrackingContext.Provider>
  );
}