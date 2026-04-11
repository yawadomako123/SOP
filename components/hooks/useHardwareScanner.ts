'use client';

import { useEffect, useRef } from 'react';

/**
 * Detects input from USB/Bluetooth barcode scanner peripherals.
 * 
 * Hardware scanners behave like keyboards — they rapidly type characters
 * then send Enter. We detect this by timing keystrokes:
 * - Buffer characters arriving < 50ms apart
 * - On Enter: if ≥ 3 chars accumulated quickly → it's a scanner, fire onScan
 * - This does NOT block normal keyboard input or typing in text fields
 */
export function useHardwareScanner(
  onScan: (barcode: string) => void,
  enabled: boolean = true
): void {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const SCANNER_THRESHOLD_MS = 50; // scanners type each char within 50ms
    const MIN_BARCODE_LENGTH = 3;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // Clear any pending reset timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      if (e.key === 'Enter') {
        const barcode = bufferRef.current.trim();
        if (barcode.length >= MIN_BARCODE_LENGTH) {
          // Only treat as scanner if all chars came in fast
          onScan(barcode);
        }
        bufferRef.current = '';
        lastKeyTimeRef.current = 0;
        return;
      }

      // If too slow between keys — it's a human typing, reset buffer
      if (bufferRef.current.length > 0 && timeSinceLastKey > SCANNER_THRESHOLD_MS) {
        bufferRef.current = '';
      }

      // Only buffer printable single characters
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        lastKeyTimeRef.current = now;

        // Auto-clear buffer after 200ms of inactivity (no Enter received)
        timerRef.current = setTimeout(() => {
          bufferRef.current = '';
          lastKeyTimeRef.current = 0;
        }, 200);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, onScan]);
}
