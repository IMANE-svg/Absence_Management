import React, { useEffect, useState } from 'react';

const CodeQr = () => {
   const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    const storedUrl = localStorage.getItem('qrCodeUrl');
    if (storedUrl) {
      setQrUrl(storedUrl);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">QR Code de la séance</h1>
      {qrUrl ? (
        <img
          src={qrUrl}
          alt="QR Code"
          className="w-[400px] h-[400px] border-4 border-gray-300 shadow-lg"
        />
      ) : (
        <p className="text-gray-500">Aucun QR code à afficher.</p>
      )}
    </div>
  );
};

export default CodeQr