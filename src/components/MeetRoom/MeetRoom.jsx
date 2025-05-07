import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./MeetRoom.css";

import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";

import {
  Chat,
  Channel,
  ChannelHeader,
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
} from "../../store";
import {
  useAssignUserRole,
  useJoinCall,
  useChatChannel,
} from "./hooks/useMeetRoomLogic";
import { useEmotionDetection } from "./hooks/useEmotionDetection";

const MeetRoom = () => {
  const { meetId } = useParams();
  const currentUser = useUserStore((s) => s.currentUser);
  const currentVideoClient = useVideoClientStore((s) => s.currentVideoClient);
  const currentChatClient = useChatClientStore((s) => s.currentChatClient);
  const setChannelId = usechannelIdStore((s) => s.setChannelId);

  const [highlightSpotlight, setHighlightSpotlight] = useState(false);

  const userRole = useAssignUserRole(meetId, currentUser);
  const { call, error: callError } = useJoinCall(currentVideoClient, meetId);
  const { channel, error: chatError } = useChatChannel(
    currentChatClient,
    meetId,
    currentUser,
    setChannelId
  );

  useEmotionDetection(
    highlightSpotlight,
    ".spotlight-highlight .str-video__speaker-layout__spotlight video"
  );

  if (!currentUser) return <div>Loading user data...</div>;
  if (callError || chatError) return <div>Error: {callError || chatError}</div>;
  if (!call) return <div>Joining call...</div>;
  if (!channel) return <LoadingIndicator />;

  return (
    <div className={`meet-room-container ${userRole}`} style={{ display: "flex", height: "100vh" }}>
      <div className="video-container" style={{ flex: 2, position: "relative" }}>
        {userRole === "host" && (
          <button
            className={`model-toggle-button ${highlightSpotlight ? "active" : ""}`}
            onClick={() => setHighlightSpotlight(!highlightSpotlight)}
          >
            {highlightSpotlight ? "Disable Model" : "Enable Model"}
          </button>
        )}

        <div className={highlightSpotlight ? "spotlight-highlight" : ""}>
          <StreamVideo client={currentVideoClient}>
            <StreamCall call={call}>
              <StreamTheme>
                <SpeakerLayout />
                <CallControls />
              </StreamTheme>
            </StreamCall>
          </StreamVideo>
        </div>
      </div>

      <div className="chat-container" style={{ flex: 1, borderLeft: "1px solid #ccc" }}>
        <Chat client={currentChatClient}>
          <Channel channel={channel}>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </Channel>
        </Chat>
      </div>

      <div className="user-role-display">
        Role: {userRole}
      </div>
    </div>
  );
};

export default MeetRoom;