import React, { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import "./UserInterface.css";
import { useUserStore, useClientStore } from "../../store";
import { db } from "../../firebase"; // make sure this is configured
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function UserInterface() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [RoomId, setRoomId] = useState("");
  const handleRoomIdChange = (e) => setRoomId(e.target.value);
  const [meetings, setMeetings] = useState([]);
  const generateRoomId = () => {
    return crypto.randomUUID(); // This gives you a UUID like "7b9a98fe-6f22-44b5-b65a-e742998c7ff5"
  };
  const navigate = useNavigate();
  

  const createMeeting = async () => {
    const roomId = generateRoomId();
  
    const newMeeting = {
      meetId: roomId,
      hostId: currentUser.id,
      hostName: currentUser.fullName,
      description: "",
      subject: "",
    };
  
    await setDoc(doc(db, "meetings", roomId), newMeeting); // ← uses meetId as doc ID
    setMeetings((prev) => [...prev, newMeeting]);
  
    navigate(`/meetUI/${roomId}`); // 👈 don't forget to redirect
  };

  return currentUser ? (
    <div className="h-screen flex flex-col p-5">
      {/* top-right avatar */}
      <div className="flex justify-end">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: "40px",
                height: "40px",
              },
            },
          }}
        />
      </div>

      {/* main content */}
      <div className="flex-1 flex flex-col md:flex-row gap-4">
        {/* LEFT half: column with title + controls */}
        <div className="flex-1 flex flex-col justify-center items-start space-y-6">
          {/* Row 1: title */}
          <h1 className="user-inter-title">
            Video calls and meetings for everyone
          </h1>

          {/* Row 2: controls in a row */}
          <div className="flex items-center space-x-1">
            <span
              className="create-meet w-fit flex items-center"
              onClick={createMeeting}
            >
              <i className="mr-2 material-icons notranslate"></i>
              New Meeting
            </span>
            <span className="input-container">
              <input
                type="text"
                className="input-field"
                placeholder="Enter Room id"
                value={RoomId}
                onChange={handleRoomIdChange}
              />
            </span>
            <button
              className={`join-button ${!RoomId ? "disabled" : ""}`}
              disabled={!RoomId}
            >
              Join Now
            </button>
          </div>
        </div>

        {/* RIGHT half: user name, top-aligned */}

      </div>
    </div>
  ) : (
    <div>Loading </div>
  );
}

export default UserInterface;
