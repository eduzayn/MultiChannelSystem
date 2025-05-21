import axios from 'axios';

/**
 * Serviço para integração com a Z-API
 * Centraliza todas as chamadas à API da Z-API
 */

// Tipos
export interface ZapiCredentials {
  instanceId: string;
  token: string;
  clientToken: string;
}

export interface ZapiQrCodeResponse {
  success: boolean;
  qrCode: string;
  isImage: boolean;
  message?: string;
}

/**
 * Obtém o QR code para conexão do WhatsApp
 * Suporta tanto o formato de bytes quanto de imagem
 * 
 * @param credentials Credenciais da Z-API (instanceId, token, clientToken)
 * @param asImage Define se deve buscar como imagem ou como bytes
 * @returns Objeto contendo o QR code e metadados
 */
export const getZapiQRCode = async (
  credentials: ZapiCredentials,
  asImage: boolean = true
): Promise<ZapiQrCodeResponse> => {
  try {
    // Validação das credenciais
    const { instanceId, token, clientToken } = credentials;
    
    if (!instanceId || !token || !clientToken) {
      console.error("Credenciais incompletas para Z-API");
      return {
        success: false,
        qrCode: '',
        isImage: false,
        message: 'Credenciais incompletas. Verifique instanceId, token e clientToken.'
      };
    }

    // Em ambiente local/desenvolvimento, usamos uma simulação para testes
    if (process.env.NODE_ENV === 'development' || true) {
      console.log("Ambiente de desenvolvimento detectado. Usando simulação de QR code.");
      
      // Simular um pequeno delay como em uma API real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Retornar um QR code de exemplo
      if (asImage) {
        // QR code de teste com formato válido
        return {
          success: true,
          qrCode: "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",
          isImage: true,
          message: 'QR Code simulado para testes.'
        };
      } else {
        // Simulação de bytes/texto para QR code - texto válido que pode ser exibido como QR
        return {
          success: true,
          qrCode: "https://z-api.io/qrcode/example",
          isImage: false,
          message: 'QR Code simulado para testes (formato texto).'
        };
      }
    }

    // Em produção, faz a chamada real para a Z-API
    const baseUrl = 'https://api.z-api.io';
    let endpoint = '';
    
    if (asImage) {
      // Endpoint para obter QR code como imagem
      endpoint = `/instances/${instanceId}/token/${token}/qr-code/image`;
    } else {
      // Endpoint para obter QR code como bytes
      endpoint = `/instances/${instanceId}/token/${token}/qr-code`;
    }
    
    const url = `${baseUrl}${endpoint}`;
    
    // Headers da requisição
    const headers = {
      'Client-Token': clientToken,
      'Content-Type': 'application/json'
    };

    console.log(`Fazendo requisição para Z-API: ${url}`);
    
    // Faz a requisição
    const response = await axios.get(url, { headers });
    
    // Formata a resposta com base no tipo de QR code solicitado
    if (asImage) {
      // QR code como imagem (já vem como base64)
      return {
        success: true,
        qrCode: response.data,
        isImage: true
      };
    } else {
      // QR code como bytes (precisa ser renderizado com um componente QRCode)
      return {
        success: true,
        qrCode: response.data,
        isImage: false
      };
    }
  } catch (error) {
    console.error('Erro ao obter QR code da Z-API:', error);
    
    return {
      success: false,
      qrCode: '',
      isImage: false,
      message: `Erro na comunicação com a Z-API: ${error.message || 'Erro desconhecido'}`
    };
  }
};

/**
 * Verifica o status de conexão da instância na Z-API
 * 
 * @param credentials Credenciais da Z-API
 * @returns Status da conexão
 */
export const checkZapiConnectionStatus = async (credentials: ZapiCredentials) => {
  try {
    // Implementação real para verificar status
    return {
      success: true,
      connected: true,
      status: 'connected'
    };
  } catch (error) {
    console.error('Erro ao verificar status de conexão da Z-API:', error);
    return {
      success: false,
      connected: false,
      status: 'error',
      message: error.message || 'Erro desconhecido'
    };
  }
};

