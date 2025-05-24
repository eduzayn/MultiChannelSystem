import axios from 'axios';

/**
 * Configura o webhook da Z-API para receber notificações
 * @param instanceId ID da instância da Z-API
 * @param token Token da instância
 * @param webhookUrl URL do webhook para receber notificações
 * @param clientToken Token de segurança da conta Z-API (opcional)
 * @returns Status da configuração
 */
export async function configureZapiWebhook(
  instanceId: string,
  token: string,
  webhookUrl: string,
  clientToken?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    if (!instanceId || !token || !webhookUrl) {
      return {
        success: false,
        message: "Parâmetros incompletos para configuração do webhook"
      };
    }
    
    console.log(`Configurando webhook Z-API para instância ${instanceId}`);
    console.log(`URL do webhook: ${webhookUrl}`);
    
    // Preparar headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    // URL para configurar o webhook
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/webhook`;
    
    // Payload com a URL do webhook e eventos que desejamos receber
    const payload = {
      url: webhookUrl,
      events: {
        // Eventos relacionados a mensagens
        received: true,         // Mensagens recebidas
        receivedFromMe: true,   // Mensagens enviadas por você
        sent: true,             // Mensagens enviadas
        delivery: true,         // Confirmação de entrega
        read: true,             // Confirmação de leitura
        
        // Eventos de status
        connectionStatus: true, // Status da conexão
        messageStatus: true,    // Status da mensagem
        typing: true,           // Digitando
        statusFromMe: true,     // Status enviados por você
        status: true,           // Status dos contatos
        
        // Eventos de grupos
        group: false,           // Eventos de grupo (desativado por padrão)
        groupInvite: false      // Convites de grupo (desativado por padrão)
      }
    };
    
    // Configurar o webhook na Z-API
    const response = await axios.post(url, payload, { headers });
    
    if (response.status === 200 || response.status === 201) {
      console.log(`Webhook configurado com sucesso: ${webhookUrl}`);
      return {
        success: true,
        message: "Webhook configurado com sucesso"
      };
    } else {
      console.error(`Erro ao configurar webhook: ${response.status}`);
      return {
        success: false,
        message: `Erro ${response.status} ao configurar webhook`
      };
    }
  } catch (error) {
    console.error(`Erro ao configurar webhook:`, error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status || ''}: ${error.response?.data?.error || error.message}`
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}

/**
 * Obter URL do webhook atual configurado na Z-API
 * @param instanceId ID da instância da Z-API
 * @param token Token da instância
 * @param clientToken Token de segurança da conta Z-API (opcional)
 * @returns URL do webhook configurado ou mensagem de erro
 */
export async function getZapiWebhook(
  instanceId: string,
  token: string,
  clientToken?: string
): Promise<{
  success: boolean;
  webhookUrl?: string;
  message?: string;
}> {
  try {
    if (!instanceId || !token) {
      return {
        success: false,
        message: "Parâmetros incompletos para obtenção do webhook"
      };
    }
    
    console.log(`Obtendo webhook configurado para instância Z-API ${instanceId}`);
    
    // Preparar headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    // URL para obter a configuração do webhook
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/webhook`;
    
    // Obter a configuração atual do webhook
    const response = await axios.get(url, { headers });
    
    if (response.status === 200) {
      const webhookUrl = response.data?.webhook || response.data?.url;
      
      if (webhookUrl) {
        console.log(`Webhook atual: ${webhookUrl}`);
        return {
          success: true,
          webhookUrl
        };
      } else {
        return {
          success: false,
          message: "Webhook não configurado"
        };
      }
    } else {
      console.error(`Erro ao obter webhook: ${response.status}`);
      return {
        success: false,
        message: `Erro ${response.status} ao obter webhook`
      };
    }
  } catch (error) {
    console.error(`Erro ao obter webhook:`, error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status || ''}: ${error.response?.data?.error || error.message}`
      };
    }
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Erro desconhecido"
    };
  }
}