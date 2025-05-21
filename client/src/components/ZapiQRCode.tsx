import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface ZapiQRCodeProps {
  qrData: string;
  isImage: boolean;
  size?: number;
}

/**
 * Componente específico para exibir QR Codes da Z-API
 * Suporta os dois formatos suportados pela Z-API:
 * 1. Bytes para QR Code (/qr-code)
 * 2. Imagem base64 (/qr-code/image)
 */
const ZapiQRCode: React.FC<ZapiQRCodeProps> = ({ qrData, isImage, size = 256 }) => {
  const [error, setError] = useState<string | null>(null);
  
  // Opções de debug para auxiliar na detecção de problemas
  useEffect(() => {
    console.log('ZapiQRCode recebendo dados:', {
      isImage,
      dataLength: qrData?.length || 0,
      dataSample: qrData?.substring(0, 30) + '...'
    });
  }, [qrData, isImage]);
  
  if (!qrData) {
    return (
      <div className="flex items-center justify-center h-64 w-64 border border-dashed border-gray-300 rounded-md">
        <p className="text-sm text-gray-400">QR Code não disponível</p>
      </div>
    );
  }
  
  // Exibir o QR code como imagem (quando vem do endpoint /qr-code/image)
  if (isImage) {
    // Se não tem o prefixo data:image, adiciona
    const imageUrl = qrData.startsWith('data:image') 
      ? qrData 
      : `data:image/png;base64,${qrData.trim()}`;
      
    return (
      <div className="qr-container">
        <img 
          src={imageUrl}
          alt="QR Code para WhatsApp" 
          style={{ width: size, height: size, maxWidth: '100%' }}
          className="border border-gray-200 rounded-md"
          onError={(e) => {
            console.error('Erro ao carregar QR code como imagem:', imageUrl.substring(0, 30) + '...');
            setError('Não foi possível exibir o QR code como imagem');
          }}
        />
        {error && (
          <div className="mt-2 text-sm text-red-500">{error}</div>
        )}
      </div>
    );
  }
  
  // Exibir o QR code como texto (quando vem do endpoint /qr-code)
  return (
    <div className="qr-container">
      <QRCodeCanvas
        value={qrData}
        size={size}
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default ZapiQRCode;