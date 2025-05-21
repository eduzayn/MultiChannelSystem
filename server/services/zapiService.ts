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
): Promise<{ success: boolean; qrCode?: string; message?: string }> {
  try {
    console.log(`Obtendo QR Code para instância Z-API (${instanceId})...`);
    
    // Simulação de resposta para teste
    if (process.env.NODE_ENV === 'development' || !instanceId || instanceId === 'test') {
      console.log("Usando simulação para QR Code (apenas para teste)");
      
      // QR Code simulado (base64) para testes
      const mockQRCode = "data:image/png;base64,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";
      
      return {
        success: true,
        qrCode: mockQRCode
      };
    }
    
    // Chamada real à API Z-API
    // Conforme documentação da Z-API: https://developer.z-api.io/instance/qrcode
    const response = await axios.get(
      `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code`,
      { 
        headers: getHeadersWithToken(clientToken),
        responseType: 'json'
      }
    );
    
    console.log("Resposta Z-API (QR Code):", response.data ? "QR Code obtido com sucesso" : "Sem QR Code");
    
    // A resposta da Z-API contém o QR Code no formato correto na propriedade 'value'
    // Formato esperado: { value: "data:image/png;base64,..." }
    const qrCodeData = response.data?.value || response.data;
    
    return {
      success: true,
      qrCode: qrCodeData
    };
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