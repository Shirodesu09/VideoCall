import React from 'react';
import { SignInButton, SignUp } from "@clerk/clerk-react";
import logo from "../../assets/tale-logo.png";
import "./Home.css";

function Home() {
  return (
    <div className="home-container">
      <img 
        src={logo} 
        alt="Logo" 
        className="home-logo"
      />
      <div className="auth-container">
        <SignInButton>
          <SignUp /> 
        </SignInButton>
      </div>
    </div>
  );
}

export default Home;