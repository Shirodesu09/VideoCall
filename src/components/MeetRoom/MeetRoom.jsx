import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";

const MeetRoom = () => {
  const { meetId } = useParams();
  const navigate = useNavigate();
  const [meetingInfo, setMeetingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  // Fetch meeting data once on mount
  useEffect(() => {
    const fetchMeetingInfo = async () => {
      try {
        const docRef = doc(db, "meetings", meetId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMeetingInfo(docSnap.data());
        } else {
          setError("Meeting not found.");
        }
      } catch (err) {
        console.error("Error fetching meeting data:", err);
        setError("Failed to fetch meeting.");
      } finally {
        setLoading(false);
      }
    };
    fetchMeetingInfo();
  }, [meetId]);

  // Start webcam
  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Failed to access webcam:", err);
        alert("Please allow camera and microphone access to join the meeting.");
        navigate(-1); // Go back if permission denied
      }
    };
    startWebcam();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [navigate]);

  if (loading) return <div className="p-6">Loading meeting info...</div>;
  if (error) return <div className="p-6 text-red-500">{error} 🫠</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-2">You're in Room: {meetId}</h1>
      <p className="mb-4 text-gray-600">
        Host: <strong>{meetingInfo.hostName}</strong>
      </p>

      <div className="flex gap-6">
        <div className="w-[480px] h-[360px] bg-black rounded overflow-hidden shadow">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-gray-500 mb-2">Camera is on ✅</p>
          {/* Future: Add mic toggle, screen share, chat, etc. */}
        </div>
      </div>
    </div>
  );
};

export default MeetRoom;
