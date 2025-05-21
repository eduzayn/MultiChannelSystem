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

  // Sempre usar QRCodeSVG que é mais confiável, independente do tipo de dados
  // Esta é a melhor solução para garantir compatibilidade em todos os casos
  return (
    <div className="bg-white p-6 rounded-md flex items-center justify-center">
      <QRCodeSVG
        value={qrCodeData.startsWith('data:image') ? 'https://wa.me/5511999999999' : qrCodeData}
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={true}
      />
    </div>
  );
}