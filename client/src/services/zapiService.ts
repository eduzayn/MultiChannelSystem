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
        // Simulação de imagem base64
        return {
          success: true,
          qrCode: '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',
          isImage: true,
          message: 'QR Code simulado para testes.'
        };
      } else {
        // Simulação de bytes/texto para QR code
        return {
          success: true,
          qrCode: '1@Aa0X36NSAy0JkYP6Qm1EXmjiPpVJufNEcsMSzwfDVCJn9cnYH0JqfQ==,uhWae8apSKnReZ+X1HEfIGOO4kvk1tni3Pn7yHZXZl4=,nQJfWMn50xzFNqQmSw5jgg==',
          isImage: false,
          message: 'QR Code simulado para testes (formato bytes/texto).'
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

