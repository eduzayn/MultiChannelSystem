import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCodeData: string;
  isImage?: boolean;
  size?: number;
}

/**
 * Componente especializado para exibição de QR codes do WhatsApp
 * Lida com diferentes formatos de QR code da Z-API: bytes para imagem e imagem estática
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodeData, 
  isImage = false,
  size = 256 
}) => {
  const [hasError, setHasError] = useState(false);
  const [formattedData, setFormattedData] = useState<string>('');
  
  useEffect(() => {
    if (!qrCodeData) return;
    
    try {
      // Verificamos qual formato de QR code foi recebido
      if (isImage) {
        // Se já tem prefixo de data:image, utilizamos como está
        if (qrCodeData.startsWith('data:image')) {
          setFormattedData(qrCodeData);
        } else {
          // Limpeza de caracteres potencialmente problemáticos no início e fim do base64
          let cleanBase64 = qrCodeData.trim().replace(/^[^A-Za-z0-9+/=]+|[^A-Za-z0-9+/=]+$/g, '');
          setFormattedData(`data:image/png;base64,${cleanBase64}`);
        }
      } else {
        // Se for dados de texto para gerar QR, simplesmente passamos o valor
        setFormattedData(qrCodeData);
      }
    } catch (error) {
      console.error("Erro ao formatar dados do QR code:", error);
      setHasError(true);
    }
  }, [qrCodeData, isImage]);

  if (!qrCodeData) {
    return (
      <div className="flex items-center justify-center h-[256px] w-[256px] border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">QR Code não disponível</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center h-[256px] w-[256px] border border-dashed border-red-300">
        <p className="text-red-500 text-sm text-center">Erro ao processar QR Code</p>
        <p className="text-gray-400 text-xs mt-2 text-center">Tente novamente ou contate o suporte.</p>
      </div>
    );
  }

  // Exibição baseada no tipo (imagem ou texto)
  if (isImage && formattedData) {
    return (
      <div className="qr-code-container">
        <img 
          src={formattedData}
          alt="QR Code para WhatsApp" 
          style={{ width: size, height: size, maxWidth: '100%' }}
          onError={(e) => {
            console.error("Erro ao carregar QR Code como imagem");
            setHasError(true);
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }
  
  // Se não for imagem ou se imagem falhar, tentamos gerar QR Code com a biblioteca
  return (
    <QRCodeCanvas
      value={formattedData || qrCodeData}
      size={size}
      level="H" // Nível de correção de erro mais alto para garantir melhor leitura
      includeMargin={true}
    />
  );
};

export default QRCodeDisplay;