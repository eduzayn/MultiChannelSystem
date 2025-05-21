import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface SimpleQRCodeProps {
  qrCodeData: string;
  size?: number;
  isImageQRCode?: boolean;
}

/**
 * Componente para exibir um QR Code que pode ser uma imagem base64 ou texto
 * Usado para mostrar o QR Code da Z-API para conexão do WhatsApp
 */
export function SimpleQRCode({ qrCodeData, size = 256, isImageQRCode }: SimpleQRCodeProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  
  useEffect(() => {
    if (!qrCodeData) return;
    
    // Verificar se é uma imagem em base64
    if (isImageQRCode || qrCodeData.startsWith('data:image')) {
      setImageUrl(qrCodeData);
    } else if (/^[A-Za-z0-9+/=]+$/.test(qrCodeData)) {
      // É um base64 sem o prefixo data:image
      setImageUrl(`data:image/png;base64,${qrCodeData}`);
    } else {
      // Não é uma imagem, vamos usar como texto para QRCodeSVG
      setImageUrl(null);
    }
    
    setIsError(false);
  }, [qrCodeData, isImageQRCode]);
  
  // Se não há dados, mostra mensagem
  if (!qrCodeData) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 border border-dashed rounded-lg">
        <p className="text-muted-foreground">QR Code não disponível</p>
      </div>
    );
  }
  
  // Se é uma imagem e não houve erro, mostra a imagem
  if (imageUrl && !isError) {
    return (
      <div className="flex flex-col items-center">
        <img 
          src={imageUrl}
          alt="QR Code para WhatsApp" 
          width={size}
          height={size}
          style={{ maxWidth: '100%', height: 'auto' }}
          className="rounded-md"
          onError={() => {
            console.error("Erro ao carregar imagem QR code");
            setIsError(true);
          }}
        />
      </div>
    );
  }
  
  // Caso a imagem falhe ou seja um texto QR code, renderiza como SVG
  return (
    <div className="flex flex-col items-center">
      <QRCodeSVG 
        value={qrCodeData} 
        size={size}
        level="M"
        includeMargin={true}
      />
    </div>
  );
}