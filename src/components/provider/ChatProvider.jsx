import React, { useEffect } from "react";
import { StreamChat } from "stream-chat";
import {
  useUserStore,
  useChatClientStore,
} from "../../store";

const ChatProvider = ({ children }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  const setCurrentChatClient = useChatClientStore(
    (state) => state.setCurrentChatClient
  );

  useEffect(() => {
    if (!currentUser) return;

    const fetchTokenAndInit = async () => {
      try {
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        const user = {
          id: currentUser.id,
          name: `${currentUser.firstName || ""} ${
            currentUser.lastName || ""
          }`.trim(),
          image: currentUser.imageUrl || undefined,
        };

        const tokenRes = await fetch(
          "http://127.0.0.1:8000/generate-chat-token",
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ user_id: currentUser.id }),
          }
        );

        if (!tokenRes.ok) {
          throw new Error(
            `Failed to generate chat token: ${await tokenRes.text()}`
          );
        }

        const tokenData = await tokenRes.json();
        const chatClient = StreamChat.getInstance(apiKey);
        await chatClient.connectUser(user, tokenData.chat_token);

        setCurrentChatClient(chatClient);
      } catch (err) {
        console.error("Failed to initialize chat client:", err);
      }
    };

    fetchTokenAndInit();

    return () => {
      const chatClient = useChatClientStore.getState().currentChatClient;
      if (chatClient) {
        chatClient.disconnectUser().catch(console.error);
      }
    };
  }, [currentUser, setCurrentChatClient]);

  return <>{children}</>;
};

export default ChatProvider;
