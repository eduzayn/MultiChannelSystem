import axios from "axios";

/**
 * Obtém a lista de contatos da Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @returns Lista de contatos do WhatsApp
 */
export async function getZapiContacts(
  instanceId: string,
  token: string,
  clientToken?: string
): Promise<{
  success: boolean;
  contacts?: any[];
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      return {
        success: false,
        message: "Instance ID e Token são obrigatórios para buscar contatos"
      };
    }

    // Limpar os parâmetros
    const cleanInstanceId = instanceId.trim();
    const cleanToken = token.trim();
    
    console.log(`Obtendo contatos da instância Z-API (${cleanInstanceId})...`);
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (clientToken?.trim()) {
      headers["Client-Token"] = clientToken.trim();
    }
    
    // Array para armazenar todos os contatos
    let allContacts: any[] = [];
    let page = 1;
    const pageSize = 100; // Valor máximo geralmente aceito pela Z-API
    let hasMore = true;
    
    // Consultar páginas enquanto houver mais contatos
    while (hasMore) {
      const url = `https://api.z-api.io/instances/${cleanInstanceId}/token/${cleanToken}/contacts?page=${page}&pageSize=${pageSize}`;
      console.log(`Buscando página ${page} de contatos...`);
      
      const response = await axios.get(url, {
        headers,
        validateStatus: function (status) {
          // Aceitar qualquer status para tratar erros adequadamente
          return true;
        }
      });
    
      console.log(`Resposta da Z-API contatos página ${page} (Status ${response.status})`);
      
      if (response.status !== 200) {
        console.error(`Erro na resposta da Z-API: ${response.status}`);
        
        let errorMessage = "Erro ao obter contatos";
        if (response.data?.error || response.data?.message) {
          errorMessage = response.data.error || response.data.message;
        }
        
        // Se for erro na primeira página, retorna erro
        if (page === 1) {
          return {
            success: false,
            message: errorMessage,
          };
        } else {
          // Se já tivermos contatos de páginas anteriores, interrompe a paginação
          console.warn(`Erro ao buscar página ${page}: ${errorMessage}. Usando contatos já obtidos.`);
          hasMore = false;
          break;
        }
      }
      
      // Extrair contatos da resposta - Z-API pode retornar diferentes formatos
      // Algumas vezes é um array direto, outras vezes está dentro de um objeto
      const pageContacts = Array.isArray(response.data) ? response.data : 
                        response.data?.contacts || response.data?.response || 
                        (response.data?.chats ? response.data.chats.filter((c: any) => !c.isGroup) : []);
      
      console.log(`Obtidos ${pageContacts.length} contatos na página ${page}`);
      
      // Adicionar ao array total
      allContacts = [...allContacts, ...pageContacts];
      
      // Verificar se há mais páginas
      if (pageContacts.length < pageSize) {
        hasMore = false; // Última página
        console.log(`Final da paginação atingido na página ${page}`);
      } else {
        page++; // Avançar para próxima página
      }
    }
    
    console.log(`Total de contatos obtidos: ${allContacts.length}`);
    
    return {
      success: true,
      contacts: allContacts
    };
  } catch (error) {
    console.error(`Erro ao obter contatos Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status || ''}: ${error.response?.data?.error || error.message}`,
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}

/**
 * Obtém os metadados de um contato específico
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param phone Número do telefone no formato internacional (ex: 5537998694620)
 * @param clientToken Token de segurança da conta Z-API (opcional)
 * @returns Metadados do contato 
 */
export async function getZapiContactInfo(
  instanceId: string,
  token: string,
  phone: string,
  clientToken?: string
): Promise<{
  success: boolean;
  contact?: any;
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token || !phone) {
      return {
        success: false,
        message: "Instance ID, Token e Phone são obrigatórios para buscar informações do contato"
      };
    }
    
    // Limpar os parâmetros
    const cleanInstanceId = instanceId.trim();
    const cleanToken = token.trim();
    const cleanPhone = phone.trim();
    
    console.log(`Obtendo metadados do contato ${cleanPhone} da instância Z-API (${cleanInstanceId})...`);
    
    const url = `https://api.z-api.io/instances/${cleanInstanceId}/token/${cleanToken}/phone/${cleanPhone}`;
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (clientToken?.trim()) {
      headers["Client-Token"] = clientToken.trim();
    }
    
    const response = await axios.get(url, {
      headers,
      validateStatus: function (status) {
        // Aceitar qualquer status para tratar erros adequadamente
        return true;
      }
    });
    
    console.log(`Resposta da Z-API metadados de contato (Status ${response.status})`);
    
    if (response.status !== 200) {
      console.error(`Erro na resposta da Z-API: ${response.status}`);
      
      let errorMessage = "Erro ao obter metadados do contato";
      if (response.data?.error || response.data?.message) {
        errorMessage = response.data.error || response.data.message;
      }
      
      return {
        success: false,
        message: errorMessage,
      };
    }
    
    // Se a resposta for bem-sucedida, retornamos os metadados do contato
    return {
      success: true,
      contact: response.data
    };
  } catch (error) {
    console.error(`Erro ao obter metadados do contato Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status || ''}: ${error.response?.data?.error || error.message}`,
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}

/**
 * Obtém o QR Code da Z-API para conexão do WhatsApp
 * @param instanceId ID da instância da Z-API
 * @param token Token da instância da Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @returns Objeto com o status da operação e o QR Code obtido (ou mensagem de erro)
 */
export async function getZapiQRCode(
  instanceId: string,
  token: string,
  clientToken?: string,
): Promise<{
  success: boolean;
  qrCode?: string;
  message?: string;
  isImage?: boolean;
  isConnected?: boolean;
  details?: any; // Adicionado campo details para informações extras
  connected?: boolean; // Campo para compatibilidade com respostas anteriores
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      return {
        success: false,
        message: "Instance ID e Token são obrigatórios para gerar QR code"
      };
    }

    // Limpar os parâmetros
    const cleanInstanceId = instanceId.trim();
    const cleanToken = token.trim();
    
    console.log(`Obtendo QR Code para instância Z-API (${cleanInstanceId})...`);
    
    // Obter o QR code diretamente como bytes (via imagem)
    try {
      // Usando o endpoint QR code/image para obter os bytes da imagem
      const imageUrl = `https://api.z-api.io/instances/${cleanInstanceId}/token/${cleanToken}/qr-code/image`;
      
      console.log(`Chamando API Z-API para obter QR code como bytes: ${imageUrl}`);
      
      // Preparando headers com ou sem Client-Token (opcional)
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      
      if (clientToken?.trim()) {
        headers["Client-Token"] = clientToken.trim();
      }
      
      const imageResponse = await axios.get(imageUrl, {
        headers,
        responseType: 'arraybuffer', // Crucial para receber como bytes
        validateStatus: function (status) {
          // Aceitar qualquer status para poder tratar o erro adequadamente
          return true;
        }
      });
      
      console.log(`Resposta da Z-API QR code (Status ${imageResponse.status})`);
      
      // Se houver um erro na resposta, vamos passar o erro para o frontend
      if (imageResponse.status !== 200) {
        console.error(`Erro na resposta da Z-API: ${imageResponse.status}`);
        
        // Tenta obter a mensagem de erro
        let errorMessage = "Erro ao obter QR code";
        try {
          const errorText = Buffer.from(imageResponse.data).toString('utf8');
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || "Erro desconhecido na API Z-API";
          console.log("Mensagem de erro:", errorMessage);
        } catch (e) {
          console.error("Erro ao processar mensagem de erro:", e);
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }
      
      if (imageResponse.status === 200) {
        try {
          // Verificar se a resposta é um JSON (pode ser uma mensagem de erro ou status)
          try {
            const responseText = Buffer.from(imageResponse.data).toString('utf8');
            const jsonData = JSON.parse(responseText);
            
            // Se é um objeto JSON, pode ser um status/erro
            if (jsonData && jsonData.connected === true) {
              return {
                success: false,
                message: "WhatsApp já está conectado. Não é necessário QR code."
              };
            }
            
            if (jsonData && jsonData.error) {
              return {
                success: false,
                message: jsonData.error || "Erro desconhecido na API Z-API"
              };
            }
          } catch (e) {
            // Não é JSON, provavelmente são bytes da imagem - isso é bom!
          }
          
          // Se chegou aqui, é uma imagem válida
          // Convertemos os bytes para base64 COM prefixo data:image/png;base64,
          const base64Data = Buffer.from(imageResponse.data).toString('base64');
          const base64Image = `data:image/png;base64,${base64Data}`;
          
          console.log("QR code obtido com sucesso (bytes convertidos para base64 com prefixo)");
          
          // Verificar se o QR code pode estar sendo retornado encapsulado (erro comum da Z-API)
          try {
            // Verificar se os primeiros bytes parecem ser JSON
            const firstChars = base64Data.substring(0, 20).toLowerCase();
            if (firstChars.includes('eyj') || firstChars.includes('{"v')) {
              // Pode ser JSON encapsulado, tenta decodificar
              const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
              if (decodedData.startsWith('{') && decodedData.includes('value')) {
                // É um JSON com campo value
                const jsonData = JSON.parse(decodedData);
                if (jsonData.value && typeof jsonData.value === 'string' && 
                    (jsonData.value.startsWith('data:image') || jsonData.value.startsWith('http'))) {
                  console.log("QR code encapsulado detectado, extraindo valor real");
                  return {
                    success: true,
                    qrCode: jsonData.value,
                    isImage: true,
                    connected: false,
                    isConnected: false
                  };
                }
              }
            }
          } catch (e) {
            // Se falhar a tentativa de desencapsular, continuamos com a abordagem original
            console.log("Tentativa de desencapsular QR code falhou:", e);
          }
          
          return {
            success: true,
            qrCode: base64Image,
            isImage: true // É uma imagem em base64 com prefixo completo
          };
        } catch (processingError) {
          console.error("Erro ao processar resposta do QR code:", processingError);
          return {
            success: false,
            message: "Erro ao processar imagem do QR Code"
          };
        }
      }
    } catch (imageError) {
      console.log("Não foi possível obter o QR code como imagem, tentando obter como texto...");
      console.error("Erro ao obter QR code como imagem:", imageError);
      
      // Se falhar, tentamos obter os bytes do QR code
      try {
        const bytesUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code`;
        
        // Preparando headers com ou sem Client-Token (opcional)
        const headers: Record<string, string> = {};
        if (clientToken) {
          headers["Client-Token"] = clientToken;
        }
        
        const textResponse = await axios.get(bytesUrl, {
          headers
        });
        
        console.log(
          "Resposta Z-API (QR Code texto):",
          textResponse.data ? "QR Code obtido com sucesso" : "Sem QR Code"
        );
        
        // A resposta da Z-API contém o QR Code no formato correto na propriedade 'value'
        const qrCodeData = textResponse.data?.value || textResponse.data;
        
        return {
          success: true,
          qrCode: qrCodeData,
          isImage: false,
        };
      } catch (textError) {
        console.error("Erro ao obter QR code como texto:", textError);
        throw new Error("Não foi possível obter o QR Code em nenhum formato");
      }
    }
    
    throw new Error("Não foi possível obter o QR Code");
  } catch (error) {
    console.error(`Erro ao obter QR Code Z-API:`, error);
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status || ''}: ${error.response?.data?.error || error.message}`,
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}

/**
 * Testa a conexão com a instância Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @returns Objeto com o status da conexão e mensagem
 */
export async function testZapiConnection(
  instanceId: string,
  token: string,
  clientToken?: string,
): Promise<{
  success: boolean;
  message: string;
  status?: string;
  details?: any;
}> {
  try {
    // Validação e limpeza dos parâmetros
    if (!instanceId || !token) {
      return {
        success: false,
        message: "Instance ID e Token são obrigatórios"
      };
    }
    
    // Limpar os parâmetros - remover espaços e caracteres indesejados
    const cleanInstanceId = instanceId.trim();
    const cleanToken = token.trim();
    const cleanClientToken = clientToken?.trim();
    
    console.log(`Testando conexão com instância Z-API (${cleanInstanceId})...`);
    console.log(`Usando token: ${cleanToken}`);
    if (cleanClientToken) console.log(`Usando client-token: ${cleanClientToken}`);
    
    // Verifica o status da conexão via endpoint de status da Z-API
    const statusUrl = `https://api.z-api.io/instances/${cleanInstanceId}/token/${cleanToken}/status`;
    
    console.log(`Fazendo requisição para: ${statusUrl}`);
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (cleanClientToken) {
      headers["Client-Token"] = cleanClientToken;
    }
    
    const response = await axios.get(statusUrl, {
      headers,
      validateStatus: function (status) {
        // Aceitar qualquer status para poder tratar o erro adequadamente
        return true;
      }
    });
    
    console.log(`Resposta da Z-API (Status ${response.status}):`, JSON.stringify(response.data));
    
    // Se houver um erro na resposta (não 200), tratamos aqui
    if (response.status !== 200) {
      let errorMessage = `Erro ${response.status}`;
      
      if (response.data && typeof response.data === 'object') {
        errorMessage += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
      }
      
      return {
        success: false,
        message: errorMessage,
        status: "error",
        details: response.data
      };
    }
    
    // A Z-API retorna o status da conexão
    const connectionStatus = response.data?.connected;
    const statusMessage = response.data?.message || response.data?.status;
    
    if (connectionStatus === true) {
      return {
        success: true,
        message: "Conexão estabelecida com sucesso. WhatsApp conectado.",
        status: "connected",
        details: response.data
      };
    } else if (connectionStatus === false) {
      // Mensagem "You are not connected" é normal quando o WhatsApp não está conectado
      // mas as credenciais estão corretas - isso não é realmente um erro
      if (response.data?.error === "You are not connected." || 
          response.data?.message === "You are not connected.") {
        return {
          success: true,
          message: "Credenciais corretas! O WhatsApp não está conectado. Gere um QR code para conectar.",
          status: "disconnected",
          details: response.data
        };
      }
      
      return {
        success: false,
        message: `WhatsApp não conectado. Status: ${statusMessage || "Desconectado"}`,
        status: "disconnected",
        details: response.data
      };
    } else {
      return {
        success: false,
        message: `Status indeterminado: ${statusMessage || "Desconhecido"}`,
        status: "unknown",
        details: response.data
      };
    }
    
  } catch (error) {
    console.error(`Erro ao testar conexão Z-API:`, error);
    
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`,
        status: "error",
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
        status: "error",
      };
    }
  }
}

/**
 * Encaminha uma mensagem para outro contato via Z-API
 */
export async function forwardMessage(
  instanceId: string,
  token: string,
  phone: string,
  messageId: string,
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/forward-message`;
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      url,
      {
        phone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        messageId // ID da mensagem original a ser encaminhada
      },
      {
        headers
      }
    );
    
    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id
    };
  } catch (error) {
    console.error(`Erro ao encaminhar mensagem via Z-API:`, error);
    
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
 * Envia uma mensagem de texto via Z-API
 */
export async function sendTextMessage(
  instanceId: string,
  token: string,
  phone: string,
  message: string,
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      return {
        success: false,
        message: "Credenciais da Z-API (instanceId e token) são obrigatórias"
      };
    }

    if (!phone) {
      return {
        success: false,
        message: "Número de telefone é obrigatório para enviar mensagem"
      };
    }

    if (!message || message.trim() === '') {
      return {
        success: false,
        message: "Conteúdo da mensagem não pode estar vazio"
      };
    }
    
    // Logs para debug
    console.log(`Preparando envio de mensagem para ${phone}`);
    console.log(`Usando instanceId: ${instanceId}`);
    
    // Limpar o número de telefone removendo caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // URL para envio de mensagens de texto - garantindo o formato correto
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
    console.log(`URL da API Z-API: ${url}`);
    
    // Preparando headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    // Adicionar Client-Token se fornecido
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    console.log(`Enviando mensagem para ${cleanPhone} via Z-API: "${message.substring(0, 20)}${message.length > 20 ? '...' : ''}"`);
    
    try {
      // Verificar se as credenciais foram fornecidas
      if (!instanceId || !token) {
        console.log("⚠️ ATENÇÃO: Credenciais da Z-API ausentes ou inválidas!");
        console.log("Para enviar mensagens, configure credenciais válidas no canal de WhatsApp.");
        
        // Retornar erro informativo
        return {
          success: false,
          message: "Credenciais da Z-API não configuradas corretamente."
        };
      }
      
      // Para diagnóstico, vamos mostrar as credenciais exatas que estamos usando
      console.log(`Enviando com credenciais:`);
      console.log(`instanceId: [${instanceId}]`);
      console.log(`token: [${token}]`);
      console.log(`phone: [${cleanPhone}]`);
      
      // Realizando a requisição para a API Z-API com timeout de 15 segundos
      const response = await axios.post(
        url,
        {
          phone: cleanPhone,  // Número no formato DDD+número, por exemplo: 11999999999
          message: message    // Conteúdo da mensagem
        },
        { 
          headers,
          timeout: 15000, // 15 segundos de timeout
          validateStatus: (status) => true // Aceita qualquer status para tratamento manual
        }
      );
      
      // Verificar se a resposta é HTML (indicando erro de autenticação ou redirecionamento)
      const contentType = response.headers['content-type'] || '';
      if (contentType.includes('text/html') || 
          (typeof response.data === 'string' && response.data.includes('<!DOCTYPE'))) {
        console.error('Z-API retornou HTML em vez de JSON - provável erro de autenticação');
        return {
          success: false,
          message: 'Erro de autenticação com a Z-API. Verifique o instanceId e token.'
        };
      }
      
      // Verificar códigos de status
      if (response.status !== 200 && response.status !== 201) {
        console.error(`Z-API retornou status ${response.status}`);
        let errorMsg = 'Erro ao enviar mensagem';
        
        if (response.data && typeof response.data === 'object') {
          errorMsg += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
        }
        
        return {
          success: false,
          message: errorMsg
        };
      }
      
      console.log(`Resposta da Z-API:`, response.data);
      
      if (response.data && (response.data.zaapId || response.data.id || response.data.messageId)) {
        return {
          success: true,
          messageId: response.data.zaapId || response.data.id || response.data.messageId,
          message: "Mensagem enviada com sucesso"
        };
      } else {
        // Tratamento para resposta sem identificador de mensagem
        console.warn(`Resposta da Z-API não contém ID de mensagem esperado:`, response.data);
        
        // Se for um objeto, podemos estar recebendo alguma confirmação
        if (response.data && typeof response.data === 'object') {
          return {
            success: true,
            messageId: `api_${Date.now()}`,
            message: "Mensagem processada pela API, mas sem ID"
          };
        } else {
          return {
            success: false,
            message: "Resposta da Z-API não está no formato esperado"
          };
        }
      }
    } catch (axiosError) {
      if (axios.isAxiosError(axiosError)) {
        console.error(`Erro na requisição para Z-API:`, axiosError.message);
        
        // Erros específicos de rede/timeout
        if (axiosError.code === 'ECONNABORTED') {
          return {
            success: false,
            message: 'Tempo limite excedido ao tentar conectar com a Z-API'
          };
        }
        
        if (axiosError.code === 'ECONNREFUSED') {
          return {
            success: false,
            message: 'Conexão recusada pela Z-API. Verifique se o serviço está disponível.'
          };
        }
        
        // Verificar se obtivemos uma resposta HTML
        if (axiosError.response?.headers['content-type']?.includes('text/html') ||
            (typeof axiosError.response?.data === 'string' && 
             axiosError.response.data.includes('<!DOCTYPE'))) {
          return {
            success: false,
            message: 'Provável erro de autenticação. Verifique as credenciais Z-API (instanceId e token).'
          };
        }
        
        // Tentar extrair mensagem de erro mais detalhada
        let errorDetail = '';
        if (axiosError.response?.data) {
          if (typeof axiosError.response.data === 'object') {
            errorDetail = axiosError.response.data.error || 
                         axiosError.response.data.message || 
                         JSON.stringify(axiosError.response.data);
          } else if (typeof axiosError.response.data === 'string') {
            // Tentar extrair mensagem de erro de strings HTML ou JSON mal formatado
            const errorMatch = axiosError.response.data.match(/"error":"([^"]+)"/);
            if (errorMatch && errorMatch[1]) {
              errorDetail = errorMatch[1];
            } else {
              errorDetail = axiosError.response.data.substring(0, 100) + '...';
            }
          }
        }
        
        return {
          success: false,
          message: `Erro ao enviar mensagem: ${errorDetail || axiosError.message}`
        };
      }
      
      // Repassar o erro para o tratamento genérico
      throw axiosError;
    }
  } catch (error) {
    console.error(`Erro ao enviar mensagem via Z-API:`, error);
    
    return {
      success: false,
      message: error instanceof Error 
        ? `Erro ao enviar mensagem: ${error.message}` 
        : "Erro desconhecido ao enviar mensagem"
    };
  }
}

/**
 * Envia uma reação a uma mensagem via Z-API
 */
export async function sendReaction(
  instanceId: string,
  token: string,
  phone: string,
  messageId: string,
  reaction: string,
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      console.error('[Z-API ERROR] Credenciais inválidas');
      return {
        success: false,
        message: "Credenciais da Z-API (instanceId e token) são obrigatórias"
      };
    }

    if (!phone) {
      console.error('[Z-API ERROR] Número de telefone não fornecido');
      return {
        success: false,
        message: "Número de telefone é obrigatório para enviar reação"
      };
    }

    if (!messageId) {
      console.error('[Z-API ERROR] ID da mensagem não fornecido');
      return {
        success: false,
        message: "ID da mensagem é obrigatório para enviar reação"
      };
    }

    if (!reaction) {
      console.error('[Z-API ERROR] Reação não fornecida');
      return {
        success: false,
        message: "Emoji de reação é obrigatório"
      };
    }

    // Limpar o número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/messages/reaction`;
    
    console.log(`[Z-API DEBUG] Enviando reação para ${cleanPhone}`);
    console.log(`[Z-API DEBUG] ID da mensagem: ${messageId}`);
    console.log(`[Z-API DEBUG] Reação: ${reaction}`);
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      url,
      {
        phone: cleanPhone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        messageId, // ID da mensagem a receber a reação
        reaction // Emoji da reação, ex: "❤️", "👍", "😂", etc.
      },
      {
        headers,
        timeout: 15000, // 15s timeout
        validateStatus: (status) => true // Permite tratar todos os status
      }
    );
    
    if (response.status !== 200 && response.status !== 201) {
      console.error(`[Z-API ERROR] Status ${response.status}`);
      let errorMsg = 'Erro ao enviar reação';
      
      if (response.data && typeof response.data === 'object') {
        errorMsg += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
      }
      
      return {
        success: false,
        message: errorMsg
      };
    }
    
    console.log(`[Z-API SUCCESS] Reação enviada:`, response.data);
    
    return {
      success: true,
      messageId: response.data?.zaapId || response.data?.id || response.data?.messageId,
      message: "Reação enviada com sucesso"
    };
  } catch (error) {
    console.error(`[Z-API ERROR] Erro ao enviar reação:`, error);
    
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
 * Remove uma reação de uma mensagem via Z-API
 */
export async function removeReaction(
  instanceId: string,
  token: string,
  phone: string,
  messageId: string,
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      console.error('[Z-API ERROR] Credenciais inválidas');
      return {
        success: false,
        message: "Credenciais da Z-API (instanceId e token) são obrigatórias"
      };
    }

    if (!phone) {
      console.error('[Z-API ERROR] Número de telefone não fornecido');
      return {
        success: false,
        message: "Número de telefone é obrigatório para remover reação"
      };
    }

    if (!messageId) {
      console.error('[Z-API ERROR] ID da mensagem não fornecido');
      return {
        success: false,
        message: "ID da mensagem é obrigatório para remover reação"
      };
    }

    // Limpar o número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/messages/reaction/remove`;
    
    console.log(`[Z-API DEBUG] Removendo reação para ${cleanPhone}`);
    console.log(`[Z-API DEBUG] ID da mensagem: ${messageId}`);
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      url,
      {
        phone: cleanPhone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        messageId // ID da mensagem para remover a reação
      },
      {
        headers,
        timeout: 15000, // 15s timeout
        validateStatus: (status) => true // Permite tratar todos os status
      }
    );
    
    if (response.status !== 200 && response.status !== 201) {
      console.error(`[Z-API ERROR] Status ${response.status}`);
      let errorMsg = 'Erro ao remover reação';
      
      if (response.data && typeof response.data === 'object') {
        errorMsg += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
      }
      
      return {
        success: false,
        message: errorMsg
      };
    }
    
    console.log(`[Z-API SUCCESS] Reação removida:`, response.data);
    
    return {
      success: true,
      messageId: response.data?.zaapId || response.data?.id || response.data?.messageId,
      message: "Reação removida com sucesso"
    };
  } catch (error) {
    console.error(`[Z-API ERROR] Erro ao remover reação:`, error);
    
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
 * Envia um áudio via Z-API
 */
export async function sendAudio(
  instanceId: string,
  token: string,
  phone: string,
  audioUrl: string,
  isVoiceMessage: boolean = true,
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      console.error('[Z-API ERROR] Credenciais inválidas');
      return {
        success: false,
        message: "Credenciais da Z-API (instanceId e token) são obrigatórias"
      };
    }

    if (!phone) {
      console.error('[Z-API ERROR] Número de telefone não fornecido');
      return {
        success: false,
        message: "Número de telefone é obrigatório para enviar áudio"
      };
    }

    if (!audioUrl) {
      console.error('[Z-API ERROR] URL do áudio não fornecida');
      return {
        success: false,
        message: "URL do áudio é obrigatória"
      };
    }
    
    // Validar formato da URL
    if (typeof audioUrl === 'string' && !audioUrl.startsWith('http') && !audioUrl.startsWith('data:')) {
      console.error('[Z-API ERROR] Formato de URL inválido:', audioUrl.substring(0, 30));
      return {
        success: false,
        message: "Formato de URL inválido. A URL deve começar com http:// ou https://"
      };
    }

    // Limpar o número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-audio`;
    
    console.log(`[Z-API DEBUG] Enviando áudio para ${cleanPhone}`);
    console.log(`[Z-API DEBUG] URL do áudio (primeiros 50 chars): ${audioUrl.substring(0, 50)}...`);
    console.log(`[Z-API DEBUG] Tipo: ${isVoiceMessage ? 'Mensagem de voz (PTT)' : 'Áudio normal'}`);
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      url,
      {
        phone: cleanPhone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        audio: audioUrl, // URL do áudio a ser enviado
        isVoice: isVoiceMessage // Se true, envia como mensagem de voz (PTT), se false, envia como áudio normal
      },
      {
        headers,
        timeout: 30000, // Aumentado para 30s
        validateStatus: (status) => true // Permite tratar todos os status
      }
    );
    
    if (response.status !== 200 && response.status !== 201) {
      console.error(`[Z-API ERROR] Status ${response.status}`);
      let errorMsg = 'Erro ao enviar áudio';
      
      if (response.data && typeof response.data === 'object') {
        errorMsg += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
      }
      
      return {
        success: false,
        message: errorMsg
      };
    }
    
    console.log(`[Z-API SUCCESS] Áudio enviado:`, response.data);
    
    return {
      success: true,
      messageId: response.data?.zaapId || response.data?.id || response.data?.messageId,
      message: "Áudio enviado com sucesso"
    };
  } catch (error) {
    console.error(`[Z-API ERROR] Erro ao enviar áudio:`, error);
    
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
 * Envia uma imagem via Z-API
 */
export async function sendImage(
  instanceId: string,
  token: string,
  phone: string,
  imageUrl: string,
  caption: string = "",
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    // Validar parâmetros
    if (!instanceId || !token) {
      console.error('[Z-API ERROR] Credenciais inválidas');
      return {
        success: false,
        message: "Credenciais da Z-API (instanceId e token) são obrigatórias"
      };
    }

    if (!phone) {
      console.error('[Z-API ERROR] Número de telefone não fornecido');
      return {
        success: false,
        message: "Número de telefone é obrigatório para enviar imagem"
      };
    }

    if (!imageUrl) {
      console.error('[Z-API ERROR] URL da imagem não fornecida');
      return {
        success: false,
        message: "URL da imagem é obrigatória"
      };
    }
    
    // Validação de segurança: verificar se a URL da imagem é do picsum.photos
    if (typeof imageUrl === 'string' && imageUrl.includes('picsum.photos')) {
      console.error('🚨 ALERTA DE SEGURANÇA: Tentativa de envio de URL de imagem aleatória bloqueada em zapiService');
      return {
        success: false,
        message: "URL de imagem não permitida por motivos de segurança (picsum.photos detectado)"
      };
    }

    // Limpar o número de telefone
    const cleanPhone = phone.replace(/\D/g, '');
    
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-image`;
    
    console.log(`[Z-API DEBUG] Enviando imagem para ${cleanPhone}`);
    console.log(`[Z-API DEBUG] URL da imagem (primeiros 50 chars): ${imageUrl.substring(0, 50)}...`);
    
    // Preparando headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }

    // Verificar se é base64 ou URL
    const isBase64 = imageUrl.startsWith('data:');
    const payload: Record<string, any> = {
      phone: cleanPhone,
      caption: caption || ''
    };

    if (isBase64) {
      console.log(`[Z-API DEBUG] Enviando imagem como Base64`);
      // Garantir que o Base64 tenha o prefixo correto
      payload.image = imageUrl.startsWith('data:image/') 
        ? imageUrl 
        : `data:image/jpeg;base64,${imageUrl}`;
    } else {
      console.log(`[Z-API DEBUG] Enviando imagem como URL: ${imageUrl}`);
      
      // Validar formato da URL
      if (!imageUrl.startsWith('http')) {
        console.error('[Z-API ERROR] Formato de URL inválido:', imageUrl.substring(0, 30));
        return {
          success: false,
          message: "Formato de URL inválido. A URL deve começar com http:// ou https://"
        };
      }
      
      payload.image = imageUrl;
    }

    // Log do payload (sem expor a imagem completa)
    console.log(`[Z-API DEBUG] Payload:`, {
      ...payload,
      image: payload.image.substring(0, 50) + '...'
    });
    
    const response = await axios.post(
      url,
      payload,
      {
        headers,
        timeout: 30000, // Aumentado para 30s
        validateStatus: (status) => true // Permite tratar todos os status
      }
    );
    
    if (response.status !== 200 && response.status !== 201) {
      console.error(`[Z-API ERROR] Status ${response.status}`);
      let errorMsg = 'Erro ao enviar imagem';
      
      if (response.data && typeof response.data === 'object') {
        errorMsg += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
      }
      
      return {
        success: false,
        message: errorMsg
      };
    }
    
    console.log(`[Z-API SUCCESS] Imagem enviada:`, response.data);
    
    return {
      success: true,
      messageId: response.data?.zaapId || response.data?.id || response.data?.messageId,
      message: "Imagem enviada com sucesso"
    };
  } catch (error) {
    console.error(`[Z-API ERROR] Erro ao enviar imagem:`, error);
    
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
 * Envia um vídeo via Z-API
 */
export async function sendVideo(
  instanceId: string,
  token: string,
  phone: string,
  videoUrl: string, 
  caption: string = "", 
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-video`;
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      url,
      {
        phone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        video: videoUrl, // URL do vídeo a ser enviado
        caption // Legenda/texto opcional a ser enviado junto com o vídeo
      },
      {
        headers
      }
    );
    
    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id
    };
  } catch (error) {
    console.error(`Erro ao enviar vídeo via Z-API:`, error);
    
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
 * Envia um documento via Z-API
 */
export async function sendDocument(
  instanceId: string,
  token: string,
  phone: string,
  documentUrl: string,
  fileName: string,
  caption: string = "",
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-document`;
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      url,
      {
        phone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        document: documentUrl, // URL do documento a ser enviado
        fileName, // Nome do arquivo com extensão (ex: "documento.pdf")
        caption // Legenda/texto opcional a ser enviado junto com o documento
      },
      {
        headers
      }
    );
    
    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id
    };
  } catch (error) {
    console.error(`Erro ao enviar documento via Z-API:`, error);
    
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
 * Envia um link com pré-visualização via Z-API
 */
export async function sendLink(
  instanceId: string,
  token: string,
  phone: string,
  url: string,
  linkTitle: string = "",
  linkDescription: string = "",
  clientToken?: string
): Promise<{
  success: boolean;
  messageId?: string;
  message?: string;
}> {
  try {
    const apiUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-link`;
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      apiUrl,
      {
        phone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        url, // URL a ser enviada (com previsualização)
        title: linkTitle, // Título opcional 
        description: linkDescription // Descrição opcional
      },
      {
        headers
      }
    );
    
    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id
    };
  } catch (error) {
    console.error(`Erro ao enviar link via Z-API:`, error);
    
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
 * Desconecta o WhatsApp da instância Z-API
 * @param instanceId ID da instância Z-API
 * @param token Token da instância Z-API
 * @param clientToken Token de segurança da conta Z-API (Client-Token)
 * @returns Resultado da operação de desconexão
 */
export async function disconnectZapi(
  instanceId: string,
  token: string,
  clientToken?: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`Desconectando WhatsApp da instância Z-API (${instanceId})...`);
    
    // Endpoint para desconectar o WhatsApp
    const disconnectUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect`;
    
    // Preparando headers com ou sem Client-Token (opcional)
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (clientToken) {
      headers["Client-Token"] = clientToken;
    }
    
    const response = await axios.post(
      disconnectUrl,
      {},
      {
        headers,
        validateStatus: function (status) {
          // Aceitar qualquer status para poder tratar o erro adequadamente
          return true;
        }
      }
    );
    
    console.log(`Resposta da desconexão Z-API (Status ${response.status}):`, JSON.stringify(response.data));
    
    if (response.status === 200) {
      return {
        success: true,
        message: "WhatsApp desconectado com sucesso."
      };
    } else {
      let errorMessage = `Erro ${response.status}`;
      
      if (response.data && typeof response.data === 'object') {
        errorMessage += `: ${response.data.error || response.data.message || JSON.stringify(response.data)}`;
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  } catch (error) {
    console.error(`Erro ao desconectar WhatsApp da Z-API:`, error);
    
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
