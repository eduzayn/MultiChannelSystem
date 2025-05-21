import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface SimpleQRCodeProps {
  imageData: string | null;
  size?: number;
  error?: boolean;
  errorMessage?: string;
}

/**
 * Componente para exibir QR Code a partir de dados de imagem base64
 * ou mensagem de erro quando ocorrer problemas de comunicação
 */
const SimpleQRCode: React.FC<SimpleQRCodeProps> = ({ 
  imageData, 
  size = 250,
  error = false,
  errorMessage = ""
}) => {
  const [imgError, setImgError] = useState(false);
  
  // Se houver erro explícito, mostra a mensagem de erro
  if (error) {
    return (
      <div className="qr-code-error rounded-md border border-red-300 p-4 bg-red-50">
        <p className="text-sm text-red-600 font-medium">Erro ao obter QR code</p>
        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
        <p className="text-xs text-gray-500 mt-4">
          Detalhes do erro estão disponíveis no console para diagnóstico.
        </p>
      </div>
    );
  }
  
  // Se não tiver dados de imagem, mostra estado de carregamento
  if (!imageData) {
    return (
      <div className="qr-code-loading flex flex-col items-center justify-center" 
           style={{width: size, height: size}}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="text-xs text-gray-500 mt-4">Carregando QR code...</p>
      </div>
    );
  }

  // Se houve erro ao carregar a imagem, mostra msg de erro
  if (imgError) {
    return (
      <div className="qr-code-error rounded-md border border-red-300 p-4 bg-red-50">
        <p className="text-sm text-red-600 font-medium">Erro ao exibir imagem do QR code</p>
        <p className="text-xs text-red-500 mt-1">
          A imagem não pôde ser carregada no formato recebido.
        </p>
        <p className="text-xs text-gray-500 mt-4">
          Veja o console para detalhes técnicos.
        </p>
      </div>
    );
  }

  // Verifica e formata o imageData para exibição
  let imageSrc = '';
  if (imageData) {
    console.log("Recebido imageData do tipo:", typeof imageData);
    console.log("Tamanho do imageData:", imageData.length);
    console.log("Primeiros 30 caracteres:", imageData.substring(0, 30));
    console.log("Últimos 30 caracteres:", imageData.substring(imageData.length - 30));
    
    // Limpa qualquer prefixo ou caractere indesejado
    let cleanedData = imageData;
    
    // Se começar com aspas, remove
    if (cleanedData.startsWith('"') && cleanedData.endsWith('"')) {
      cleanedData = cleanedData.substring(1, cleanedData.length - 1);
    }
    
    // Verifica e aplica o formato correto
    if (cleanedData.startsWith('data:image')) {
      // Já é uma URL de dados completa
      imageSrc = cleanedData;
    } else if (cleanedData.startsWith('http')) {
      // É uma URL externa
      imageSrc = cleanedData;
    } else {
      // Assume que é um base64 sem prefixo e adiciona o prefixo adequado
      imageSrc = `data:image/png;base64,${cleanedData}`;
      console.log("Formatado como imagem base64");
    }
  } else {
    console.warn("imageData é null ou undefined");
  }
  
  // Mostra a imagem do QR code
  return (
    <div className="qr-code">
      <img 
        src={imageSrc}
        alt="QR Code para WhatsApp"
        style={{ width: size, height: size }}
        className="border border-gray-200 rounded-md"
        onError={(e) => {
          console.error("Erro ao carregar QR code como imagem:", e);
          console.log("Dados da imagem (primeiros 20 caracteres):", imageData?.substring(0, 20));
          setImgError(true);
        }}
      />
    </div>
  );
};

export default SimpleQRCode;