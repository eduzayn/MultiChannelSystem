import axios from 'axios';
import { MarketingChannel } from '@shared/schema';

/**
 * Serviço de integração com a Z-API (WhatsApp)
 * 
 * Implementa as funcionalidades da Z-API para envio e recebimento
 * de mensagens do WhatsApp.
 */

// Base URL da API Z-API
const BASE_URL = 'https://api.z-api.io';

// Formato de botões para mensagens interativas
interface ZAPIButton {
  buttonId: string;
  buttonText: {
    displayText: string;
  };
}

/**
 * Formata botões para o padrão aceito pela Z-API
 * @param buttons Array de botões em formato simplificado ou parcial
 * @returns Array de botões no formato oficial Z-API
 */
export function formatButtonsForZAPI(buttons: any[]): ZAPIButton[] {
  return buttons.map((button, index) => {
    // Se já está no formato completo, retorna como está
    if (button.buttonId && typeof button.buttonText === 'object' && button.buttonText.displayText) {
      return button;
    }
    
    // Se está no formato intermediário com buttonText como string
    if (typeof button.buttonText === 'string') {
      return {
        buttonId: button.buttonId || `btn_${index + 1}`,
        buttonText: {
          displayText: button.buttonText
        }
      };
    }
    
    // Formato simplificado
    return {
      buttonId: button.buttonId || `btn_${index + 1}`,
      buttonText: {
        displayText: button.text || ""
      }
    };
  });
}

/**
 * Obtém os cabeçalhos HTTP necessários para autenticação com a Z-API
 * @param clientToken Token de cliente/segurança da conta Z-API
 * @returns Objeto com cabeçalhos HTTP
 */
function getHeadersWithToken(clientToken: string) {
  // IMPORTANTE: De acordo com a documentação da Z-API,
  // o formato correto do header é 'Client-Token' (com C e T maiúsculos)
  return {
    'Content-Type': 'application/json',
    'Client-Token': clientToken,
  };
}

/**
 * Testa a conexão com uma instância Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API
 * @returns Resultado do teste de conexão
 */
export async function testZapiConnection(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{ success: boolean; message: string; data?: any }> {
  try {
    console.log(`Testando conexão com instância Z-API (${instanceId})...`);
    
    // Simulação de resposta para teste
    if (process.env.NODE_ENV === 'development' || !instanceId || instanceId === 'test') {
      console.log("Usando simulação para teste de conexão");
      return {
        success: true,
        message: "Conexão simulada bem-sucedida (apenas para teste)",
        data: { 
          connected: true, 
          phone: { 
            connected: true,
            phone: "5511999999999" 
          } 
        }
      };
    }
    
    // Chamada real à API Z-API
    const response = await axios.get(
      `${BASE_URL}/instances/${instanceId}/token/${token}/status`,
      { headers: getHeadersWithToken(clientToken) }
    );
    
    console.log("Resposta Z-API (status):", response.data);
    
    return {
      success: true,
      message: "Conexão bem-sucedida",
      data: response.data
    };
  } catch (error) {
    console.error(`Erro ao testar conexão com Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`,
        data: error.response?.data
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }
}

/**
 * Obtém o QR Code para conectar uma instância Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API
 * @returns QR Code como uma string Base64 ou mensagem de erro
 */
export async function getZapiQRCode(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{ success: boolean; qrCode?: string; message?: string; isImage?: boolean }> {
  try {
    console.log(`Obtendo QR Code para instância Z-API (${instanceId})...`);
    
    // Simulação de resposta para teste
    if (process.env.NODE_ENV === 'development' || !instanceId || instanceId === 'test') {
      console.log("Usando simulação para QR Code (apenas para teste)");
      
      // Em ambiente de desenvolvimento, sempre retorna um QR code de imagem real
      // Esta é uma simulação mais realista para testar o componente de QR Code
      const mockBase64QR = "iVBORw0KGgoAAAANSUhEUgAAAIQAAACECAYAAABRRIOnAAAAAklEQVR4AewaftIAAAO1SURBVO3BQY7cWAwEwUyC979y9hjaggYqyA8aHMTM/rDGJcZ4ibFeYqyXGOslxnqJsV5irJcY6yXGernh4CTKT4rckXKHyicpn6ScpPwk5Y4Y6yXGernh4IOUm5Q7Um5SblJOUk5S7lBuUu6IsT5irJtOflnKHSl3KJ+kfJJyh3KTcpJyk/KTYqyXGOvmhj+M8pep/EkxXmKslxv+MSlPRHmJsV5irJtOfpnySSl3pDxRnqScpNwRY32LsW4++SDlJuWOlE9SniiflHJHjJcY6+aGg/9TyknKf1KMlxjr5oaDk5STlG+m3JFyR8pJyh0pJyk3KTcpJylPxHiJsW5uODhJ+STliZSTlCfKE+WTlE9K+WUx1kuMdXPDwUnKTcpJyknKHSl3pNyR8kTKTcpJyknKScpJyk3KTconyicxXmKsmxsOTlJOUu5I+aSUm5Q7Uk5S7lCeSDlJOUm5STkp5STlJOWTYqyXGOvm5oddKTcpJyknKXekPJFyR8odKScpJyknKXco30z5phjrJca6ueHgJOWOlJOUJ8pNyh3KScpJyk3KTcpJyknKEyknKSdRvojxEmPd3HBwkvKTlCdSTlJOUk5SblJuUk5STlJuUp5IuUk5SfnLYryXGOvmhoOTlJOUk5STlJOUO1LuUE5STlJOUk5STlK+mXKT8pdirJcY6+aGg5OUm5STlJOUJ8pJyicpJyknKXek3KGcpJyk3KGcpJyknKR8UoyXGOvmhoOTlJuUO1JOUk5S7ki5STlJeSLlCeWTUk5STlJOUu5IOUk5SflJMdZLjHVzw8FJyk3KHSknKXek3JFyknJHyicpJyknKSdRvojyRJQnMdZLjPVyw8FJyknKJ6WcRHkiyhMpdygnKScpJyknKXeknKTcpHxSjJcY6+aGg5OUm5Q7lJOUO1JOUu5QblJOUm5STlJOUk5STlJ+kvJEyknKScpNMdZLjHVzw8En/aWUJ1JOUJ5QnkB5SflJMb6IsV5irE8yPkj5IspJlCeivMRYJzHWS4z1EmO9xFgvMdZLjPUSY73EWC8x1kuM9RJjvcRYLzHWS4z1EmO9xFgvMdZLjPUSY73EWC8x1ss/RMGmCyGEEmEAAAAASUVORK5CYII=";
      
      // Vamos registrar nos logs o que estamos devolvendo para o frontend
      console.log("======= QR Code Simulação =======");
      console.log("Retornando QR code como imagem base64 para o frontend");
      console.log("Com a flag isImage: true");
      
      return {
        success: true,
        qrCode: mockBase64QR, // Enviamos apenas o base64 sem o prefixo, o frontend irá adicioná-lo
        isImage: true
      };
    }
    
    // Primeiro tenta obter o QR Code como imagem diretamente
    try {
      console.log("Tentando obter QR Code como imagem base64...");
      
      const imageResponse = await axios.get(
        `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code/image`,
        { 
          headers: getHeadersWithToken(clientToken)
        }
      );
      
      // Se a resposta já contém o base64, usamos diretamente
      if (imageResponse.data && typeof imageResponse.data === 'string' && 
          (imageResponse.data.startsWith('data:image') || imageResponse.data.match(/^[A-Za-z0-9+/=]+$/))) {
        
        // Verifica se já tem o prefixo data:image, se não tiver, adiciona
        const qrCodeImage = imageResponse.data.startsWith('data:image') 
          ? imageResponse.data 
          : `data:image/png;base64,${imageResponse.data}`;
        
        return {
          success: true,
          qrCode: qrCodeImage,
          isImage: true
        };
      }
      
      // Se a resposta contém um objeto com a propriedade base64, usa esse valor
      if (imageResponse.data && imageResponse.data.base64) {
        return {
          success: true,
          qrCode: `data:image/png;base64,${imageResponse.data.base64}`,
          isImage: true
        };
      }
    } catch (imageError) {
      console.log("Falha ao obter QR Code como imagem base64, tentando outro método...");
    }
    
    // Se falhar a requisição de imagem, tenta obter como bytes e converter para base64
    try {
      console.log("Tentando obter QR Code como bytes...");
      
      const response = await axios.get(
        `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code`,
        { 
          headers: getHeadersWithToken(clientToken),
          responseType: 'arraybuffer'
        }
      );
      
      // Converte o buffer da imagem para base64
      const base64Image = Buffer.from(response.data).toString('base64');
      return {
        success: true,
        qrCode: `data:image/png;base64,${base64Image}`,
        isImage: true
      };
    } catch (bytesError) {
      console.log("Falha ao obter QR Code como bytes, tentando obter como texto...");
      
      // Como último recurso, tenta obter o texto do QR code
      try {
        const textResponse = await axios.get(
          `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code/text`,
          { 
            headers: getHeadersWithToken(clientToken),
            responseType: 'json'
          }
        );
        
        console.log("Resposta Z-API (QR Code texto):", textResponse.data ? "QR Code obtido com sucesso" : "Sem QR Code");
        
        // A resposta da Z-API contém o QR Code no formato correto na propriedade 'value'
        const qrCodeData = textResponse.data?.value || textResponse.data;
        
        return {
          success: true,
          qrCode: qrCodeData,
          isImage: false
        };
      } catch (textError) {
        throw new Error("Não foi possível obter o QR Code em nenhum formato");
      }
    }
  } catch (error) {
    console.error(`Erro ao obter QR Code Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }
}

/**
 * Obtém informações sobre a instância Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API
 * @returns Informações da instância Z-API
 */
export async function getZapiInstanceInfo(
  instanceId: string,
  token: string,
  clientToken: string
): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    console.log(`Obtendo informações da instância Z-API (${instanceId})...`);
    const response = await axios.get(
      `${BASE_URL}/instances/${instanceId}/token/${token}/me`,
      { headers: getHeadersWithToken(clientToken) }
    );
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error(`Erro ao obter informações da instância Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido"
      };
    }
  }
}

/**
 * Configura um canal Z-API
 * @param channel Canal configurado no sistema
 * @returns Status da configuração com QR Code se necessário
 */
export async function setupZAPIChannel(
  channel: MarketingChannel
): Promise<{ status: string; message?: string; qrCode?: string }> {
  try {
    // Extrai configurações do canal
    if (!channel.configuration) {
      return { 
        status: 'error', 
        message: 'Configuração do canal não encontrada' 
      };
    }
    
    const config = channel.configuration as any;
    const instanceId = config.instanceId;
    const token = config.token;
    const clientToken = config.clientToken;
    
    if (!instanceId || !token || !clientToken) {
      return { 
        status: 'error', 
        message: 'Credenciais Z-API incompletas. Verifique se instanceId, token e clientToken estão configurados.' 
      };
    }
    
    // Verifica o status da instância
    const statusResult = await testZapiConnection(instanceId, token, clientToken);
    
    if (!statusResult.success) {
      return { 
        status: 'error', 
        message: statusResult.message 
      };
    }
    
    // Verifica se a instância está conectada ao WhatsApp
    if (statusResult.data?.connected) {
      return { 
        status: 'connected', 
        message: 'Canal WhatsApp conectado com sucesso' 
      };
    } else {
      // Se não estiver conectada, obtenha o QR Code para conexão
      const qrResult = await getZapiQRCode(instanceId, token, clientToken);
      
      if (!qrResult.success || !qrResult.qrCode) {
        return { 
          status: 'error', 
          message: qrResult.message || 'Não foi possível obter o QR Code' 
        };
      }
      
      return { 
        status: 'need_qrcode',
        message: 'Escaneie o QR Code para conectar o WhatsApp',
        qrCode: qrResult.qrCode
      };
    }
  } catch (error) {
    console.error(`Erro ao configurar canal Z-API:`, error);
    return { 
      status: 'error', 
      message: error instanceof Error ? error.message : 'Erro desconhecido ao configurar canal Z-API' 
    };
  }
}

/**
 * Envia uma mensagem de texto via Z-API
 * @param channel Canal configurado no sistema
 * @param to Número de telefone do destinatário (formato: CCDDNNNNNNNNN, ex: 5511999999999)
 * @param message Texto da mensagem
 * @returns Resultado do envio
 */
export async function sendTextMessage(
  channel: MarketingChannel,
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; message?: string }> {
  try {
    if (!channel.configuration) {
      return { 
        success: false, 
        message: 'Configuração do canal não encontrada' 
      };
    }
    
    const config = channel.configuration as any;
    const instanceId = config.instanceId;
    const token = config.token;
    const clientToken = config.clientToken;
    
    if (!instanceId || !token || !clientToken) {
      return { 
        success: false, 
        message: 'Credenciais Z-API incompletas' 
      };
    }
    
    // Formata o número se necessário (remove caracteres não numéricos)
    const formattedNumber = to.replace(/\D/g, '');
    
    const response = await axios.post(
      `${BASE_URL}/instances/${instanceId}/token/${token}/send-text`,
      {
        phone: formattedNumber,
        message: message
      },
      { headers: getHeadersWithToken(clientToken) }
    );
    
    if (response.data?.zaapId) {
      return {
        success: true,
        messageId: response.data.zaapId,
        message: 'Mensagem enviada com sucesso'
      };
    } else {
      return {
        success: false,
        message: 'Resposta da API não contém o ID da mensagem'
      };
    }
  } catch (error) {
    console.error(`Erro ao enviar mensagem via Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem'
      };
    }
  }
}

/**
 * Envia uma mensagem com botões via Z-API
 * @param channel Canal configurado no sistema
 * @param to Número de telefone do destinatário
 * @param title Título da mensagem
 * @param message Texto da mensagem
 * @param footer Texto do rodapé (opcional)
 * @param buttons Array de botões (texto ou objetos { buttonText, buttonId })
 * @returns Resultado do envio
 */
export async function sendButtonMessage(
  channel: MarketingChannel,
  to: string,
  title: string,
  message: string,
  footer: string,
  buttons: any[]
): Promise<{ success: boolean; messageId?: string; message?: string }> {
  try {
    if (!channel.configuration) {
      return { 
        success: false, 
        message: 'Configuração do canal não encontrada' 
      };
    }
    
    const config = channel.configuration as any;
    const instanceId = config.instanceId;
    const token = config.token;
    const clientToken = config.clientToken;
    
    if (!instanceId || !token || !clientToken) {
      return { 
        success: false, 
        message: 'Credenciais Z-API incompletas' 
      };
    }
    
    // Formata o número se necessário
    const formattedNumber = to.replace(/\D/g, '');
    
    // Formata os botões para o padrão Z-API
    const formattedButtons = formatButtonsForZAPI(buttons);
    
    const response = await axios.post(
      `${BASE_URL}/instances/${instanceId}/token/${token}/send-button-message`,
      {
        phone: formattedNumber,
        title,
        message,
        footer,
        buttons: formattedButtons
      },
      { headers: getHeadersWithToken(clientToken) }
    );
    
    if (response.data?.zaapId) {
      return {
        success: true,
        messageId: response.data.zaapId,
        message: 'Mensagem com botões enviada com sucesso'
      };
    } else {
      return {
        success: false,
        message: 'Resposta da API não contém o ID da mensagem'
      };
    }
  } catch (error) {
    console.error(`Erro ao enviar mensagem com botões via Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao enviar mensagem'
      };
    }
  }
}

/**
 * Configura webhook para receber mensagens e eventos do WhatsApp
 * @param channel Canal configurado no sistema
 * @param webhookUrl URL do webhook que receberá as mensagens e eventos
 * @returns Resultado da configuração
 */
export async function setupZAPIWebhook(
  channel: MarketingChannel,
  webhookUrl: string
): Promise<{ success: boolean; message: string }> {
  try {
    if (!channel.configuration) {
      return { 
        success: false, 
        message: 'Configuração do canal não encontrada' 
      };
    }
    
    const config = channel.configuration as any;
    const instanceId = config.instanceId;
    const token = config.token;
    const clientToken = config.clientToken;
    
    if (!instanceId || !token || !clientToken) {
      return { 
        success: false, 
        message: 'Credenciais Z-API incompletas' 
      };
    }
    
    // Configura o webhook para todos os eventos (mensagens, status, etc.)
    const response = await axios.post(
      `${BASE_URL}/instances/${instanceId}/token/${token}/webhook`,
      {
        url: webhookUrl,
        // Opcionalmente: eventos específicos
        // events: ["message", "received", "status"] 
      },
      { headers: getHeadersWithToken(clientToken) }
    );
    
    if (response.data?.value === webhookUrl) {
      return {
        success: true,
        message: 'Webhook configurado com sucesso'
      };
    } else {
      return {
        success: false,
        message: 'Falha ao configurar webhook'
      };
    }
  } catch (error) {
    console.error(`Erro ao configurar webhook Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao configurar webhook'
      };
    }
  }
}

/**
 * Recupera a lista de contatos do WhatsApp
 * @param channel Canal configurado no sistema
 * @returns Lista de contatos do WhatsApp
 */
export async function getZAPIContacts(
  channel: MarketingChannel
): Promise<{ success: boolean; contacts?: any[]; message?: string }> {
  try {
    if (!channel.configuration) {
      return { 
        success: false, 
        message: 'Configuração do canal não encontrada' 
      };
    }
    
    const config = channel.configuration as any;
    const instanceId = config.instanceId;
    const token = config.token;
    const clientToken = config.clientToken;
    
    if (!instanceId || !token || !clientToken) {
      return { 
        success: false, 
        message: 'Credenciais Z-API incompletas' 
      };
    }
    
    const response = await axios.get(
      `${BASE_URL}/instances/${instanceId}/token/${token}/contacts`,
      { headers: getHeadersWithToken(clientToken) }
    );
    
    if (Array.isArray(response.data)) {
      return {
        success: true,
        contacts: response.data
      };
    } else {
      return {
        success: false,
        message: 'Formato de resposta inválido'
      };
    }
  } catch (error) {
    console.error(`Erro ao obter contatos Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido ao obter contatos'
      };
    }
  }
}