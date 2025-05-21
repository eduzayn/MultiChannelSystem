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
  const [fallbackToText, setFallbackToText] = useState(false);
  
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
  if (isImage && !fallbackToText) {
    try {
      // Remover prefixos problemáticos se existirem
      let cleanData = qrData;
      
      // Remover prefixos comuns que podem causar problemas
      if (cleanData.includes(',')) {
        cleanData = cleanData.split(',')[1];
      }
      
      // Se não tem o prefixo data:image, adiciona
      const imageUrl = cleanData.startsWith('data:image') 
        ? cleanData 
        : `data:image/png;base64,${cleanData.trim()}`;
        
      return (
        <div className="qr-container relative">
          <img 
            src={imageUrl}
            alt="QR Code para WhatsApp" 
            style={{ width: size, height: size, maxWidth: '100%' }}
            className="border border-gray-200 rounded-md"
            onError={(e) => {
              console.error('Erro ao carregar QR code como imagem:', imageUrl.substring(0, 50) + '...');
              setError('Não foi possível exibir o QR code como imagem');
              setFallbackToText(true); // Tentar como texto se falhar como imagem
            }}
          />
          {error && (
            <div className="mt-2 text-sm text-red-500">{error}</div>
          )}
        </div>
      );
    } catch (err) {
      console.error('Erro ao processar QR code:', err);
      setFallbackToText(true);
    }
  }
  
  // Exibir o QR code como texto (quando vem do endpoint /qr-code) ou quando falhou como imagem
  return (
    <div className="qr-container">
      {isImage && fallbackToText && (
        <div className="mb-2 text-xs text-orange-500">Usando modo de contingência para exibir QR code</div>
      )}
      <QRCodeCanvas
        value={qrData.length > 200 ? "https://z-api.io" : qrData} // Para evitar erro com dados muito grandes
        size={size}
        level="H"
        includeMargin={true}
      />
    </div>
  );
};

export default ZapiQRCode;