import { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import {
  useEmotionStore
} from "../../../store";
import { log } from '@tensorflow/tfjs';

export const useFaceDetection = (isActive, videoSelector) => {
  const [faces, setFaces] = useState([]);
  const [status, setStatus] = useState({ 
    loaded: false, 
    error: null,
    processing: false,
    lastDetection: null
  });
  
  const detectionInterval = useRef(null);
  const canvasRef = useRef(null);
  const emotionCanvasRef = useRef(null);
  const apiUrl = 'http://127.0.0.1:8000/predict-emotion';
  const { addPrediction } = useEmotionStore.getState();

  useEffect(() => {
    if (!isActive) return;

    console.log('[FaceDetection] Loading models...');
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        console.log('[FaceDetection] Models loaded successfully');
        setStatus(prev => ({ ...prev, loaded: true, error: null }));
      } catch (error) {
        console.error('[FaceDetection] Model loading error:', error);
        setStatus(prev => ({ ...prev, loaded: false, error: error.message }));
      }
    };

    loadModels();

    return () => {
      console.log('[FaceDetection] Cleaning up models');
      clearInterval(detectionInterval.current);
      setStatus(prev => ({ ...prev, loaded: false }));
    };
  }, [isActive]);

  const processFace = async (videoElement, detection) => {
    try {
      console.log('[FaceDetection] Extracting face...');
      const faceImage = await faceapi.extractFaces(videoElement, [detection]);
      
      if (!faceImage?.[0]) {
        console.log('[FaceDetection] No face extracted');
        return null;
      }

      console.log(`[FaceDetection] Original face size: ${faceImage[0].width}x${faceImage[0].height}`);

      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(faceImage[0], 0, 0, 48, 48);

      console.log('[FaceDetection] Resized to 48x48');

      const blob = await new Promise(resolve => 
        canvas.toBlob(resolve, 'image/png', 0.7) 
      );
      setStatus(prev => ({ ...prev, processing: true }));
      const startTime = performance.now();
      
      const formData = new FormData();
      formData.append('file', blob);
      

      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      console.log("this is added ",data);
      addPrediction(data);
      
      setStatus(prev => ({ 
        ...prev, 
        processing: false,
        lastDetection: {
          emotion: data.emotion,
          confidence: data.confidence,
          timestamp: new Date().toISOString()
        }
      }));

      return data;
    } catch (error) {
      console.error('[FaceDetection] Face processing failed:', error);
      setStatus(prev => ({ ...prev, processing: false, error: error.message }));
      return null;
    }
  };

  useEffect(() => {
    if (!isActive || !status.loaded) return;

    console.log('[FaceDetection] Starting detection loop');
    let frameCount = 0;

    const detectFaces = async () => {
      frameCount++;
      try {
        const videoElement = document.querySelector(videoSelector);
        if (!videoElement) return;

        if (!canvasRef.current) {
          canvasRef.current = faceapi.createCanvasFromMedia(videoElement);
          canvasRef.current.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            pointer-events: none;
          `;

          emotionCanvasRef.current = canvasRef.current.cloneNode();
          
          const container = videoElement.parentElement;
          if (container) {
            container.style.position = 'relative';
            container.append(canvasRef.current, emotionCanvasRef.current);
          }
        }

        const displaySize = { 
          width: videoElement.clientWidth, 
          height: videoElement.clientHeight 
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        faceapi.matchDimensions(emotionCanvasRef.current, displaySize);

        const detections = await faceapi.detectAllFaces(
          videoElement, 
          new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
        );
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        const emotionCtx = emotionCanvasRef.current.getContext('2d');
        emotionCtx.clearRect(0, 0, emotionCanvasRef.current.width, emotionCanvasRef.current.height);

        const faceResults = await Promise.all(
          detections.map(async (detection, i) => {
            const result = await processFace(videoElement, detection);
            return result ? { 
              box: resizedDetections[i], 
              emotion: result.emotion,
              confidence: result.confidence
            } : null;
          })
        );

        const validFaces = faceResults.filter(Boolean);
        setFaces(validFaces);

        faceapi.draw.drawDetections(canvasRef.current, resizedDetections);

        validFaces.forEach(({ box, emotion, confidence }) => {
          const label = `${emotion} (${Math.round(confidence * 100)}%)`;
          
          emotionCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
          emotionCtx.font = 'bold 14px Arial';
          const textWidth = emotionCtx.measureText(label).width;
          
          // Position under face box
          const x = box.x;
          const y = box.y + box.height + 20;
          
          // Draw label background and text
          emotionCtx.fillRect(x, y - 16, textWidth + 4, 20);
          emotionCtx.fillStyle = '#fff';
          emotionCtx.fillText(label, x + 2, y);
        });

      } catch (error) {
        console.error('[FaceDetection] Frame processing error:', error);
      }
    };

    detectionInterval.current = setInterval(detectFaces, 50); 
    return () => {
      clearInterval(detectionInterval.current);
      [canvasRef.current, emotionCanvasRef.current].forEach(canvas => {
        canvas?.parentElement?.removeChild(canvas);
      });
    };
  }, [isActive, status.loaded, videoSelector]);

  return { faces, status };
};