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
}> {
  try {
    console.log(`Obtendo QR Code para instância Z-API (${instanceId})...`);
    
    // Vamos obter diretamente a imagem do QR code da Z-API real
    try {
      const imageUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/qr-code/image`;
      
      console.log(`Chamando API Z-API: ${imageUrl}`);
      
      const imageResponse = await axios.get(imageUrl, {
        headers: {
          "Client-Token": clientToken,
        },
        responseType: "arraybuffer",
        validateStatus: function (status) {
          // Aceitar qualquer status para poder tratar o erro adequadamente
          return true;
        }
      });
      
      // Se houver um erro na resposta, vamos passar o erro para o frontend
      if (imageResponse.status !== 200) {
        console.error(`Erro na resposta da Z-API: ${imageResponse.status}`);
        
        // Tenta converter a resposta para texto para obter a mensagem de erro
        let errorMessage = "Erro ao obter QR code";
        try {
          const responseText = Buffer.from(imageResponse.data).toString('utf8');
          console.log("Resposta de erro Z-API:", responseText);
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || "Erro desconhecido na API Z-API";
        } catch (parseError) {
          console.error("Erro ao analisar resposta de erro:", parseError);
        }
        
        return {
          success: false,
          message: errorMessage,
        };
      }
      
      if (imageResponse.status === 200) {
        // Convert array buffer to base64
        const base64Image = Buffer.from(imageResponse.data, "binary").toString("base64");
        
        console.log("QR code obtido como imagem da Z-API");
        console.log("Com a flag isImage: true");
        
        return {
          success: true,
          qrCode: base64Image,
          isImage: true,
        };
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
}> {
  try {
    console.log(`Testando conexão com instância Z-API (${instanceId})...`);
    
    // Verifica o status da conexão via endpoint de status da Z-API
    const statusUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;
    
    const response = await axios.get(statusUrl, {
      headers: {
        "Client-Token": clientToken,
      },
    });
    
    // A Z-API retorna o status da conexão
    const connectionStatus = response.data?.connected;
    const statusMessage = response.data?.message || response.data?.status;
    
    if (connectionStatus === true) {
      return {
        success: true,
        message: "Conexão estabelecida com sucesso. WhatsApp conectado.",
        status: "connected",
      };
    } else if (connectionStatus === false) {
      return {
        success: false,
        message: `WhatsApp não conectado. Status: ${statusMessage || "Desconectado"}`,
        status: "disconnected",
      };
    } else {
      return {
        success: false,
        message: `Status indeterminado: ${statusMessage || "Desconhecido"}`,
        status: "unknown",
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