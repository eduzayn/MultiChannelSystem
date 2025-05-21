import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/**
 * Componente para exibição de QR Code que lida com diferentes formatos de entrada
 * 
 * @param {Object} props Propriedades do componente
 * @param {string|null} props.qrCodeData Dados do QR code (URL completa, base64 ou texto plano)
 * @param {boolean} props.isImage Flag indicando se os dados são uma imagem
 * @param {number} props.size Tamanho do QR code em pixels
 * @returns Componente React
 */
const QRCodeDisplay = ({ qrCodeData, isImage = false, size = 256 }) => {
  const [error, setError] = useState(false);
  const [dataType, setDataType] = useState('unknown');
  
  useEffect(() => {
    // Detectar automaticamente o tipo de dados
    if (!qrCodeData) {
      setDataType('empty');
    } else if (typeof qrCodeData === 'string') {
      if (qrCodeData.startsWith('data:image')) {
        setDataType('dataurl');
      } else if (qrCodeData.match(/^[A-Za-z0-9+/=]+$/)) {
        setDataType('base64');
      } else {
        setDataType('text');
      }
    }
    
    // Resetar erro quando os dados mudam
    setError(false);
  }, [qrCodeData]);
  
  // Logging para depuração
  console.log("Renderizando QR code:", {
    dataType,
    isImage,
    dataLength: qrCodeData?.length || 0,
    dataStart: qrCodeData?.substring(0, 30) || ''
  });
  
  // Estado de carregamento ou vazio
  if (!qrCodeData) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 border border-dashed border-gray-300 rounded-lg">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Aguardando QR Code...</p>
          <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mt-2"></div>
        </div>
      </div>
    );
  }
  
  // Em caso de erro anterior, sempre usamos o QRCodeSVG como fallback
  if (error) {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-lg">
        <QRCodeSVG
          value={typeof qrCodeData === 'string' ? qrCodeData : 'https://wa.me/5511999999999'}
          size={size}
          level="M"
          includeMargin={true}
        />
      </div>
    );
  }
  
  // Tentamos exibir como imagem base64 com URL completa
  if (dataType === 'dataurl') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-lg">
        <img 
          src={qrCodeData} 
          alt="QR Code para WhatsApp" 
          style={{ maxWidth: '100%', width: size, height: size }}
          onError={() => {
            console.error("Falha ao carregar QR Code como image dataURL");
            setError(true);
          }}
        />
      </div>
    );
  }
  
  // Tentamos exibir como imagem base64 sem prefixo
  if (dataType === 'base64') {
    return (
      <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-lg">
        <img 
          src={`data:image/png;base64,${qrCodeData}`} 
          alt="QR Code para WhatsApp" 
          style={{ maxWidth: '100%', width: size, height: size }}
          onError={() => {
            console.error("Falha ao carregar QR Code como base64");
            setError(true);
          }}
        />
      </div>
    );
  }
  
  // Por padrão, geramos um QR code a partir do texto
  return (
    <div className="w-full flex flex-col items-center justify-center p-6 bg-white rounded-lg">
      <QRCodeSVG
        value={typeof qrCodeData === 'string' ? qrCodeData : 'https://wa.me/5511999999999'}
        size={size}
        level="M"
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeDisplay;