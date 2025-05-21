/**
 * Serviço para interação com a API Z-API no frontend
 */
import axios from 'axios';

/**
 * Interface para envio de mensagens de texto
 */
interface SendTextMessageParams {
  channelId: number;
  to: string;
  message: string;
}

/**
 * Interface para envio de mensagens com botões
 */
interface SendButtonMessageParams {
  channelId: number;
  to: string;
  title: string;
  message: string;
  footer: string;
  buttons: string[] | { buttonText: string; buttonId?: string }[];
}

/**
 * Interface para resposta de envio de mensagem
 */
interface SendMessageResponse {
  success: boolean;
  messageId?: string;
  message?: string;
}

/**
 * Envia uma mensagem de texto via Z-API
 */
export async function sendTextMessage(params: SendTextMessageParams): Promise<SendMessageResponse> {
  try {
    const { channelId, to, message } = params;
    
    const response = await axios.post(`/api/zapi/send-text/${channelId}`, {
      to,
      message
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem de texto:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar mensagem'
      };
    }
    
    return {
      success: false,
      message: 'Erro desconhecido ao enviar mensagem'
    };
  }
}

/**
 * Envia uma mensagem com botões via Z-API
 */
export async function sendButtonMessage(params: SendButtonMessageParams): Promise<SendMessageResponse> {
  try {
    const { channelId, to, title, message, footer, buttons } = params;
    
    const response = await axios.post(`/api/zapi/send-button/${channelId}`, {
      to,
      title,
      message,
      footer,
      buttons
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem com botões:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao enviar mensagem com botões'
      };
    }
    
    return {
      success: false,
      message: 'Erro desconhecido ao enviar mensagem com botões'
    };
  }
}

/**
 * Testa a conexão com uma instância Z-API
 */
export async function testZapiConnection(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    const response = await axios.post('/api/zapi/test-connection', {
      instanceId,
      token,
      clientToken
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao testar conexão Z-API:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao testar conexão'
      };
    }
    
    return {
      success: false,
      message: 'Erro desconhecido ao testar conexão'
    };
  }
}

/**
 * Obtém o QR Code para conectar uma instância Z-API
 */
export async function getZapiQRCode(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{ success: boolean; qrCode?: string; message?: string }> {
  try {
    const response = await axios.post('/api/zapi/get-qrcode', {
      instanceId,
      token,
      clientToken
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao obter QR Code Z-API:', error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao obter QR Code'
      };
    }
    
    return {
      success: false,
      message: 'Erro desconhecido ao obter QR Code'
    };
  }
}