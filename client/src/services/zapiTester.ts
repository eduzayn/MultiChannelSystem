import axios from 'axios';

/**
 * Testa a conexão com a Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @returns Resultado do teste de conexão
 */
export async function testZapiConnection(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{
  success: boolean;
  message: string;
  status?: string;
  details?: any;
}> {
  try {
    const response = await axios.post('/api/zapi/test-connection', {
      instanceId,
      token,
      clientToken
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Erro ao testar conexão com Z-API:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao conectar com a Z-API',
      status: 'error'
    };
  }
}

/**
 * Obtém o QR Code da Z-API para conexão do WhatsApp
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @returns Resultado da operação com o QR Code se bem-sucedida
 */
export async function getZapiQRCode(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{
  success: boolean;
  qrCode?: string;
  message?: string;
  isImage?: boolean;
}> {
  try {
    const response = await axios.post('/api/zapi/get-qrcode', {
      instanceId,
      token,
      clientToken
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Erro ao obter QR Code da Z-API:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao obter QR Code da Z-API'
    };
  }
}

/**
 * Envia uma mensagem de texto via Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @param phone Número de telefone no formato DDI+DDD+NUMERO (ex: 5511999999999)
 * @param message Mensagem a ser enviada
 * @returns Resultado da operação de envio
 */
export async function sendTextMessage(
  instanceId: string,
  token: string,
  clientToken: string,
  phone: string,
  message: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    const response = await axios.post('/api/zapi/send-message', {
      instanceId,
      token,
      clientToken,
      phone,
      message
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Erro ao enviar mensagem via Z-API:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Erro ao enviar mensagem'
    };
  }
}