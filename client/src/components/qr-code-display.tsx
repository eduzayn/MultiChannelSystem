import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCodeData: string | null;
  size?: number;
}

export function QRCodeDisplay({ qrCodeData, size = 256 }: QRCodeDisplayProps) {
  const [qrCodeType, setQrCodeType] = useState<'dataurl' | 'base64' | 'text' | 'empty'>('empty');
  
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

  if (!qrCodeData) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Aguardando QR Code...</p>
          <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mt-2"></div>
        </div>
      </div>
    );
  }

  // Log para depuração
  console.log(`QR Code tipo: ${qrCodeType}, primeiros 50 caracteres: ${qrCodeData.substring(0, 50)}...`);

  switch (qrCodeType) {
    case 'dataurl':
      // URL de dados completo (data:image/png;base64,...)
      return (
        <div className="bg-white p-6 rounded-md flex items-center justify-center">
          <img 
            src={qrCodeData} 
            alt="QR Code para WhatsApp" 
            style={{ maxWidth: '100%', width: `${size}px`, height: `${size}px` }}
            onError={(e) => {
              console.error("Erro ao carregar imagem QR code (dataurl)");
              // Se a imagem não carregar, usamos o QRCodeSVG como fallback
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    
    case 'base64':
      // String base64 sem prefixo - vamos tentar primeiro com img e se falhar usamos o QRCodeSVG
      return (
        <div className="bg-white p-6 rounded-md flex items-center justify-center">
          <img 
            src={`data:image/png;base64,${qrCodeData}`} 
            alt="QR Code para WhatsApp" 
            style={{ maxWidth: '100%', width: `${size}px`, height: `${size}px` }}
            onError={(e) => {
              console.error("Erro ao carregar imagem QR code (base64)");
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      );
    
    case 'text':
      // Texto para gerar QR code via biblioteca
      return (
        <div className="bg-white p-6 rounded-md flex items-center justify-center">
          <QRCodeSVG
            value={qrCodeData}
            size={size}
            bgColor={"#ffffff"}
            fgColor={"#000000"}
            level={"L"}
            includeMargin={true}
          />
        </div>
      );
    
    default:
      return (
        <div className="w-80 h-80 flex items-center justify-center border border-dashed border-gray-300 rounded-lg">
          <span className="text-sm text-muted-foreground">Erro ao carregar o QR Code.</span>
        </div>
      );
  }
}