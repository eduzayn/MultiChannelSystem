import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  qrCodeData: string | null;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ qrCodeData, size = 350 }) => {
  // Determinar o tipo de dados do QR code
  const [qrCodeType, setQrCodeType] = useState<'empty' | 'dataurl' | 'base64' | 'text' | 'unknown'>('unknown');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  
  useEffect(() => {
    if (!qrCodeData) {
      setQrCodeType('empty');
      setImageSrc(null);
    } else if (qrCodeData.startsWith('data:image/')) {
      setQrCodeType('dataurl');
      setImageSrc(qrCodeData);
    } else if (qrCodeData.match(/^[A-Za-z0-9+/=]+$/)) {
      // Parece ser uma string base64 sem o prefixo data:image
      setQrCodeType('base64');
      setImageSrc(`data:image/png;base64,${qrCodeData}`);
    } else {
      // Verificar se o QR code contém caracteres que não são válidos para base64
      // mas mesmo assim pode ser um QR code de texto que precisa ser gerado como SVG
      console.log("Tratando QR code como texto para gerar QR SVG");
      setQrCodeType('text');
      setImageSrc(null);
    }
  }, [qrCodeData]);

  if (!qrCodeData) {
    return (
      <div className="flex items-center justify-center border border-dashed border-gray-300 rounded-lg" 
           style={{ width: size, height: size }}>
        <span className="text-sm text-muted-foreground">Aguardando QR Code...</span>
      </div>
    );
  }

  // Se temos uma imagem fonte, exibimos
  if ((qrCodeType === 'dataurl' || qrCodeType === 'base64') && imageSrc) {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-white p-6 rounded-md shadow-md border border-gray-100">
          <img 
            src={imageSrc} 
            alt="QR Code para WhatsApp" 
            style={{ width: size, height: size }}
            className="max-w-full h-auto" 
            onError={(e) => {
              console.error("Erro ao carregar QR code como imagem, tentando como QR code SVG");
              // Em caso de erro na imagem, renderize o QR code como SVG
              setQrCodeType('text');
              
              // Podemos também tentar corrigir a URL da imagem removendo o prefixo data:image
              // e tentando usar o QRCodeSVG como fallback
              if (imageSrc?.startsWith('data:image/png;base64,')) {
                const rawBase64 = imageSrc.replace('data:image/png;base64,', '');
                // Se o rawBase64 for válido, podemos tentar usar diretamente como texto
                if (rawBase64 && rawBase64.length > 0) {
                  console.log("Tentando usar o conteúdo base64 como texto para QR code");
                }
              }
            }}
          />
        </div>
      </div>
    );
  }
  
  // Em todos os outros casos, incluindo texto ou quando a imagem falha,
  // usamos a biblioteca QRCode para gerar um QR Code a partir do texto
  return (
    <div className="bg-white p-6 rounded-md shadow-md border border-gray-100">
      <QRCodeSVG 
        value={qrCodeData} 
        size={size}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={true}
      />
    </div>
  );
};