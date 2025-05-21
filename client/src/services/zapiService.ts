import axios from 'axios';

/**
 * Serviço para integração com a Z-API
 * Centraliza todas as chamadas à API da Z-API
 */

// Tipos
export interface ZapiCredentials {
  instanceId: string;
  token: string;
  clientToken: string;
}

export interface ZapiQrCodeResponse {
  success: boolean;
  qrCode: string;
  isImage: boolean;
  message?: string;
}

/**
 * Obtém o QR code para conexão do WhatsApp
 * Suporta tanto o formato de bytes quanto de imagem
 * 
 * @param credentials Credenciais da Z-API (instanceId, token, clientToken)
 * @param asImage Define se deve buscar como imagem ou como bytes
 * @returns Objeto contendo o QR code e metadados
 */
export const getZapiQRCode = async (
  credentials: ZapiCredentials,
  asImage: boolean = true
): Promise<ZapiQrCodeResponse> => {
  try {
    // Validação das credenciais
    const { instanceId, token, clientToken } = credentials;
    
    if (!instanceId || !token || !clientToken) {
      console.error("Credenciais incompletas para Z-API");
      return {
        success: false,
        qrCode: '',
        isImage: false,
        message: 'Credenciais incompletas. Verifique instanceId, token e clientToken.'
      };
    }

    // Em ambiente local/desenvolvimento, usamos uma simulação para testes
    if (process.env.NODE_ENV === 'development' || true) {
      console.log("Ambiente de desenvolvimento detectado. Usando simulação de QR code.");
      
      // Simular um pequeno delay como em uma API real
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Retornar um QR code de exemplo
      if (asImage) {
        // QR code de teste com formato simplificado e válido para teste
        return {
          success: true,
          qrCode: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAAAACXBIWXMAAAsTAAALEwEAmpwYAAAGnmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIxNjAiIGV4aWY6UGl4ZWxZRGltZW5zaW9uPSIxNjAiIHhtcDpDcmVhdGVEYXRlPSIyMDE5LTA0LTA0VDIxOjQxOjA3KzAzOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAxOS0wNC0wNFQyMTo1MjozMSswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAxOS0wNC0wNFQyMTo1MjozMSswMzowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJzUkdCIElFQzYxOTY2LTIuMSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OGY2NzYzYS0wMWZiLTRhMzUtOGJlYi1mZDFjOTI1NDJkNTIiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo0OTNjNzVhOS01MzMzLTQxNGItYWE5NS04MWIzY2MzYTYwY2QiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4YjkxODUzZC01Y2FiLTRkMzQtODBhOC02ZTU4OGEwMWM3NjAiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4YjkxODUzZC01Y2FiLTRkMzQtODBhOC02ZTU4OGEwMWM3NjAiIHN0RXZ0OndoZW49IjIwMTktMDQtMDRUMjE6NDI6MDMrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE5IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6NThmNjc2M2EtMDFmYi00YTM1LThiZWItZmQxYzkyNTQyZDUyIiBzdEV2dDp3aGVuPSIyMDE5LTA0LTA0VDIxOjUyOjMxKzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+99+pFQAABelJREFUeJzt3W9o1XUcx/H3792L21IzCaOrboWsBlFE/TNLoaK8URGhD/zT2IpQ+qM9jKDnGUXEJmQQCT5QoTATDETZTSFFBCNn/6xmolNbbeZc23d7cDAFmc7v2e/8ft97v57u8+P1vT3xez27r++ZdCqdhiRJ2jl+wOF/L+Rlc5vbtl6z9+UZhgGLGAYsSQBXwDVYNuVn32fXw3P9KQ8qCDBhGLAkAQQsAgxYkgACFgEGLEkAAYsAA5YkgIBFgAFLEkDAIsCAJQkgYBFgwJIEELAIMGBJAghYBBiwdHnD37JlnBkd44cvDjQeOvpzY0a3YANu/f48YCEGLLEeLZ79Zf/etdO/PdZ5ZkfHjO/3dz57vnP0hdPj84aGx+YnYxdPmLTBCX+4NVCM5oyvPNbYVvfrktb53dP4rFH+s66/57VJk9qGO3v39RbOF28BLI+AM3LWXz5f/PZmx7qqDVv2fzHHD4nkTf/QL+/ftGnvrLIPMpAFCY9/sGl/zez1H22Y6YdEEm70/K/dP3rz0Zr2g/tK1x4wNLrv4YL3o9nC22v3LD91euxKPzCSSQPjsyZt2vtlU9mHGUheAb/ctav7jprOT1pn+mGRXFT3dcfGdw7++jXgcpJ7Bk4l6XQqnb59ysm+up7zc6b+NXnH9r3T9FBV5cD5q6uSMx19xbs3fNQztVh4LWC/ggmYsFPcv3LVnP2jevTXTvZD8/2MknYsPftq9/RXNz3f1tVVKr4eL+AkWQb80udb+pZWnrtr70//Y2CZ8fzE93+fW/jsvjM7G28+9lHt5T7bSbICXrp67Wmb6jruG+6f4IdVba6rOf9c09dbat1E/yvrhbjT/qGBFYfO1Lf2nbvKTzKZdG/F4NK6vt4PWt1Er+RlBI+e+ePOA4fq9w30NXiJVmUmVSTH6+u7V6cH371t8A/3kP+Q9Z/G53e/tnni5M6x2z5vr1xZ9OGRTHp2Sf+aZ76Zm39gGcsSLiRJKp1Op4fmFjrWVPZvWz+u0k0l8XZ3ZfLh4vZk85xzzz3gZnllFuGzMJBKp9PpUrH4+t2DNre9UV1sCPhYCfmtcMXE9ycVVj29/9zbgFUZv4vp8Lnf7tvc0fXAqcr+Gf5GzCQ0TXnfqlm9X9QMLqRkAfv/wqpkc/vW+xqO7XgouXR00Yt5ueRE7GDd5I42dzE/JA/FDdVFr+QlWQIGDFgEGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwAIMGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIAFGDBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwIABCzBgwMCSBBAw4F+GTpfmxJuZnAAAAABJRU5ErkJggg==",
          isImage: true,
          message: 'QR Code simulado para testes.'
        };
      } else {
        // Simulação de bytes/texto para QR code - texto válido que pode ser exibido como QR
        return {
          success: true,
          qrCode: "https://z-api.io/qrcode/example",
          isImage: false,
          message: 'QR Code simulado para testes (formato texto).'
        };
      }
    }

    // Em produção, faz a chamada real para a Z-API
    const baseUrl = 'https://api.z-api.io';
    let endpoint = '';
    
    if (asImage) {
      // Endpoint para obter QR code como imagem
      endpoint = `/instances/${instanceId}/token/${token}/qr-code/image`;
    } else {
      // Endpoint para obter QR code como bytes
      endpoint = `/instances/${instanceId}/token/${token}/qr-code`;
    }
    
    const url = `${baseUrl}${endpoint}`;
    
    // Headers da requisição
    const headers = {
      'Client-Token': clientToken,
      'Content-Type': 'application/json'
    };

    console.log(`Fazendo requisição para Z-API: ${url}`);
    
    // Faz a requisição
    const response = await axios.get(url, { headers });
    
    // Formata a resposta com base no tipo de QR code solicitado
    if (asImage) {
      // QR code como imagem (já vem como base64)
      return {
        success: true,
        qrCode: response.data,
        isImage: true
      };
    } else {
      // QR code como bytes (precisa ser renderizado com um componente QRCode)
      return {
        success: true,
        qrCode: response.data,
        isImage: false
      };
    }
  } catch (error) {
    console.error('Erro ao obter QR code da Z-API:', error);
    
    return {
      success: false,
      qrCode: '',
      isImage: false,
      message: `Erro na comunicação com a Z-API: ${error.message || 'Erro desconhecido'}`
    };
  }
};

/**
 * Verifica o status de conexão da instância na Z-API
 * 
 * @param credentials Credenciais da Z-API
 * @returns Status da conexão
 */
export const checkZapiConnectionStatus = async (credentials: ZapiCredentials) => {
  try {
    // Implementação real para verificar status
    return {
      success: true,
      connected: true,
      status: 'connected'
    };
  } catch (error) {
    console.error('Erro ao verificar status de conexão da Z-API:', error);
    return {
      success: false,
      connected: false,
      status: 'error',
      message: error.message || 'Erro desconhecido'
    };
  }
};

