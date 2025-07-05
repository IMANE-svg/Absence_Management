import React, { useEffect, useState } from 'react';
import Navbar from '../navbar/Navbar';
import './CodeQr.css'

const CodeQr = () => {
   const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    const storedUrl = localStorage.getItem('qrCodeUrl');
    if (storedUrl) {
      setQrUrl(storedUrl);
    }
  }, []);

  return (
    <div className="Qr-Code">
      <Navbar/>
      
      {qrUrl ? (
        <img
          src={qrUrl}
          alt="QR Code"
          className="qr-image"
        />
      ) : (
        <p >Aucun QR code à afficher.</p>
      )}
    </div>
  );
};

export default CodeQr