import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  RotateCcw,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  Loader2,
  SwitchCamera
} from 'lucide-react';
import { getDepartmentLabel } from '../../constants/departmentLabels';
import { RESOLUTION_MAX_ACCURACY_M } from '../../constants/resolution';

export const LiveCameraCapture = ({
  onCapture,
  onClear,
  capturedPhoto,
  isAnalyzing = false,
  aiResult = null,
  allowNativeFallback = true,
  showAiPanel = true,
  captureLocation = false
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [flashEffect, setFlashEffect] = useState(false);

  // Check for available video input devices
  useEffect(() => {
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoInputs.length > 1);
      }).catch(() => {});
    }
  }, []);

  // Stop camera tracks safely
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  // Start live camera stream
  const startCamera = useCallback(async () => {
    stopCamera();
    setCameraError(null);

    // Browsers block getUserMedia on HTTP LAN addresses. The native file input
    // can still ask mobile browsers to open the device camera in that context.
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setCameraError(allowNativeFallback
        ? 'This HTTP page cannot show a live camera preview. Opening your device camera instead.'
        : 'Live camera capture requires a secure page and a supported camera.');
      if (allowNativeFallback) fileInputRef.current?.click();
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(allowNativeFallback
          ? 'Camera permission was denied. Please allow camera permissions in your browser or use the device camera button below.'
          : 'Camera permission was denied. Allow camera access in your browser settings, then try again.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera found on this device. Please connect a webcam or use a mobile device.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unable to open camera'}.`);
      }
      setCameraActive(false);
    }
  }, [allowNativeFallback, facingMode, stopCamera]);

  // The video element is rendered only after cameraActive becomes true. Attach
  // the stream after that render, otherwise the stream can be lost on startup.
  useEffect(() => {
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!cameraActive || !video || !stream) return;

    video.srcObject = stream;
    const play = () => video.play().catch((err) => {
      console.warn('Camera playback failed:', err);
      setCameraError('The camera opened but video playback failed. Close the camera and try again.');
      stopCamera();
    });

    if (video.readyState >= 1) play();
    else video.onloadedmetadata = play;

    return () => {
      video.onloadedmetadata = null;
    };
  }, [cameraActive, stopCamera]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Toggle front/back camera
  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
  };

  // Re-start camera when facingMode changes
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Capture frame from live video feed
  const handleSnap = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setCameraError('Camera is still starting. Wait for the live preview, then capture again.');
      return;
    }

    let locationMeta = {};
    if (captureLocation) {
      try {
        if (!navigator.geolocation) throw new Error('Location is unavailable on this device.');
        const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, timeout: 20000, maximumAge: 0
        }));
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        if (accuracy > RESOLUTION_MAX_ACCURACY_M) {
          setCameraError(`Location accuracy is ${Math.round(accuracy)} m. Wait for a better GPS fix (within ${RESOLUTION_MAX_ACCURACY_M} m) and retake the photo.`);
          return;
        }
        locationMeta = { lat, lng, accuracy };
      } catch (error) {
        const locationErrors = {
          1: 'Location permission was denied. A photo without a location fix cannot be used.',
          2: 'Unable to acquire a location fix. A photo without a location fix cannot be used.',
          3: 'Location request timed out. Try again when GPS reception is better.'
        };
        setCameraError(locationErrors[error.code] || error.message || 'Could not get your location. A photo without a location fix cannot be used.');
        return;
      }
    }

    // Flash animation
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // If front camera, mirror image for natural selfie view
    if (facingMode === 'user') {
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, width, height);

    // Reset transform for watermark
    if (facingMode === 'user') {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Embed authenticity watermark on the canvas
    const now = new Date();
    const timestampStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.fillRect(16, height - 44, 340, 30);
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = '#10b981';
    ctx.fillText('✓ UIIP AUTHENTIC LIVE CAPTURE • ' + timestampStr, 24, height - 24);

    // Convert canvas to Blob & File
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `live_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        const previewUrl = URL.createObjectURL(blob);
        stopCamera();
        onCapture(file, previewUrl, {
          isLiveCaptured: true,
          capturedAt: now.toISOString(),
          dataUrl,
          ...locationMeta
        });
      },
      'image/jpeg',
      0.92
    );
  };

  // Device native camera capture fallback
  const handleNativeCameraFallback = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onload = () => {
      stopCamera();
      onCapture(file, previewUrl, {
        isLiveCaptured: true,
        capturedAt: new Date().toISOString(),
        dataUrl: reader.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRetake = () => {
    onClear();
    startCamera();
  };

  return (
    <div className="live-camera-card">
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Header with Authenticity Assurance */}
      <div className="camera-header-banner">
        <div className="camera-header-title">
          <ShieldCheck size={20} className="shield-icon" />
          <div>
            <strong>Authentic Live Camera Verification</strong>
            <p>{showAiPanel ? 'Live photo capture verifies genuine on-site civic issues and enables instant AI diagnosis.' : 'Capture a live photo at the complaint location. A precise GPS fix is required.'}</p>
          </div>
        </div>
        <span className="live-badge">LIVE ONLY</span>
      </div>

      {/* Hidden file input for native camera fallback */}
      {allowNativeFallback && <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleNativeCameraFallback}
        style={{ display: 'none' }}
      />}

      {/* Captured Photo State */}
      {capturedPhoto ? (
        <div className="captured-preview-container">
          <div className="captured-image-box">
            <img src={capturedPhoto.previewUrl} alt="Live Captured Civic Issue" className="captured-img" />

            <div className="captured-watermark-overlay">
              <span className="verified-tag">
                <CheckCircle size={14} /> Authentic Live Photo
              </span>
              <span className="timestamp-tag">
                {new Date(capturedPhoto.capturedAt || Date.now()).toLocaleTimeString()}
              </span>
            </div>

            {/* AI Analyzing Overlay */}
            {showAiPanel && isAnalyzing && (
              <div className="ai-scanning-overlay">
                <div className="ai-scanning-pulse"></div>
                <div className="ai-scanning-content">
                  <Loader2 size={32} className="animate-spin text-primary" />
                  <h4>AI Model Analyzing Image…</h4>
                  <p>YOLOv8 is detecting potholes, garbage, or waterlogging</p>
                </div>
              </div>
            )}
          </div>

          {/* AI Result Card */}
          {showAiPanel && aiResult && !isAnalyzing && (
            <div className="ai-detection-result-card">
              <div className="ai-result-header">
                <div className="ai-result-title">
                  <Sparkles size={18} className="sparkle-icon" />
                  <strong>AI Detection Diagnosis</strong>
                </div>
                {aiResult.primaryClass && (
                  <span className="ai-confidence-pill">
                    {Math.round((aiResult.confidence ?? 0) * 100)}% Confidence
                  </span>
                )}
              </div>

              <div className="ai-result-grid">
                <div className="ai-result-item">
                  <span className="result-label">
                    {aiResult.needsManualReview ? 'Possible Detection (Review):' : 'Detected Issue:'}
                  </span>
                  <span className="result-value issue-highlight">
                    {aiResult.primaryClass || (aiResult.reviewReason === 'No issue found' ? 'No issue found' : 'Review Required')}
                  </span>
                </div>
                <div className="ai-result-item">
                  <span className="result-label">Suggested Department:</span>
                  <span className="result-value">
                    {getDepartmentLabel(aiResult.suggestedDepartment, 'Municipal Review')}
                  </span>
                </div>
                {aiResult.priority && (
                  <div className="ai-result-item">
                    <span className="result-label">Suggested Priority:</span>
                    <span className={`priority-pill priority-${aiResult.priority.toLowerCase()}`}>
                      {aiResult.priority}
                    </span>
                  </div>
                )}
              </div>

              <p className="ai-diagnosis-hint">
                AI diagnosis is advisory. Add a clear description of the issue below.
              </p>
            </div>
          )}

          {/* Retake Action Bar */}
          <div className="captured-actions-bar">
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleRetake}>
              <RotateCcw size={15} /> Retake Photo
            </button>
            <span className="photo-confirmed-text">
              <CheckCircle size={15} className="text-success" /> Live Evidence Attached
            </span>
          </div>
        </div>
      ) : cameraActive ? (
        /* Active Camera Viewfinder */
        <div className={`camera-viewfinder-box ${flashEffect ? 'flash-active' : ''}`}>
          <video ref={videoRef} autoPlay playsInline muted className="camera-video-feed" />

          {/* Viewfinder crosshairs and guidelines */}
          <div className="viewfinder-overlay">
            <div className="viewfinder-frame">
              <div className="frame-corner top-left"></div>
              <div className="frame-corner top-right"></div>
              <div className="frame-corner bottom-left"></div>
              <div className="frame-corner bottom-right"></div>
              <div className="viewfinder-center-reticle"></div>
            </div>
            <p className="viewfinder-instruction">
              {showAiPanel ? 'Center the pothole, garbage, or civic damage in the frame' : 'Frame the completed repair, then capture on site'}
            </p>
          </div>

          {/* Camera Controls */}
          <div className="camera-controls-bar">
            {hasMultipleCameras && (
              <button
                type="button"
                className="camera-ctrl-btn"
                onClick={toggleCamera}
                title="Switch front/rear camera"
              >
                <SwitchCamera size={20} />
              </button>
            )}

            {/* Shutter Button */}
            <button
              type="button"
              className="shutter-button"
              onClick={handleSnap}
              title="Capture Live Photo"
            >
              <div className="shutter-inner">
                <Camera size={26} />
              </div>
            </button>

            <button
              type="button"
              className="camera-ctrl-btn btn-cancel-camera"
              onClick={stopCamera}
              title="Close camera"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        /* Idle / Start Camera State */
        <div className="camera-idle-box">
          {cameraError ? (
            <div className="camera-error-alert">
              <AlertCircle size={20} className="text-danger" />
              <div>
                <strong>Camera Access Notice</strong>
                <p>{cameraError}</p>
              </div>
            </div>
          ) : (
            <div className="camera-idle-intro">
              <div className="camera-icon-circle">
                <Camera size={38} className="camera-hero-icon" />
              </div>
              <h3>Capture Live On-Site Photo</h3>
              <p>
              {showAiPanel ? "To prevent false or outdated reports, photos must be taken live using your device's camera. Our AI model will immediately analyze the photo and categorize the issue." : 'Resolution evidence must be captured live on site with a current GPS fix.'}
              </p>
            </div>
          )}

          <div className="camera-idle-actions">
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={startCamera}
            >
              <Camera size={18} /> Open Live Camera
            </button>

            {allowNativeFallback && <button
              type="button"
              className="btn btn-outline"
              onClick={() => fileInputRef.current?.click()}
              title="Capture using your device's native camera app"
            >
              Device Camera Fallback
            </button>}
          </div>
        </div>
      )}
    </div>
  );
};
