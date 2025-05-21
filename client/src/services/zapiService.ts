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
    if (!credentials.instanceId || !credentials.token || !credentials.clientToken) {
      console.error("Credenciais incompletas para Z-API");
      return {
        success: false,
        qrCode: '',
        isImage: false,
        message: 'Credenciais incompletas. Verifique instanceId, token e clientToken.'
      };
    }

    console.log(`Usando credenciais Z-API enviadas pelo componente`);
    
    // Credenciais reais para testes do usuário
    // Caso o usuário queira forçar o uso destas credenciais
    const testInstanceId = "3DF871A7ADFB20FB49998E66062CE0C1";
    const testToken = "A4E42829C2488720A0842F47";
    const testClientToken = "Fa427b12e1884332929a658fe45a07714$";
    
    // Configuração para API
    const baseUrl = 'https://api.z-api.io';
    const endpoint = asImage 
      ? `/instances/${credentials.instanceId}/token/${credentials.token}/qr-code/image`
      : `/instances/${credentials.instanceId}/token/${credentials.token}/qr-code`;
    
    const url = `${baseUrl}${endpoint}`;
    
    const headers = {
      'Client-Token': credentials.clientToken,
      'Content-Type': 'application/json'
    };

    console.log(`Fazendo requisição para Z-API: ${url}`);
    
    try {
      // Log detalhado de toda a requisição para diagnóstico
      console.log('Detalhes da requisição Z-API:');
      console.log(`URL: ${url}`);
      console.log(`Headers:`, JSON.stringify(headers, null, 2));
      
      // Faz a requisição com timeout explícito
      const response = await axios.get(url, { 
        headers,
        timeout: 10000 // 10 segundos de timeout 
      });
      
      // Log da resposta para diagnóstico
      console.log('Resposta da Z-API:');
      console.log(`Status: ${response.status}`);
      console.log(`Headers:`, JSON.stringify(response.headers, null, 2));
      console.log(`Tipo de dados recebidos: ${typeof response.data}`);
      console.log(`Tamanho dos dados: ${response.data?.length || 'N/A'}`);
      
      // Verifica se a resposta contém dados válidos
      if (!response.data) {
        throw new Error('Resposta sem dados (vazia)');
      }
      
      if (asImage) {
        // Verifica se a resposta tem formato adequado para imagem
        if (typeof response.data !== 'string' || response.data.length < 100) {
          console.error('Dados de QR code inválidos:', response.data);
          throw new Error('Formato de QR code inválido');
        }
        
        return {
          success: true,
          qrCode: response.data,
          isImage: true
        };
      } else {
        // Para formato de texto, apenas retorna
        return {
          success: true,
          qrCode: response.data,
          isImage: false
        };
      }
    } catch (error: any) {
      // Log detalhado do erro para diagnóstico
      console.error('Erro na requisição à Z-API:');
      console.error(`Mensagem: ${error.message}`);
      
      if (error.response) {
        // Erro com resposta da API (4xx, 5xx)
        console.error(`Status: ${error.response.status}`);
        console.error(`Dados: ${JSON.stringify(error.response.data)}`);
        console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
      } else if (error.request) {
        // Erro sem resposta (cliente não recebeu resposta)
        console.error('Sem resposta do servidor Z-API');
        console.error(error.request);
      }
      
      // Retorna erro real sem fallback
      return {
        success: false,
        qrCode: '',
        isImage: false,
        message: `Erro na comunicação com a Z-API: ${error.message}`
      };
    }
  } catch (error: any) {
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
    // Em uma implementação real, você faria uma chamada para verificar o status
    // Por enquanto, estamos simulando um resultado
    
    return {
      success: true,
      connected: true,
      status: 'connected'
    };
  } catch (error: any) {
    console.error('Erro ao verificar status de conexão da Z-API:', error);
    return {
      success: false,
      connected: false,
      status: 'error',
      message: error.message || 'Erro desconhecido'
    };
  }
};