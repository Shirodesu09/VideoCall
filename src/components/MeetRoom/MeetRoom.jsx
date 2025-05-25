import { useState, useRef, useEffect, memo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoaderUI from "../LoaderUI/LoaderUI";
import "./MeetRoom.css";
import {
  useAssignUserRole,
  useJoinCall,
  useChatChannel,
} from "./hooks/useMeetRoomLogic";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  Chat,
  Channel,
  MessageInput,
  MessageList,
  Thread,
  Window,
  LoadingIndicator,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import {
  useUserStore,
  useVideoClientStore,
  useChatClientStore,
  usechannelIdStore,
  useEmotionStore,
} from "../../store";
import logo from "../../assets/tale-logo.png";

const MemoizedVideoComponent = memo(
  ({
    currentVideoClient,
    call,
    isAlone,
    highlightSpotlight,
    emotionDetectionRef,
    userRole, 
  }) => {
    const containerRef = useRef(null);
    const navigate = useNavigate();
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
      const videoElement = containerRef.current?.querySelector(
        ".str-video__speaker-layout__spotlight video"
      );

      if (videoElement) {
        emotionDetectionRef.current = {
          videoElement,
          containerElement: containerRef.current,
        };
      }
    }, [emotionDetectionRef]);

    const handleLeaveCall = useCallback(async () => {
      if (isLeaving) return;
      setIsLeaving(true);

      try {
        if (call) {
          await call.leave();
        }
      } catch (error) {
        console.error("Error leaving call:", error);
      } finally {
        navigate(userRole === "host" ? "/emotion-stats" : "/");
      }
    }, [call, navigate, userRole, isLeaving]);

    const CustomVideoLayout = () => {
      const { useParticipants } = useCallStateHooks();
      const participants = useParticipants();
      const isAloneLocal = participants.length === 1;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            justifyContent: isAloneLocal ? "center" : "flex-start",
            alignItems: "center",
            paddingTop: isAloneLocal ? "10%" : "2%",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "800px",
              position: "relative",
            }}
          >
            <SpeakerLayout />
          </div>
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              padding: "16px 0",
            }}
          >
            <CallControls onLeave={handleLeaveCall} />
          </div>
        </div>
      );
    };

    return (
      <div
        ref={containerRef}
        className={highlightSpotlight ? "spotlight-highlight" : ""}
      >
        <StreamVideo client={currentVideoClient}>
          <StreamCall call={call}>
            <StreamTheme>
              <CustomVideoLayout />
            </StreamTheme>
          </StreamCall>
        </StreamVideo>
      </div>
    );
  }
);

const EmotionDetectionOverlay = memo(({ isActive, emotionData }) => {
  if (!isActive || !emotionData) return null;

  return (
    <div className="detection-result-topright">
      {emotionData.emotion} ({Math.round(emotionData.confidence * 100)}%)
    </div>
  );
});

const DetectionControls = memo(
  ({ userRole, highlightSpotlight, onToggleDetection }) => {
    if (userRole !== "host") return null;

    return (
      <div className="detection-controls">
        <button
          onClick={onToggleDetection}
          className={`detection-button ${highlightSpotlight ? "active" : ""}`}
        >
          {highlightSpotlight ? "Disable Detection" : "Enable Detection"}
        </button>
      </div>
    );
  }
);

const FaceDetectionCanvas = memo(({ faceDetection }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || !faceDetection || !containerRef.current) return;

    const videoElement = document.querySelector('.str-video__speaker-layout__spotlight video');
    if (!videoElement) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const videoRect = videoElement.getBoundingClientRect();

    canvasRef.current.width = containerRect.width;
    canvasRef.current.height = containerRect.height;
    
    const scaleX = videoRect.width / faceDetection.sourceWidth;
    const scaleY = videoRect.height / faceDetection.sourceHeight;
    
    const offsetX = (containerRect.width - videoRect.width) / 2;
    const offsetY = (containerRect.height - videoRect.height) / 2;
    
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (faceDetection.box) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#1E88E5';
      
      const scaledX = offsetX + (faceDetection.box.x * scaleX  + 5);
      const scaledY = offsetY + (faceDetection.box.y * scaleY - 150);
      const scaledWidth = faceDetection.box.width * scaleX;
      const scaledHeight = faceDetection.box.height * scaleY;
      
      ctx.strokeRect(
        scaledX, 
        scaledY, 
        scaledWidth, 
        scaledHeight
      );
      
      if (faceDetection.emotion) {
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = '#1E88E5';
        
        ctx.fillText(
          `${faceDetection.emotion} (${Math.round(faceDetection.confidence * 100)}%)`,
          scaledX, 
          scaledY - 10
        );
      }
    }
  }, [faceDetection]);
  
  if (!faceDetection) return null;
  
  return (
    <div ref={containerRef} className="face-detection-canvas-container">
      <canvas ref={canvasRef} className="face-detection-canvas"/>
    </div>
  );
});

const MeetRoom = () => {
  const { meetId } = useParams();
  const currentUser = useUserStore((state) => state.currentUser);
  const currentChatClient = useChatClientStore(
    (state) => state.currentChatClient
  );
  const currentVideoClient = useVideoClientStore(
    (state) => state.currentVideoClient
  );
  const setChannelId = usechannelIdStore((state) => state.setChannelId);

  const [highlightSpotlight, setHighlightSpotlight] = useState(false);
  const [emotionData, setEmotionData] = useState(null);
  const [faceDetection, setFaceDetection] = useState(null);

  const emotionDetectionRef = useRef({
    videoElement: null,
    containerElement: null,
  });
  const faceDetectionCanvasRef = useRef(null);

  const userRole = useAssignUserRole(meetId, currentUser);
  const { call, error: callError } = useJoinCall(currentVideoClient, meetId);
  const { channel, error: chatError } = useChatChannel(
    currentChatClient,
    meetId,
    currentUser,
    setChannelId
  );
  const { addEmotionEntry } = useEmotionStore();

  useEffect(() => {
    if (!highlightSpotlight) {
      setEmotionData(null);
      setFaceDetection(null);
      return;
    }

    let isMounted = true;
    let detectionInterval = null;
    let processingInProgress = false;
    let faceapiModule = null;

    const loadFaceDetection = async () => {
      try {
        const faceapi = await import("face-api.js");
        faceapiModule = faceapi;
        
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        
        startDetection(faceapi);
      } catch (error) {
        console.error("Error loading face-api models:", error);
      }
    };

    const startDetection = (faceapi) => {
      setTimeout(() => {
        detectionInterval = setInterval(async () => {
          const videoElement = document.querySelector(
            ".str-video__speaker-layout__spotlight video"
          );
          
          const videoContainer = document.querySelector(
            ".str-video__speaker-layout__spotlight"
          );

          if (
            !videoElement ||
            !videoContainer ||
            processingInProgress ||
            videoElement.readyState < 2 ||
            videoElement.paused ||
            videoElement.ended
          ) {
            return;
          }

          emotionDetectionRef.current.videoElement = videoElement;
          processingInProgress = true;

          try {
            const canvas = document.createElement("canvas");
            canvas.width = videoElement.videoWidth || 640;
            canvas.height = videoElement.videoHeight || 480;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

            const detections = await faceapi.detectAllFaces(
              canvas,
              new faceapi.TinyFaceDetectorOptions({ inputSize: 320 })
            );

            if (detections.length > 0) {
              const detection = detections[0];
              
              const faceImages = await faceapi.extractFaces(canvas, [detection]);
              let emotionInfo = null;
              
              if (faceImages?.[0]) {
                emotionInfo = await processFace(faceImages[0]);
              }
              
              if (isMounted) {
                setFaceDetection({
                  box: detection.box,
                  sourceWidth: canvas.width,
                  sourceHeight: canvas.height,
                  emotion: emotionInfo?.emotion,
                  confidence: emotionInfo?.confidence
                });
              }
            } else {
              if (isMounted) {
                setFaceDetection(null);
              }
            }
          } catch (error) {
            console.error("Face detection error:", error);
          } finally {
            processingInProgress = false;
          }
        }, 100);
      }, 100);
    };

    const processFace = async (faceCanvas) => {
      try {
        const resizeCanvas = document.createElement("canvas");
        resizeCanvas.width = 48;
        resizeCanvas.height = 48;
        const resizeCtx = resizeCanvas.getContext("2d");
        resizeCtx.drawImage(faceCanvas, 0, 0, 48, 48);

        const blob = await new Promise((resolve) =>
          resizeCanvas.toBlob(resolve, "image/png", 0.7)
        );

        const formData = new FormData();
        formData.append("file", blob);

        const response = await fetch("http://127.0.0.1:8000/predict-emotion", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const data = await response.json();
        addEmotionEntry(data);

        if (isMounted) {
          setEmotionData({
            emotion: data.emotion,
            confidence: data.confidence,
            timestamp: new Date().toISOString(),
          });
        }
        
        return data;
      } catch (error) {
        console.error("Error processing face:", error);
        return null;
      }
    };

    loadFaceDetection();

    return () => {
      isMounted = false;
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [highlightSpotlight, addEmotionEntry]);

  const CustomChannelHeader = () => (
    <div className="custom-channel-header">
      <div className="header-content">
        <img 
          src={logo} 
          alt="Company Logo" 
          className="h-6 w-auto object-contain" 
        />
        <h2 className="header-title">
          Meeting Room
        </h2>
      </div>
    </div>
  );

  const handleToggleDetection = () => {
    setHighlightSpotlight((prev) => !prev);
  };

  useEffect(() => {
    const setupFaceDetectionCanvas = () => {
      const videoContainer = document.querySelector('.str-video__speaker-layout__spotlight');
      if (videoContainer && !document.querySelector('.face-detection-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'face-detection-overlay';
        videoContainer.appendChild(overlay);
      }
    };
    
    const checkInterval = setInterval(() => {
      if (document.querySelector('.str-video__speaker-layout__spotlight')) {
        setupFaceDetectionCanvas();
        clearInterval(checkInterval);
      }
    }, 500);
    
    return () => {
      clearInterval(checkInterval);
    };
  }, [call]);

  if (!currentUser)
    return (
      <div className="loading-container">
        <LoaderUI />
      </div>
    );
  if (callError || chatError) return <div>Error: {callError || chatError}</div>;
  if (!call)
    return (
      <div className="loading-container">
        <LoaderUI />
      </div>
    );
  if (!channel)
    return (
      <div className="loading-container">
        <LoaderUI />
      </div>
    );

  return (
    <div className="meet-room-container">
      <div className="video-container">
        {highlightSpotlight && emotionData && (
          <div className="detection-result-topright">
            {emotionData.emotion} ({Math.round(emotionData.confidence * 100)}%)
          </div>
        )}

        <EmotionDetectionOverlay
          isActive={highlightSpotlight}
          emotionData={emotionData}
        />

        <DetectionControls
          userRole={userRole}
          highlightSpotlight={highlightSpotlight}
          onToggleDetection={handleToggleDetection}
        />

        {highlightSpotlight && faceDetection && (
          <FaceDetectionCanvas faceDetection={faceDetection} />
        )}

        <MemoizedVideoComponent
          userRole={userRole}
          currentVideoClient={currentVideoClient}
          call={call}
          highlightSpotlight={highlightSpotlight}
          emotionDetectionRef={emotionDetectionRef}
        />
      </div>

      {currentChatClient && channel && (
        <div className="chat-container">
          <Chat client={currentChatClient}>
            <Channel channel={channel}>
              <Window>
                <CustomChannelHeader />
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          </Chat>
        </div>
      )}
    </div>
  );
};

export default MeetRoom;