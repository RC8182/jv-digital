import React from 'react';
import './styles.css'; // Asegúrate de importar tu archivo CSS

const DeviceFrame = ({ src, device }) => {
  const frameStyle = {
    width: device === 'mobile' ? '250px' : '800px',
    height: device === 'mobile' ? '467px' : '450px',
    border: '10px solid black',
    borderRadius: '20px',
    overflow: 'hidden',
    position: 'relative',
  };

  return (
    <div style={frameStyle} className="device-frame">
      <iframe
        src={src}
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Device Frame"
      ></iframe>
    </div>
  );
};

export default DeviceFrame;
