import React, { useEffect } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import {
  useUserStore,
  useVideoClientStore,
} from "../../store";

const StreamVideoProvider = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentVideoClient = useVideoClientStore(
    (state) => state.setCurrentVideoClient
  );

  useEffect(() => {
    if (!currentUser) return;

    const fetchTokenAndInit = async () => {
      try {
        
        const Vidres = await fetch("http://127.0.0.1:8000/generate-token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ user_id: currentUser.id }),
        });

        const VidData = await Vidres.json();
        const Videotoken = VidData.token;

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;

        const user = {
          id: currentUser.id,
          name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`,
        };

        // Create video client
        const videoClient = StreamVideoClient.getOrCreateInstance({
          apiKey,
          user,
          token: Videotoken,
        });

        setCurrentVideoClient(videoClient);
      } catch (err) {
        console.error("Failed to fetch token or init Stream client:", err);
      }
    };

    fetchTokenAndInit();
  }, [currentUser, setCurrentVideoClient]);

  return <>{children}</>;
};

export default StreamVideoProvider;
