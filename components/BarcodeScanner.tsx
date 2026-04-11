'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, X, AlertCircle, Loader2 } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  buttonLabel?: string;
  /** 'icon' = just the camera icon button, 'full' = icon + label */
  buttonVariant?: 'icon' | 'full';
  /** Extra classes for the trigger button */
  buttonClassName?: string;
}

export default function BarcodeScanner({
  onScan,
  buttonLabel = 'Scan',
  buttonVariant = 'full',
  buttonClassName = '',
}: BarcodeScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  // Enumerate cameras when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    setError(null);

    BrowserMultiFormatReader.listVideoInputDevices()
      .then((devices) => {
        setCameras(devices);
        if (devices.length > 0) {
          // Prefer rear camera on mobile if available
          const rear = devices.find(d =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
          );
          setSelectedCamera(rear?.deviceId ?? devices[0].deviceId);
        } else {
          setError('No camera found on this device.');
        }
      })
      .catch(() => setError('Could not access camera. Please check browser permissions.'))
      .finally(() => setIsLoading(false));

    return () => {
      stopScanning();
    };
  }, [isOpen]);

  // Start scanning when a camera is selected
  useEffect(() => {
    if (!isOpen || !selectedCamera || !videoRef.current) return;

    startScanning(selectedCamera);

    return () => stopScanning();
  }, [isOpen, selectedCamera]);

  const startScanning = async (deviceId: string) => {
    stopScanning();
    setError(null);

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const controls = await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        (result, err) => {
          if (result) {
            const text = result.getText();
            handleScanResult(text);
          }
          // NotFoundException fires repeatedly while scanning — suppress it
          if (err && !(err instanceof NotFoundException)) {
            console.error('Scanner error:', err);
          }
        }
      );
      controlsRef.current = controls;
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access in your browser settings.');
      } else if (err?.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else {
        setError('Failed to start camera. Please try again.');
      }
    }
  };

  const stopScanning = () => {
    try {
      controlsRef.current?.stop();
    } catch (_) { /* ignore */ }
    controlsRef.current = null;
    readerRef.current = null;
  };

  const handleScanResult = (barcode: string) => {
    stopScanning();
    setIsOpen(false);
    onScan(barcode);
  };

  const handleClose = () => {
    stopScanning();
    setIsOpen(false);
    setError(null);
    setCameras([]);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        title="Scan barcode with camera"
        className={
          buttonVariant === 'icon'
            ? `flex items-center justify-center p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors ${buttonClassName}`
            : `flex items-center gap-1.5 px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors font-medium text-sm ${buttonClassName}`
        }
      >
        <Camera className="w-4 h-4" />
        {buttonVariant === 'full' && <span>{buttonLabel}</span>}
      </button>

      {/* Scanner Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={handleClose}>
          <div
            className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base">Scan Barcode</h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Area */}
            <div className="relative bg-black aspect-video">
              <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />

              {/* Scanning overlay */}
              {!error && !isLoading && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {/* Corner brackets */}
                  <div className="relative w-48 h-32">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br" />
                    {/* Scanning line */}
                    <div className="absolute left-2 right-2 h-0.5 bg-primary/80 shadow-[0_0_6px_2px_hsl(var(--primary)/0.4)] animate-scanner-line" />
                  </div>
                </div>
              )}

              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-white text-sm font-medium">Starting camera...</p>
                </div>
              )}

              {/* Error overlay */}
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
                  <AlertCircle className="w-10 h-10 text-red-400" />
                  <p className="text-white text-sm font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 space-y-3">
              {/* Camera selector */}
              {cameras.length > 1 && (
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary appearance-none font-medium"
                >
                  {cameras.map((cam, i) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera ${i + 1}`}
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-muted-foreground text-center">
                Point the camera at a barcode to scan automatically
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2 text-sm font-medium border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
