import React, { useEffect } from "react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useUserStore} from "./store";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StreamVideoProvider from "./components/provider/StreamVideoProvider";
import ChatProvider from "./components/provider/ChatProvider"; // Directly import StreamProvider
import Home from "./components/HomeComp/Home";
import UserInterface from "./components/UserComp/UserInterface";
import MeetRoom from "./components/MeetRoom/MeetRoom";

function App() {
  const { user } = useUser();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const currentUser = useUserStore((state) => state.currentUser);


  // Sync user data with Firebase when the user logs in
  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      const sendUserToFirebase = async () => {
        try {
          const userRef = doc(db, "users", user.id);
          await setDoc(
            userRef,
            {
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress || "",
              fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              imageUrl: user.imageUrl || "",
              createdAt: new Date().toISOString(),
              role: "user",
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error syncing user to Firebase ❌", error);
        }
      };

      sendUserToFirebase();
      
    }
  }, [user, setCurrentUser]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedOut>
                <Home />
              </SignedOut>
              <SignedIn>
                <UserInterface />
              </SignedIn>
            </>
          }
        />
        <Route
          path="/meetUI/:meetId"
          element={
            <SignedIn>
              <StreamVideoProvider>
                <ChatProvider>
                  <MeetRoom />
                </ChatProvider>
              </StreamVideoProvider>
            </SignedIn>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;