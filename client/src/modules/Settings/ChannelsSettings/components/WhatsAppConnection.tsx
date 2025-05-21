import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import ZapiQRCode from "../../../../components/ZapiQRCode"; // Novo componente otimizado para ZApi
import { getZapiQRCode, ZapiCredentials, checkZapiConnectionStatus } from "../../../../services/zapiService";

interface WhatsAppConnectionProps {
  channelConfig: any;
  onSuccess?: () => void;
}

function WhatsAppConnection({ channelConfig, onSuccess }: WhatsAppConnectionProps) {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isImageQR, setIsImageQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'waiting' | 'authenticating' | 'connected'>('waiting');

  const handleGetQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      setConnectionStatus('waiting');
      
      // Obtenha a configuração do canal
      const credentials: ZapiCredentials = {
        instanceId: channelConfig?.instanceId || '',
        token: channelConfig?.token || '',
        clientToken: channelConfig?.clientToken || ''
      };
      
      if (!credentials.instanceId || !credentials.token || !credentials.clientToken) {
        setError('Configuração incompleta. Verifique instanceId, token e clientToken.');
        setLoading(false);
        return;
      }
      
      // Opção para escolher o formato do QR code
      // Por padrão, usamos o formato de imagem, mas podemos alternar para bytes
      const useImageFormat = true; // true = imagem, false = bytes/texto
      
      // Chamar o serviço para obter o QR code
      const result = await getZapiQRCode(credentials, useImageFormat);
      
      if (result.success && result.qrCode) {
        console.log("QR Code obtido com sucesso:", {
          isImage: result.isImage,
          dataLength: result.qrCode.length
        });
        
        // Atualiza os dados do QR Code
        setQrCodeData(result.qrCode);
        setIsImageQR(result.isImage);
        setConnectionStatus('authenticating');
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar",
        });
        
        // Opcionalmente, podemos iniciar um intervalo para verificar o status de conexão
        // Essa verificação pode ser útil para atualizar o status quando o usuário escanear o QR code
        /*
        const checkInterval = setInterval(async () => {
          const statusResult = await checkZapiConnectionStatus(credentials);
          if (statusResult.success && statusResult.connected) {
            setConnectionStatus('connected');
            clearInterval(checkInterval);
            if (onSuccess) onSuccess();
          }
        }, 5000); // Verificar a cada 5 segundos
        */
      } else {
        setError(result.message || 'Falha ao obter QR Code');
        toast({
          title: "Erro ao gerar QR Code",
          description: result.message || "Não foi possível gerar o QR Code. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (err: any) {
      console.error('Erro ao obter QR code:', err);
      setError('Erro ao conectar com a Z-API');
      toast({
        title: "Erro de conexão",
        description: `Houve um erro ao tentar conectar com a Z-API: ${err.message || 'Erro desconhecido'}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleGetQRCode} 
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Carregando...' : 'Gerar QR Code para Conexão'}
      </Button>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}
      
      {connectionStatus === "waiting" && loading && (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Carregando QR Code...</p>
            <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mt-2"></div>
          </div>
        </div>
      )}
      
      {connectionStatus === "authenticating" && qrCodeData && (
        <div className="w-full flex flex-col items-center justify-center">
          <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-white">
            <ZapiQRCode qrData={qrCodeData} isImage={isImageQR} size={250} />
          </div>
          <p className="text-sm text-muted-foreground mt-2">Escaneie com WhatsApp</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-md text-center">
            Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione "WhatsApp Web". Aponte a câmera para este QR Code.
          </p>
        </div>
      )}
      
      {connectionStatus === "connected" && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-green-600 mt-2">Conectado!</p>
            <p className="text-xs text-muted-foreground mt-1">Telefone: {channelConfig?.instanceId}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WhatsAppConnection;