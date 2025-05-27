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

export interface SendOptionListMessageParams {
  channelId: number;
  to: string;
  title: string;
  buttonLabel: string;
  options: Array<{
    title: string;
    rows: Array<{
      title: string;
      description?: string;
      id?: string;
    }>;
  }>;
  description?: string;
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
    
    // Limpa o número de telefone, garantindo que não há caracteres especiais
    const cleanPhone = to.replace(/\D/g, '');
    console.log(`Enviando para número limpo: ${cleanPhone}`);
    
    // Faz a chamada real para a API Z-API através do nosso backend
    const response = await fetch('/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phoneNumber: cleanPhone,
        message: message,
        channelId: channelId
      })
    });
    
    // Se a resposta não for ok, lançar erro
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Resposta do servidor:', data);
    
    // Propagar o resultado exato da API, sem simular sucessos
    return {
      success: data.success,
      messageId: data.messageId,
      message: data.message || (data.success ? 'Mensagem enviada com sucesso' : 'Falha ao enviar mensagem')
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem:', error);
    
    // Propagar o erro real para a interface
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
    
    console.log(`Enviando mensagem com botões para ${to}: "${message}"`);
    console.log('Botões:', buttons);
    
    // Limpa o número de telefone, garantindo que não há caracteres especiais
    const cleanPhone = to.replace(/\D/g, '');
    
    // Faz a chamada real para a API Z-API através do nosso backend
    const response = await fetch('/api/zapi/send-button-message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phoneNumber: cleanPhone,
        title,
        message, 
        footer,
        buttons,
        channelId: channelId
      })
    });
    
    // Se a resposta não for ok, lançar erro
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Resposta do servidor para mensagem com botões:', data);
    
    // Propagar o resultado exato da API
    return {
      success: data.success,
      messageId: data.messageId,
      message: data.message || (data.success ? 'Mensagem com botões enviada com sucesso' : 'Falha ao enviar mensagem com botões')
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem com botões:', error);
    return {
      success: false,
      message: error.message || 'Erro ao enviar mensagem com botões'
    };
  }
};

/**
 * Envia mensagem com lista de opções via Z-API
 * 
 * @param params Parâmetros para envio de mensagem com lista de opções
 * @returns Resultado do envio
 */
export const sendOptionListMessage = async (params: SendOptionListMessageParams): Promise<{success: boolean; messageId?: string; message?: string}> => {
  try {
    const { channelId, to, title, buttonLabel, options, description } = params;
    
    console.log(`Enviando mensagem com lista de opções para ${to}: "${title}"`);
    console.log('Opções:', options);
    
    // Limpa o número de telefone, garantindo que não há caracteres especiais
    const cleanPhone = to.replace(/\D/g, '');
    
    // Faz a chamada real para a API Z-API através do nosso backend
    const response = await fetch('/api/zapi/send-option-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phoneNumber: cleanPhone,
        title,
        buttonLabel,
        options,
        description,
        channelId: channelId
      })
    });
    
    // Se a resposta não for ok, lançar erro
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    console.log('Resposta do servidor para mensagem com lista de opções:', data);
    
    // Propagar o resultado exato da API
    return {
      success: data.success,
      messageId: data.messageId,
      message: data.message || (data.success ? 'Mensagem com lista de opções enviada com sucesso' : 'Falha ao enviar mensagem com lista de opções')
    };
  } catch (error: any) {
    console.error('Erro ao enviar mensagem com lista de opções:', error);
    return {
      success: false,
      message: error.message || 'Erro ao enviar mensagem com lista de opções'
    };
  }
};
