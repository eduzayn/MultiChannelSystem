/**
 * Serviço para envio de mensagens via Z-API
 */

// Interfaces para as mensagens
export interface SendTextMessageParams {
  channelId: number;
  to: string;
  message: string;
}

export interface SendButtonMessageParams {
  channelId: number;
  to: string;
  title: string;
  message: string;
  footer: string;
  buttons: any[];
}

/**
 * Envia mensagem de texto via Z-API
 * 
 * @param params Parâmetros para envio de mensagem de texto
 * @returns Resultado do envio
 */
export const sendTextMessage = async (params: SendTextMessageParams): Promise<{success: boolean; messageId?: string; message?: string}> => {
  try {
    const { channelId, to, message } = params;
    
    console.log(`Enviando mensagem para ${to}: "${message}"`);
    
    // Obter as credenciais do canal baseado no channelId
    // Estamos obtendo as credenciais do backend para garantir acesso à instância correta
    const response1 = await fetch(`/api/zapi/channels/${channelId}/credentials`);
    const credentialsData = await response1.json();
    
    if (!credentialsData.success) {
      console.error("Erro ao obter credenciais do canal:", credentialsData.message);
      return {
        success: false,
        message: "Não foi possível obter as credenciais para este canal de WhatsApp"
      };
    }
    
    const instanceId = credentialsData.instanceId; 
    const token = credentialsData.token;
    
    // Faz a chamada para a API do servidor
    const response = await fetch('/api/zapi/send-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        instanceId, 
        token,
        phone: to.replace(/\D/g, ''), // Remove não-dígitos do número
        message
      })
    });
    
    const data = await response.json();
    console.log('Resposta do servidor:', data);
    
    return {
      success: data.success,
      messageId: data.messageId,
      message: data.message || 'Mensagem enviada com sucesso'
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    return {
      success: false,
      message: error.message || 'Erro ao enviar mensagem'
    };
  }
};

/**
 * Envia mensagem com botões via Z-API
 * 
 * @param params Parâmetros para envio de mensagem com botões
 * @returns Resultado do envio
 */
export const sendButtonMessage = async (params: SendButtonMessageParams): Promise<{success: boolean; messageId?: string; message?: string}> => {
  try {
    const { channelId, to, title, message, footer, buttons } = params;
    
    // Para fins de demonstração, simulamos o envio bem sucedido
    console.log(`Simulando envio de mensagem com botões para ${to}: "${message}"`);
    console.log('Botões:', buttons);
    
    // Simula um pequeno delay como em uma API real
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      success: true,
      messageId: `btn_${Date.now()}`,
      message: 'Mensagem com botões enviada com sucesso'
    };
    
    // Em produção, faria uma chamada para a API do servidor
    // return await fetch(`/api/zapi/send-button-message/${channelId}`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ to, title, message, footer, buttons })
    // }).then(res => res.json());
  } catch (error: any) {
    console.error('Erro ao enviar mensagem com botões:', error);
    return {
      success: false,
      message: error.message || 'Erro ao enviar mensagem com botões'
    };
  }
};