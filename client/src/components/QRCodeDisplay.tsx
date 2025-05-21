import React from 'react';
import QRCode from 'qrcode.react'; // Se já tiver instalado essa biblioteca, ou use outra similar

const QRCodeDisplay = ({ qrCodeData, isImage = false }) => {
  console.log("Renderizando QR code:", {
    isImage,
    dataLength: qrCodeData?.length || 0,
    dataStart: qrCodeData?.substring(0, 30) || ''
  });
  
  if (!qrCodeData) {
    return <div>QR Code não disponível</div>;
  }
  
  if (isImage) {
    // Garantir que a URL da imagem tenha o prefixo correto
    if (!qrCodeData.startsWith('data:')) {
      // Se não tiver o prefixo, adicione
      return <img 
        src={`data:image/png;base64,${qrCodeData}`} 
        alt="QR Code para WhatsApp" 
        style={{ maxWidth: '100%', height: 'auto' }}
      />;
    }
    
    // Se já tiver o prefixo, use diretamente
    return <img 
      src={qrCodeData} 
      alt="QR Code para WhatsApp" 
      style={{ maxWidth: '100%', height: 'auto' }}
    />;
  } else {
    // Se não for imagem, gerar QR code a partir do texto
    // Se a biblioteca qrcode.react não estiver disponível, você pode usar uma alternativa ou importá-la
    return <QRCode 
      value={qrCodeData} 
      size={256} 
      level="H" 
      includeMargin={true}
    />;
  }
};

export default QRCodeDisplay;