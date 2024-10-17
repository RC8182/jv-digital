'use client'
import React from 'react';

const IFrameComponent = ({ src }) => {
    return (
        <div className='flex items-center justify-center min-h-screen'>
          <div style={{ width: '100%', height: '100vh' }}>
            <iframe
              src={src}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allowFullScreen
            ></iframe>
          </div>       
        </div>
      );
};

export default IFrameComponent;
