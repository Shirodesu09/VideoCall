import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaMicrophone,
  FaMicrophoneSlash,
  FaVideo,
  FaVideoSlash,
  FaCheckCircle,
} from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import "./DeviceTest.css";

const DeviceTest = () => {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [availableMicrophones, setAvailableMicrophones] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState("");
  const [selectedMic, setSelectedMic] = useState("");
  const [error, setError] = useState(null);
  const [isMicActive, setIsMicActive] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    const getDevices = async () => {
      try {
        if (isCameraEnabled || isMicEnabled) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: isCameraEnabled,
            audio: isMicEnabled,
          });
          stream.getTracks().forEach((track) => track.stop());
        }

        const devices = await navigator.mediaDevices.enumerateDevices();
        setDevices(devices);

        const cameras = devices.filter((device) => device.kind === "videoinput");
        const mics = devices.filter((device) => device.kind === "audioinput");

        setAvailableCameras(cameras);
        setAvailableMicrophones(mics);

        if (cameras.length > 0) setSelectedCamera(cameras[0].deviceId);
        if (mics.length > 0) setSelectedMic(mics[0].deviceId);

        setHasInitialized(true);
      } catch (err) {
        if (isCameraEnabled || isMicEnabled) {
          setError(`Failed to access devices: ${err.message}`);
        }
        console.error("Device enumeration error:", err);
      }
    };

    getDevices();
  }, [isCameraEnabled, isMicEnabled]);

  useEffect(() => {
    if (!hasInitialized) return;

    if (!isCameraEnabled && !isMicEnabled) {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setError(null);
      return;
    }

    const startMedia = async () => {
      try {
        if (videoRef.current?.srcObject) {
          videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }

        const constraints = {
          video: isCameraEnabled && selectedCamera ? {
            deviceId: { exact: selectedCamera },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          } : false,
          audio: isMicEnabled && selectedMic ? { deviceId: { exact: selectedMic } } : false,
        };

        if (!constraints.video && !constraints.audio) return;

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch((err) => console.error("Video play error:", err));
        }

        if (constraints.audio) {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const analyser = audioContext.createAnalyser();
          const microphone = audioContext.createMediaStreamSource(stream);
          microphone.connect(analyser);

          const checkActivity = () => {
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray);
            const sum = dataArray.reduce((a, b) => a + b, 0);
            setIsMicActive(sum > 1000);
            requestAnimationFrame(checkActivity);
          };

          checkActivity();
        }

        setError(null);
      } catch (err) {
        if (isCameraEnabled || isMicEnabled) {
          setError(`Failed to start media: ${err.message}`);
        }
        console.error("Media access error:", err);
      }
    };

    startMedia();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [selectedCamera, selectedMic, isCameraEnabled, isMicEnabled, hasInitialized]);

  const toggleCamera = () => {
    const newCameraState = !isCameraEnabled;
    setIsCameraEnabled(newCameraState);

    if (videoRef.current?.srcObject && !newCameraState) {
      videoRef.current.srcObject.getVideoTracks().forEach((track) => {
        track.enabled = false;
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  const toggleMic = () => {
    setIsMicEnabled(!isMicEnabled);
  };

  const handleReadyToJoin = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    navigate(`/meetUI/${meetId}`);
  };

  return (
    <div className="device-test-container">
      <div className="device-test-card">
        <h2 className="device-test-title">Check Your Devices</h2>
        <p className="device-test-subtitle">
          Make sure your camera and microphone are working before joining
        </p>

        {error && <div className="error-message">{error}</div>}

        <div className="video-preview-wrapper">
          <div className="video-preview">
            {isCameraEnabled && selectedCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="video-element"
              />
            ) : (
              <div className="no-video-placeholder">
                <FaVideoSlash size={48} />
                <p>Camera is disabled</p>
              </div>
            )}

            {isMicEnabled && (
              <div className={`mic-status ${isMicActive ? "active" : ""}`}>
                <FaMicrophone size={14} />
                <span>{isMicActive ? "Mic is active" : "Mic is inactive"}</span>
              </div>
            )}
          </div>

          <div className="device-controls">
            <button
              onClick={toggleMic}
              className={`icon-button ${isMicEnabled ? "active" : ""}`}
              aria-label={isMicEnabled ? "Mute microphone" : "Unmute microphone"}
            >
              {isMicEnabled ? (
                <FaMicrophone size={24} />
              ) : (
                <FaMicrophoneSlash size={24} />
              )}
            </button>

            <button
              onClick={toggleCamera}
              className={`icon-button ${isCameraEnabled ? "active" : ""}`}
              aria-label={isCameraEnabled ? "Disable camera" : "Enable camera"}
            >
              {isCameraEnabled ? <FaVideo size={24} /> : <FaVideoSlash size={24} />}
            </button>

            <button
              onClick={() => setShowDeviceSettings(!showDeviceSettings)}
              className="icon-button settings-button"
              aria-label="Device settings"
            >
              <IoMdSettings size={24} />
            </button>
          </div>
        </div>

        {showDeviceSettings && (
          <div className="device-settings">
            <div className="setting-group">
              <label>Select Camera:</label>
              {availableCameras.length > 0 ? (
                <div className="device-list">
                  {availableCameras.map((device) => (
                    <div
                      key={device.deviceId}
                      className={`device-item ${
                        selectedCamera === device.deviceId ? "selected" : ""
                      }`}
                      onClick={() => setSelectedCamera(device.deviceId)}
                    >
                      <div className="device-icon">
                        <FaVideo />
                      </div>
                      <div className="device-info">
                        <div className="device-name">
                          {device.label ||
                            `Camera ${availableCameras.indexOf(device) + 1}`}
                        </div>
                        <div className="device-id">
                          {device.deviceId.slice(0, 15)}...
                        </div>
                      </div>
                      {selectedCamera === device.deviceId && (
                        <div className="device-selected">
                          <FaCheckCircle />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-devices">No cameras found</div>
              )}
            </div>

            <div className="setting-group">
              <label>Select Microphone:</label>
              {availableMicrophones.length > 0 ? (
                <div className="device-list">
                  {availableMicrophones.map((device) => (
                    <div
                      key={device.deviceId}
                      className={`device-item ${
                        selectedMic === device.deviceId ? "selected" : ""
                      }`}
                      onClick={() => setSelectedMic(device.deviceId)}
                    >
                      <div className="device-icon">
                        <FaMicrophone />
                      </div>
                      <div className="device-info">
                        <div className="device-name">
                          {device.label ||
                            `Microphone ${availableMicrophones.indexOf(device) + 1}`}
                        </div>
                        <div className="device-id">
                          {device.deviceId.slice(0, 15)}...
                        </div>
                      </div>
                      {selectedMic === device.deviceId && (
                        <div className="device-selected">
                          <FaCheckCircle />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-devices">No microphones found</div>
              )}
            </div>
          </div>
        )}

        <button onClick={handleReadyToJoin} className="join-button">
          <FaCheckCircle size={20} />
          <span>Join Meeting Now</span>
        </button>
      </div>
    </div>
  );
};

export default DeviceTest;