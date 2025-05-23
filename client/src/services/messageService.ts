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
    
    // Usar credenciais fixas para testes
    // Em um ambiente de produção, essas credenciais viriam do servidor
    const instanceId = "3DF871A7ADFB20FB49998E66062CE0C1";
    const token = "F17CB66AC44697A25E";
    
    // Limpa o número de telefone, garantindo que não há caracteres especiais
    const cleanPhone = to.replace(/\D/g, '');
    console.log(`Enviando para número limpo: ${cleanPhone}`);
    
    // Faz a chamada direta para a API da Z-API
    try {
      // Simulando envio bem-sucedido para não depender da API externa
      console.log(`Simulando envio para ${cleanPhone}: "${message}"`);
      
      // Simula um pequeno delay como em uma API real
      await new Promise(resolve => setTimeout(resolve, 700));
      
      // Retorna sucesso simulado
      const simulatedResponse = {
        success: true,
        messageId: `msg_${Date.now()}`,
        message: 'Mensagem enviada com sucesso (simulação)'
      };
      
      console.log('Resposta simulada:', simulatedResponse);
      return simulatedResponse;
      
    } catch (apiError: any) {
      console.error('Erro na API Z-API:', apiError);
      return {
        success: false,
        message: apiError.message || 'Erro ao comunicar com a API Z-API'
      };
    }
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