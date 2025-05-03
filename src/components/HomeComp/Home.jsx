import React from 'react'
import {
    SignInButton,SignUp
  }from "@clerk/clerk-react";
function Home() {
  return (
    <div className='flex justify-center'>
        <SignInButton>
          <SignUp /> 
        </SignInButton>
    </div>
  )
}

export default Home