import React from 'react'
import {
    SignInButton,
  }from "@clerk/clerk-react";
function Home() {
  return (
    <div className=''>
        <SignInButton>
          Login 
        </SignInButton>
    </div>
  )
}

export default Home