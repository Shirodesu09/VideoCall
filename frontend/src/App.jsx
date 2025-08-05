import React, { useEffect } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";
import { useUserStore } from "./store";
import { db } from "./firebase";
import { doc, setDoc,getDoc } from "firebase/firestore";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StreamVideoProvider from "./components/provider/StreamVideoProvider";
import ChatProvider from "./components/provider/ChatProvider";
import Home from "./components/HomeComp/Home";
import UserInterface from "./components/UserComp/UserInterface";
import MeetRoom from "./components/MeetRoom/MeetRoom";
import DeviceTest from "./components/Device-test/DeviceTest";
import LeaveCall from "./components/LeaveCall/LeaveCall";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";

function App() {
  const { user } = useUser();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);
  const currentUser = useUserStore((state) => state.currentUser);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
      const sendUserToFirebase = async () => {
        try {
          const userRef = doc(db, "users", user.id);
          const userDoc = await getDoc(userRef);

          const existingRole = userDoc.exists() ? userDoc.data().role : "user";

          await setDoc(
            userRef,
            {
              id: user.id,
              email: user.emailAddresses[0]?.emailAddress || "",
              fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
              imageUrl: user.imageUrl || "",
              createdAt: new Date().toISOString(),
              role: existingRole, // Preserve existing role or set to "user"
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
        <Route
          path="/device-test/:meetId"
          element={
            <SignedIn>
              <DeviceTest />
            </SignedIn>
          }
        />

        <Route
          path="/emotion-stats"
          element={
            <SignedIn>
              <AdminProtectedRoute>
                <LeaveCall />
              </AdminProtectedRoute>
            </SignedIn>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
