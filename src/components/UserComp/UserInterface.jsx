import React, { useState, useEffect } from "react";
import { UserButton } from "@clerk/clerk-react";
import { useUserStore } from "../../store";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/tale-logo.png";
import "./UserInterface.css";

function UserInterface() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [RoomId, setRoomId] = useState("");
  const [meetings, setMeetings] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (currentUser?.id) {
        try {
          const userRef = doc(db, "users", currentUser.id);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            setIsAdmin(userSnap.data().role === "admin");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAdminStatus();
  }, [currentUser]);

  const generateRoomId = () => crypto.randomUUID();

  const createMeeting = async () => {
    const roomId = generateRoomId();
    const newMeeting = {
      meetId: roomId,
      hostId: currentUser.id,
      hostName: currentUser.fullName,
      description: "",
      subject: "",
    };

    await setDoc(doc(db, "meetings", roomId), newMeeting);
    setMeetings((prev) => [...prev, newMeeting]);
    navigate(`/meetUI/${roomId}`);
  };

  const joinMeeting = () => {
    if (RoomId) {
      navigate(`/device-test/${RoomId}`); 
    }
  };

  if (!currentUser || loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="user-interface-container">
      <img src={logo} alt="Logo" className="user-interface-logo" />

      <header className="user-interface-header">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: "40px",
                height: "40px",
                borderRadius: "50%",
              },
            },
          }}
        />
      </header>

      <main className="user-interface-main">
        <div className="meeting-controls-container">
          <h1 className="meeting-title">
            Video calls and meetings for everyone
          </h1>

          <div className="meeting-actions">
            {isAdmin && (
              <button className="new-meeting-btn" onClick={createMeeting}>
                <span className="material-icons">video_call</span>
                New Meeting
              </button>
            )}

            <div className="join-meeting-section">
              <input
                type="text"
                className="room-id-input"
                placeholder="Enter Room ID"
                value={RoomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
              <button
                className={`join-btn ${!RoomId ? "disabled" : ""}`}
                disabled={!RoomId}
                onClick={joinMeeting}
              >
                Join Call
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserInterface;