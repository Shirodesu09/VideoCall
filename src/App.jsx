import "./App.css";
import {SignedIn,SignedOut}from "@clerk/clerk-react";
import { useUser } from '@clerk/clerk-react';
import { useEffect } from "react";
import { db } from "./firebase";
import { doc, setDoc } from "firebase/firestore";
import Home from "./components/HomeComp/Home";
import UserInterface from "./components/UserComp/UserInterface";
import useUserStore from "./store.js";

function App() {
  const { user } = useUser();
  const setCurrentUser = useUserStore((state) => state.setCurrentUser);

  useEffect(() => {
    if (user) {
      console.log("User signed in:", user);
      setCurrentUser(user); 
    }
  }, [user]); 

  return (
    <div className="">
      <SignedOut>
        <Home />
      </SignedOut>
      <SignedIn>
        <UserInterface />
      </SignedIn>
    </div>
  );
}

export default App;
