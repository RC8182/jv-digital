import React from 'react';

const DeviceFrame = ({ src, device }) => {
  const frameStyle = {
    width: device === 'mobile' ? '375px' : '800px',
    height: device === 'mobile' ? '667px' : '450px',
    border: '10px solid black',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={frameStyle}>
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Device Frame"
      ></iframe>
    </div>
  );
};

export default DeviceFrame;
