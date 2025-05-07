import { useEffect, useRef } from "react";

export const useEmotionDetection = (enabled, videoSelector) => {
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  const overlayCanvasRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const ws = new WebSocket("ws://localhost:8000/ws/emotions");
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");

      const video = document.querySelector(videoSelector);
      if (!video) {
        console.warn("Video element not found");
        return;
      }

      // Create canvas for capturing frames
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Create overlay canvas for drawing boxes
      let overlay = document.createElement("canvas");
      overlay.style.position = "absolute";
      overlay.style.pointerEvents = "none";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.zIndex = "9999";
      overlayCanvasRef.current = overlay;
      document.body.appendChild(overlay);

      const updateOverlaySize = () => {
        const rect = video.getBoundingClientRect();
        overlay.width = rect.width;
        overlay.height = rect.height;
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.left = `${rect.left + window.scrollX}px`;
      };

      const clearOverlay = () => {
        const octx = overlay.getContext("2d");
        octx.clearRect(0, 0, overlay.width, overlay.height);
      };

      const drawBox = (box, emotion, confidence) => {
        const [x1, y1, x2, y2] = box;
        const scaleX = overlay.width / video.videoWidth;
        const scaleY = overlay.height / video.videoHeight;
      
        // Adjust for mirrored video
        const flippedX1 = overlay.width - x2 * scaleX;  // Flip the x1 coordinate
        const flippedX2 = overlay.width - x1 * scaleX;  // Flip the x2 coordinate
      
        const octx = overlay.getContext("2d");
        octx.strokeStyle = "lime";
        octx.lineWidth = 2;
        octx.strokeRect(
          flippedX1,
          y1 * scaleY,
          (flippedX2 - flippedX1),
          (y2 - y1) * scaleY
        );
      
        octx.fillStyle = "lime";
        octx.font = "14px sans-serif";
        octx.fillText(
          `${emotion} ${confidence}`,
          flippedX1,
          y1 * scaleY - 5
        );
      };
      

      const captureFrame = () => {
        if (!video.videoWidth || !video.videoHeight) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob && ws.readyState === WebSocket.OPEN) {
              ws.send(blob);
            }
          },
          "image/jpeg",
          0.8
        );
      };

      intervalRef.current = setInterval(() => {
        captureFrame();
        updateOverlaySize();
      }, 150);

      ws.onmessage = (evt) => {
        const results = JSON.parse(evt.data);

        console.log("Emotion prediction results:", results);

        // Assuming the object structure is something like { emotion: string, confidence: number, box: [x1, y1, x2, y2] }
        if (results && results.box) {
          clearOverlay();
          // Draw the bounding box and emotion text
          drawBox(results.box, results.emotion, results.confi);
        } else {
          console.warn("Unexpected response format:", results);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket closed");
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.remove();
          overlayCanvasRef.current = null;
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.remove();
        overlayCanvasRef.current = null;
      }
    };
  }, [enabled, videoSelector]);
};
