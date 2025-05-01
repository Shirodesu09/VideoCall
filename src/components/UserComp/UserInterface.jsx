import React, { useState } from "react";
import { UserButton } from "@clerk/clerk-react";
import "./UserInterface.css";
import useUserStore from "../../store";
import MeetCard from "../MeetCard/MeetCard";

function UserInterface() {
  const currentUser = useUserStore((state) => state.currentUser);
  const [RoomId, setRoomId] = useState("");
  const handleRoomIdChange = (e) => setRoomId(e.target.value);
  const [meetings, setMeetings] = useState([]);

  const createMeeting = () => {

    const roomId =
      currentUser.fullName.slice(0, 2).toLowerCase() + currentUser.id.slice(0, 8).toLowerCase();

    const newMeeting = {
      meetId: roomId,
      hostId: currentUser.id,
      hostName: currentUser.fullName,
      description: "",
      subject: ""
    };

    setMeetings((prev) => [...prev, newMeeting]);
    console.log(meetings)
  };

  return currentUser? (
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
          <div className="flex items-center space-x-4">
            <span className="create-meet w-fit flex items-center" onClick={createMeeting}>
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
        <div className="flex-1 self-start overflow-auto">
          <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-60px)] pr-2">
             <MeetCard />
             <MeetCard />
             <MeetCard />
             <MeetCard />
             <MeetCard />
             <MeetCard />
          </div>

        </div>
      </div>
    </div>
  ) : (
    <div>Loading </div>
  )
}

export default UserInterface;
