// App.jsx
import "./App.css";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import Home from "./components/HomeComp/Home";
import UserInterface from "./components/UserComp/UserInterface";
import MeetRoom from "./components/MeetRoom/MeetRoom.jsx";
import useUserStore from "./store.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const { user } = useUser();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

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
  }, [user]);

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
              <MeetRoom />
            </SignedIn>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;