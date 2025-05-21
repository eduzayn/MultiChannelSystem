import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCodeData: string;
  size?: number;
}

export default function QRCodeDisplay({ qrCodeData, size = 256 }: QRCodeDisplayProps) {
  const [isImage, setIsImage] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  
  useEffect(() => {
    // Verifica se o QR code é uma imagem base64 ou texto
    if (qrCodeData.startsWith('data:image')) {
      // Já é uma imagem completa com data URL
      setIsImage(true);
      setImageData(qrCodeData);
    } else if (/^[A-Za-z0-9+/=]+$/.test(qrCodeData)) {
      // É um base64 sem o prefixo data:image
      setIsImage(true);
      setImageData(`data:image/png;base64,${qrCodeData}`);
    } else {
      // É um texto QR code
      setIsImage(false);
      setImageData(null);
    }
  }, [qrCodeData]);
  
  if (isImage && imageData) {
    return (
      <img 
        src={imageData}
        alt="QR Code para WhatsApp" 
        width={size}
        height={size}
        style={{ maxWidth: '100%', height: 'auto' }}
        onError={(e) => {
          console.error("Erro ao carregar imagem QR code");
          setIsImage(false); // Fallback para QRCodeSVG em caso de erro
          
          // Mostra alerta de erro
          const target = e.currentTarget;
          if (target.parentElement) {
            const errorMsg = document.createElement('div');
            errorMsg.innerHTML = '<p style="color: red; text-align: center; margin-top: 8px;">Erro ao carregar QR Code. Tente novamente.</p>';
            target.parentElement.appendChild(errorMsg);
          }
          
          // Esconde a imagem quebrada
          target.style.display = 'none';
        }}
      />
    );
  }
  
  // Renderiza como SVG QR Code se for texto ou se a imagem falhar
  return (
    <QRCodeSVG 
      value={qrCodeData} 
      size={size}
      level="M"
      includeMargin={true}
      bgColor="#FFFFFF"
      fgColor="#000000"
    />
  );
}