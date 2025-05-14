import { useState, useRef, useEffect, memo,useCallback  } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const MemoizedVideoComponent = memo(
  ({
    currentVideoClient,
    call,
    isAlone,
    highlightSpotlight,
    emotionDetectionRef,
    userRole, // Add userRole as a prop
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
        navigate(userRole === "host" ? "/LeaveCall" : "/");
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

  const emotionDetectionRef = useRef({
    videoElement: null,
    containerElement: null,
  });

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
      return;
    }

    let isMounted = true;
    let detectionInterval = null;
    let processingInProgress = false;

    const loadFaceDetection = async () => {
      try {
        const faceapi = await import("face-api.js");
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        startDetection(faceapi);
      } catch (error) {}
    };

    const startDetection = (faceapi) => {
      setTimeout(() => {
        detectionInterval = setInterval(async () => {
          const videoElement = document.querySelector(
            ".str-video__speaker-layout__spotlight video"
          );

          if (
            !videoElement ||
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
              const faceImages = await faceapi.extractFaces(canvas, [
                detections[0],
              ]);
              if (faceImages?.[0]) {
                await processFace(faceImages[0]);
              }
            }
          } catch (error) {
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
        console.log("Emotion saved:", data);

        if (isMounted) {
          setEmotionData({
            emotion: data.emotion,
            confidence: data.confidence,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {}
    };

    loadFaceDetection();

    return () => {
      isMounted = false;
      if (detectionInterval) {
        clearInterval(detectionInterval);
      }
    };
  }, [highlightSpotlight]);

  const CustomChannelHeader = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "64px",
        backgroundColor: "#fff",
        borderBottom: "1px solid #f0f0f0",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 8V16H5V8H15ZM16 6H4C3.45 6 3 6.45 3 7V17C3 17.55 3.45 18 4 18H16C16.55 18 17 17.55 17 17V13.5L21 17.5V6.5L17 10.5V7C17 6.45 16.55 6 16 6Z"
            fill="#555"
          />
        </svg>
        <h2
          style={{
            margin: 0,
            fontSize: "18px",
            fontWeight: 500,
            color: "#333",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          Meeting Room
        </h2>
      </div>
    </div>
  );

  const handleToggleDetection = () => {
    setHighlightSpotlight((prev) => !prev);
  };

  if (!currentUser) return <div>Loading user data...</div>;
  if (callError || chatError) return <div>Error: {callError || chatError}</div>;
  if (!call) return <div>Joining call...</div>;
  if (!channel) return <LoadingIndicator />;

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
