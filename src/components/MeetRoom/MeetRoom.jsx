import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  StreamVideo,
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  CallControls,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import { useClientStore } from "../../store";

const MeetRoom = () => {
  const { meetId } = useParams();
  const currentClient = useClientStore((state) => state.currentClient);
  const [call, setCall] = useState(null);

  useEffect(() => {
    if (!currentClient || !meetId) return;

    // Create a new call instance with the room ID
    const callInstance = currentClient.call("default", meetId);

    callInstance.join({ create: true }).then(() => {
      setCall(callInstance);
    });

    return () => {
      if (callInstance) {
        callInstance.leave(); // Clean up on unmount
      }
    };
  }, [currentClient, meetId]);

  if (!call) return <div>Joining call...</div>;

  return (
    <div>
      <StreamVideo client={currentClient}>
        <StreamCall call={call}>
          <StreamTheme>
            <SpeakerLayout />
            <CallControls />
          </StreamTheme>
        </StreamCall>
      </StreamVideo>
    </div>
  );
};

export default MeetRoom;