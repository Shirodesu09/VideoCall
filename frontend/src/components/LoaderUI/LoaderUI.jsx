import React from 'react';
import { HashLoader } from 'react-spinners';

function LoaderUI() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'rgba(255, 255, 255, 0.8)'
    }}>
      <HashLoader color="#7ec0ee" size={50} />
    </div>
  );
}

export default LoaderUI;