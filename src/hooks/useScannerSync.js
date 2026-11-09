// src/hooks/useScannerSync.js
import { useEffect } from 'react';
import { syncDirectory } from '../services/syncService';

// A module-level flag so the scanner screen can pause syncing while processing
let isScanning = false;
export const setScannerActive = (active) => { isScanning = active; };

/** Polls while the scanner screen is mounted; network work never runs on the camera frame path. */
export function useScannerSync() {
  useEffect(() => {
    syncDirectory();
    const timer = setInterval(() => {
      // Skip sync if the user is actively scanning
      if (!isScanning) {
        syncDirectory();
      }
    }, 60000);
    return () => clearInterval(timer);
  }, []);
}