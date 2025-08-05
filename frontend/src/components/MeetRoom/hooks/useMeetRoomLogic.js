import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../firebase";

// Role Assign Hook
export const useAssignUserRole = (meetId, currentUser) => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const assignRole = async () => {
      if (!currentUser?.id || !meetId) return;

      const ref = doc(db, "meetings", meetId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      const roleMap = data.roleMap || {};

      if (!roleMap[currentUser.id]) {
        const isFirst = Object.keys(roleMap).length === 0;
        const role = isFirst ? "host" : "participant";
        roleMap[currentUser.id] = role;
        await updateDoc(ref, { roleMap });
        setUserRole(role);
      } else {
        setUserRole(roleMap[currentUser.id]);
      }
    };

    assignRole();
  }, [currentUser?.id, meetId]);

  return userRole;
};

// Video Join Hook
export const useJoinCall = (videoClient, meetId) => {
  const [call, setCall] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!videoClient || !meetId) return;

    const callInstance = videoClient.call("default", meetId);
    callInstance
      .join({ create: true })
      .then(() => setCall(callInstance))
      .catch((err) => {
        console.error("Error joining call:", err);
        setError("Failed to join call");
      });
  }, [videoClient, meetId]);

  return { call, error };
};

// Chat Setup Hook
export const useChatChannel = (chatClient, meetId, currentUser, setChannelId) => {
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chatClient || !meetId || !currentUser?.id) return;

    const setup = async () => {
      try {
        let res = await fetch("http://127.0.0.1:8000/add-to-meeting-channel", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            meet_id: meetId,
            user_id: currentUser.id,
          }),
        });

        if (!res.ok) {
          res = await fetch("http://127.0.0.1:8000/create-channel", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              meet_id: meetId,
              user_id: currentUser.id,
            }),
          });
          if (!res.ok) throw new Error(await res.text());
        }

        const data = await res.json();
        setChannelId(data.channel_id);

        const chan = chatClient.channel("messaging", `meet_${meetId}`);
        await chan.watch();
        setChannel(chan);
      } catch (err) {
        console.error("Error handling channel:", err);
        setError("Failed to start chat");
      }
    };

    setup();
    return () => {
      channel?.stopWatching().catch(console.error);
    };
  }, [chatClient, meetId, currentUser?.id]);

  return { channel, error };
};