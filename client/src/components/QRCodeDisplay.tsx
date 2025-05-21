import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

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

  // Em vez de lidar com diferentes formatos em um switch, vamos usar a biblioteca QRCode
  // para gerar o QR Code a partir do texto, que é o formato mais seguro.
  // Isso evita problemas com URLs inválidas.
  
  // Se começa com "data:image" e parece ser uma URL de imagem válida, tenta exibir como imagem
  if (qrCodeType === 'dataurl' && /^data:image\/(png|jpg|jpeg|gif);base64,[A-Za-z0-9+/=]+$/.test(qrCodeData)) {
    return <img 
      src={qrCodeData} 
      alt="QR Code para WhatsApp" 
      className="max-w-full h-auto" 
    />;
  }
  
  // Em todos os outros casos, incluindo texto ou strings que não são URLs de imagem válidas,
  // usamos a biblioteca QRCode para gerar um QR Code a partir do texto
  return (
    <div className="bg-white p-4 rounded-md">
      <QRCodeSVG 
        value={qrCodeData} 
        size={256}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={true}
      />
    </div>
  );
};