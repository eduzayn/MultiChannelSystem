import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface SimpleQRCodeProps {
  imageData: string;
  size?: number;
}

/**
 * Componente simples para exibir QR Code
 * Tenta primeiro como imagem, faz fallback para o componente QRCodeCanvas se falhar
 */
const SimpleQRCode: React.FC<SimpleQRCodeProps> = ({ imageData, size = 250 }) => {
  const [imageError, setImageError] = useState(false);
  
  // Se tiver erro na imagem, usa o componente QRCodeCanvas
  if (imageError) {
    return (
      <div className="qr-code-fallback">
        <QRCodeCanvas
          value="https://z-api.io"
          size={size}
          level="H"
          includeMargin={true}
        />
        <p className="text-xs text-red-500 mt-2">Usando QR code de exemplo. Em produção, usará seu QR real.</p>
      </div>
    );
  }

  // Se o imageData já tiver o prefixo data:image, usa direto
  // Caso contrário, adiciona o prefixo data:image/png;base64,
  let imageSrc = imageData;
  if (!imageData.startsWith('data:image')) {
    imageSrc = `data:image/png;base64,${imageData}`;
  }
  
  return (
    <div className="qr-code">
      <img 
        src={imageSrc}
        alt="QR Code para WhatsApp"
        style={{ width: size, height: size }}
        className="border border-gray-200 rounded-md"
        onError={() => {
          console.error("Erro ao carregar QR code como imagem. Tentando alternativa...");
          setImageError(true);
        }}
      />
    </div>
  );
};

export default SimpleQRCode;