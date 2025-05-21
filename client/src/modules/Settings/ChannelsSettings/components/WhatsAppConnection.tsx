import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import QRCodeDisplay from "../../../../components/QRCodeDisplay"; // Usando o caminho relativo para garantir compatibilidade

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
      const { instanceId, token, clientToken } = channelConfig || {};
      
      if (!instanceId || !token || !clientToken) {
        setError('Configuração incompleta. Verifique instanceId, token e clientToken.');
        setLoading(false);
        return;
      }
      
      // Chamar a API para obter o QR code
      const response = await fetch('/api/zapi/get-qrcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instanceId, token, clientToken }),
      });
      
      const result = await response.json();
      
      if (result.success && result.qrCode) {
        console.log("QR Code obtido com sucesso:", {
          isImage: result.isImage,
          dataLength: result.qrCode.length
        });
        
        // Atualiza a URL do QR Code real
        // Se o QR code for uma imagem (base64), incluímos o prefixo data:image se necessário
        if (result.isImage && !result.qrCode.startsWith('data:image')) {
          setQrCodeData(`data:image/png;base64,${result.qrCode}`);
        } else {
          setQrCodeData(result.qrCode);
        }
        
        setIsImageQR(result.isImage || false);
        setConnectionStatus('authenticating');
        
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar",
        });
      } else {
        setError(result.message || 'Falha ao obter QR Code');
        toast({
          title: "Erro ao gerar QR Code",
          description: result.message || "Não foi possível gerar o QR Code. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Erro ao obter QR code:', err);
      setError('Erro ao conectar com o servidor Z-API');
      toast({
        title: "Erro de conexão",
        description: "Houve um erro ao tentar conectar com a Z-API. Tente novamente.",
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
            <QRCodeDisplay qrCodeData={qrCodeData} isImage={isImageQR} />
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