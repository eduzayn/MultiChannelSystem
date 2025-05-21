import React from 'react';

interface SimpleQRCodeProps {
  imageData: string;
  size?: number;
}

/**
 * Componente simples para exibir QR Code
 * Aceita um base64 string e o exibe como imagem
 */
const SimpleQRCode: React.FC<SimpleQRCodeProps> = ({ imageData, size = 250 }) => {
  // Verifica se o string já começa com data:image
  const imageSrc = imageData.startsWith('data:image') 
    ? imageData 
    : `data:image/png;base64,${imageData}`;
    
  return (
    <div className="qr-code">
      <img 
        src={imageSrc}
        alt="QR Code"
        style={{ width: size, height: size }}
        className="border border-gray-200 rounded-md"
      />
    </div>
  );
};

export default SimpleQRCode;