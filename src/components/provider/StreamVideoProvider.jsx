import React, { useEffect } from "react";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import { useUserStore, useClientStore } from "../../store";

const StreamVideoProvider = ({ children }) => {
    const currentUser = useUserStore((state) => state.currentUser);
    const setCurrentClient = useClientStore((state) => state.setCurrentClient);

    useEffect(() => {
        if (!currentUser) return;

        const fetchTokenAndInit = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/generate-token", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({ user_id: currentUser.id }),
                });

                const data = await res.json();
                const token = data.token;

                const apiKey = import.meta.env.VITE_STREAM_API_KEY;
                const user = {
                    id: currentUser.id,
                    name: `${currentUser.firstName || ""} ${currentUser.lastName || ""}`,
                };

                const clientInstance = StreamVideoClient.getOrCreateInstance({
                    apiKey,
                    user,
                    token,
                });

                setCurrentClient(clientInstance);
            } catch (err) {
                console.error("Failed to fetch token or init Stream client:", err);
            }
        };

        fetchTokenAndInit();
    }, [currentUser, setCurrentClient]);

    return <>{children}</>;
};

export default StreamVideoProvider;