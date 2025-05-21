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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    if (!qrCodeData) return;
    
    // Verificar se a resposta contém um erro da API ou está conectado
    try {
      // Tentativa de decodificar base64 e verificar se é um JSON de erro
      if (/^[A-Za-z0-9+/=]+$/.test(qrCodeData)) {
        try {
          const decodedData = atob(qrCodeData);
          if (decodedData.startsWith('{"error"')) {
            const errorObj = JSON.parse(decodedData);
            setErrorMessage(`Erro Z-API: ${errorObj.error || errorObj.message || 'Erro desconhecido'}`);
            setIsError(true);
            return;
          } else if (decodedData.startsWith('{"connected":true}')) {
            // WhatsApp já está conectado
            setErrorMessage("WhatsApp já está conectado com esta instância. Não é necessário escanear QR Code.");
            setIsError(true);
            return;
          }
        } catch (e) {
          // Se não conseguir decodificar, continua o fluxo normal
        }
      }
    } catch (e) {
      // Ignora erros de parsing
    }
    
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
    setErrorMessage(null);
  }, [qrCodeData, isImageQRCode]);
  
  // Se não há dados, mostra mensagem
  if (!qrCodeData) {
    return (
      <div className="flex items-center justify-center w-full h-full p-4 border border-dashed rounded-lg">
        <p className="text-muted-foreground">QR Code não disponível</p>
      </div>
    );
  }
  
  // Se há mensagem de erro, exibe-a
  if (isError && errorMessage) {
    return (
      <div className="flex flex-col items-center text-center p-4 border border-red-300 bg-red-50 rounded-lg">
        <p className="text-red-600 font-medium">Não foi possível obter o QR Code</p>
        <p className="text-sm text-red-500 mt-1">{errorMessage}</p>
        <p className="text-sm text-gray-500 mt-4">Verifique suas credenciais da Z-API e tente novamente.</p>
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
            setErrorMessage("Não foi possível exibir o QR Code como imagem");
          }}
        />
      </div>
    );
  }
  
  // Caso a imagem falhe ou seja um texto QR code, verificamos se é um base64 longo
  // Se for base64 muito longo, usamos diretamente como uma imagem
  if (qrCodeData.length > 1000 || qrCodeData.startsWith('data:image')) {
    console.log("Usando imagem direta para QR Code, comprimento:", qrCodeData.length);
    // Verificar se há um "value" dentro do base64 (que pode estar sendo enviado incorretamente)
    let finalQrUrl = qrCodeData;
    
    // Se a imagem começa com data:image, mas contém "value", pode ser um objeto JSON serializado
    if (qrCodeData.startsWith('data:image') && qrCodeData.includes('"value"')) {
      try {
        // Tenta obter o valor real do QR code que pode estar encapsulado
        // Este é um caso especial onde a Z-API pode estar retornando um JSON dentro do base64
        const encodedJson = qrCodeData.split('base64,')[1];
        if (encodedJson) {
          const decodedJson = atob(encodedJson);
          const jsonData = JSON.parse(decodedJson);
          if (jsonData && jsonData.value) {
            finalQrUrl = jsonData.value;
            console.log("Extraído valor encapsulado do QR code");
          }
        }
      } catch (e) {
        console.error("Erro ao tentar extrair valor encapsulado:", e);
        // Continua usando a URL original em caso de erro
      }
    }
    
    return (
      <div className="flex flex-col items-center">
        <img 
          src={finalQrUrl.startsWith('data:image') ? finalQrUrl : `data:image/png;base64,${finalQrUrl}`}
          alt="QR Code para WhatsApp" 
          width={size}
          height={size}
          style={{ maxWidth: '100%', height: 'auto' }}
          className="rounded-md"
          onError={(e) => {
            console.error("Erro ao carregar QR code como imagem:", e);
            e.currentTarget.style.display = 'none';
            // Mostrar uma mensagem de erro
            const errorDiv = document.createElement('div');
            errorDiv.className = 'p-4 bg-red-50 rounded-md text-red-700 text-center';
            errorDiv.innerHTML = 'Não foi possível carregar o QR code. Por favor, tente novamente.';
            e.currentTarget.parentNode?.appendChild(errorDiv);
          }}
        />
      </div>
    );
  }

  // Caso seja um texto QR normal (não muito longo), usamos QRCodeSVG
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