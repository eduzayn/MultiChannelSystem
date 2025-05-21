import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCodeData: string | null;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeData }) => {
  // Determinar o tipo de dados do QR code
  const [qrCodeType, setQrCodeType] = useState<'empty' | 'dataurl' | 'base64' | 'text' | 'unknown'>('unknown');
  
  useEffect(() => {
    if (!qrCodeData) {
      setQrCodeType('empty');
    } else if (qrCodeData.startsWith('data:image/')) {
      setQrCodeType('dataurl');
    } else if (qrCodeData.match(/^[A-Za-z0-9+/=]+$/)) {
      // Parece ser uma string base64 sem o prefixo data:image
      setQrCodeType('base64');
    } else {
      // Assumir que é texto para gerar QR code
      setQrCodeType('text');
    }
  }, [qrCodeData]);

  console.log('QR Code Type:', qrCodeType);
  console.log('QR Code Data (first 30 chars):', qrCodeData ? qrCodeData.substring(0, 30) + '...' : 'null');

  if (!qrCodeData) {
    return <div>Aguardando QR Code...</div>;
  }

  switch (qrCodeType) {
    case 'dataurl':
      // URL de dados completo (data:image/png;base64,...)
      return <img src={qrCodeData} alt="QR Code para WhatsApp" className="max-w-full h-auto" />;
    
    case 'base64':
      // String base64 sem prefixo
      return <img 
        src={`data:image/png;base64,${qrCodeData}`} 
        alt="QR Code para WhatsApp" 
        className="max-w-full h-auto"
      />;
    
    case 'text':
      // Texto para gerar QR code via biblioteca
      return <QRCode value={qrCodeData} size={256} />;
    
    default:
      // Fallback para API de QR code do Google
      return <img 
        src={`https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=${encodeURIComponent(qrCodeData)}`}
        alt="QR Code para WhatsApp" 
        className="max-w-full h-auto"
      />;
  }
};