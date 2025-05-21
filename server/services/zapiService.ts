import axios from "axios";

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
  clientToken: string,
): Promise<{
  success: boolean;
  qrCode?: string;
  message?: string;
  isImage?: boolean;
  isConnected?: boolean;
}> {
  try {
    console.log(`Obtendo QR Code para instância Z-API (${instanceId})...`);
    
    // Obter o QR code diretamente como bytes (via imagem)
    try {
      // Usando o endpoint QR code/image para obter os bytes da imagem
      const imageUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code/image`;
      
      console.log(`Chamando API Z-API para obter QR code como bytes: ${imageUrl}`);
      
      const imageResponse = await axios.get(imageUrl, {
        headers: {
          "Client-Token": clientToken,
        },
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
          // Convertemos os bytes para base64
          const base64Image = Buffer.from(imageResponse.data).toString('base64');
          
          console.log("QR code obtido com sucesso (bytes convertidos para base64)");
          
          return {
            success: true,
            qrCode: base64Image,
            isImage: true // É uma imagem em base64
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
        
        const textResponse = await axios.get(bytesUrl, {
          headers: {
            "Client-Token": clientToken,
          },
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
  clientToken: string,
): Promise<{
  success: boolean;
  message: string;
  status?: string;
  details?: any;
}> {
  try {
    console.log(`Testando conexão com instância Z-API (${instanceId})...`);
    console.log(`Usando token: ${token}`);
    console.log(`Usando client-token: ${clientToken}`);
    
    // Verifica o status da conexão via endpoint de status da Z-API
    const statusUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;
    
    console.log(`Fazendo requisição para: ${statusUrl}`);
    
    const response = await axios.get(statusUrl, {
      headers: {
        "Client-Token": clientToken,
      },
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
 * Envia uma mensagem de texto via Z-API
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
    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
    
    const response = await axios.post(
      url,
      {
        phone, // Número no formato DDI+DDD+NUMERO, ex: 5511999999999
        message
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Client-Token": clientToken
        }
      }
    );
    
    return {
      success: true,
      messageId: response.data?.messageId || response.data?.id
    };
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
  clientToken: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    console.log(`Desconectando WhatsApp da instância Z-API (${instanceId})...`);
    
    // Endpoint para desconectar o WhatsApp
    const disconnectUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/disconnect`;
    
    const response = await axios.post(
      disconnectUrl,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "Client-Token": clientToken
        },
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