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

    // Simulação de resposta para teste
    if (
      process.env.NODE_ENV === "development" ||
      !instanceId ||
      instanceId === "test"
    ) {
      console.log("Usando simulação para QR Code (apenas para teste)");

      // Use um QR code base64 válido e completo para teste
      // Este é um QR code simples que aponta para "https://example.com"
      const mockBase64QR =
        "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAABlBMVEX///8AAABVwtN+AAAB9ElEQVR4nO3VQY7DIBBFQeL7X3nkBYvEJpmxq3bvPw/8IvJ6CTgOAAAAAAAAAAAAuOC4qb/ufqH/Uf8CVrACvJsVYAV4OyvACvB2VoAV4O2sgIv978oK0P+uVoD+d7UC9L+rFaD/Xa0A/e9qBeh/VytA/7taAfrftRXw+tYKmNf/V3M36X9TK0D/u1oB+t/VCtD/rlbA/P7bWQGzW4BpBcxuAaYVoP9drQD972oF6H9XK0D/u1oB+t/VCpjd/7RWYFoLMK2A2S3AtAJmtwDTCpjdAkwrYHYLMK2A2S3AtAL0v6sVoP9drQD972oF6H9XK2B+/+2sgNktwLQCZrcA0wqY3QJMK0D/u1oB+t/VCtD/rlbA/P7bWQGzW4BpBeh/VytA/7taAfrftRUwueNprcC0FmBaAbNbgGkFzG4BphUwuwWYVsDsFmBaAbNbgGkF6H9XK0D/u1oB+t/VCpjffzsrYHYLMK2A2S3AtAJmtwDTCtD/rlaA/ne1AvS/qxUwv/92VsDsFmBaAfrftRXw+vO5FTCv/6/mbtL/plaA/ne1AvS/qxWg/12tAP3vagXof1crQP+7WgH639UK+NPjduwm/W9qBeh/VytA/7taAfrftRXw+vW9FTCv/4/mbtL/plbAv9H/XVkB+t/VCtD/rlYAAAAAAAAAAAAAAH/kDYYjR3ZIi6t5AAAAAElFTkSuQmCC";

      console.log("======= QR Code Simulação =======");
      console.log("Retornando QR code como imagem base64 para o frontend");

      return {
        success: true,
        qrCode: `data:image/png;base64,${mockBase64QR}`, // Adicione o prefixo completo aqui
        isImage: true,
      };
    }

    // Primeiro tenta obter o QR Code como imagem diretamente
    try {
      console.log("Tentando obter QR Code como imagem base64...");

      const imageResponse = await axios.get(
        `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code/image`,
        {
          headers: getHeadersWithToken(clientToken),
        },
      );

      // Se a resposta já contém o base64, usamos diretamente
      if (
        imageResponse.data &&
        typeof imageResponse.data === "string" &&
        (imageResponse.data.startsWith("data:image") ||
          imageResponse.data.match(/^[A-Za-z0-9+/=]+$/))
      ) {
        // Verifica se já tem o prefixo data:image, se não tiver, adiciona
        const qrCodeImage = imageResponse.data.startsWith("data:image")
          ? imageResponse.data
          : `data:image/png;base64,${imageResponse.data}`;

        return {
          success: true,
          qrCode: qrCodeImage,
          isImage: true,
        };
      }

      // Se a resposta contém um objeto com a propriedade base64, usa esse valor
      if (imageResponse.data && imageResponse.data.base64) {
        return {
          success: true,
          qrCode: `data:image/png;base64,${imageResponse.data.base64}`,
          isImage: true,
        };
      }
    } catch (imageError) {
      console.log(
        "Falha ao obter QR Code como imagem base64, tentando outro método...",
      );
    }

    // Se falhar a requisição de imagem, tenta obter como bytes e converter para base64
    try {
      console.log("Tentando obter QR Code como bytes...");

      const response = await axios.get(
        `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code`,
        {
          headers: getHeadersWithToken(clientToken),
          responseType: "arraybuffer",
        },
      );

      // Converte o buffer da imagem para base64
      const base64Image = Buffer.from(response.data).toString("base64");
      return {
        success: true,
        qrCode: `data:image/png;base64,${base64Image}`,
        isImage: true,
      };
    } catch (bytesError) {
      console.log(
        "Falha ao obter QR Code como bytes, tentando obter como texto...",
      );

      // Como último recurso, tenta obter o texto do QR code
      try {
        const textResponse = await axios.get(
          `${BASE_URL}/instances/${instanceId}/token/${token}/qr-code/text`,
          {
            headers: getHeadersWithToken(clientToken),
            responseType: "json",
          },
        );

        console.log(
          "Resposta Z-API (QR Code texto):",
          textResponse.data ? "QR Code obtido com sucesso" : "Sem QR Code",
        );

        // A resposta da Z-API contém o QR Code no formato correto na propriedade 'value'
        const qrCodeData = textResponse.data?.value || textResponse.data;

        return {
          success: true,
          qrCode: qrCodeData,
          isImage: false,
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
        message: `Erro ${error.response?.status}: ${error.response?.data?.error || error.message}`,
      };
    } else {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}
