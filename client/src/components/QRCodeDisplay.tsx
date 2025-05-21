import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCodeData: string;
  isImage?: boolean;
  size?: number;
}

/**
 * Componente especializado para exibição de QR codes do WhatsApp
 * Lida com diferentes formatos de QR code (texto ou imagem base64)
 */
const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrCodeData, 
  isImage = false,
  size = 256 
}) => {
  if (!qrCodeData) {
    return (
      <div className="flex items-center justify-center h-[256px] w-[256px] border border-dashed border-gray-300">
        <p className="text-gray-400 text-sm">QR Code não disponível</p>
      </div>
    );
  }

  // Se for uma imagem em formato base64 ou URL
  if (isImage || qrCodeData.startsWith('data:image')) {
    // Se for base64 sem o prefixo data:image, adicionamos o prefixo
    const src = qrCodeData.startsWith('data:image') 
      ? qrCodeData 
      : `data:image/png;base64,${qrCodeData}`;
    
    return (
      <img 
        src={src}
        alt="QR Code para WhatsApp" 
        style={{ width: size, height: size, maxWidth: '100%' }}
        onError={(e) => {
          console.error("Erro ao carregar QR Code como imagem");
          // Caso haja erro ao carregar a imagem, mostramos uma mensagem de erro
          const target = e.currentTarget;
          if (target.parentElement) {
            const errorMsg = document.createElement('div');
            errorMsg.className = "text-red-500 text-sm mt-2 text-center";
            errorMsg.innerText = "Erro ao carregar QR Code. Tente novamente.";
            target.parentElement.appendChild(errorMsg);
            target.style.display = 'none';
          }
        }}
      />
    );
  }
  
  // Se for texto, usamos a biblioteca QRCode para gerar um canvas
  return (
    <QRCodeCanvas
      value={qrCodeData}
      size={size}
      level="H" // Nível de correção de erro mais alto para garantir melhor leitura
      includeMargin={true}
    />
  );
};

export default QRCodeDisplay;