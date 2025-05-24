import React from 'react';

interface WhatsAppMessageContentProps {
  message: any;
}

const WhatsAppMessageContent: React.FC<WhatsAppMessageContentProps> = ({ message }) => {
  // Função para extrair o texto real da mensagem
  const extractContent = (message: any): string => {
    try {
      // Verifica se o conteúdo é uma string
      if (typeof message.content !== 'string') {
        return 'Conteúdo não disponível';
      }

      // Verifica se o conteúdo já é texto simples
      if (message.content.trim() && !message.content.startsWith('{') && !message.content.startsWith('[')) {
        return message.content;
      }

      // Tenta fazer parse como JSON para mensagens antigas
      try {
        const jsonContent = JSON.parse(message.content);
        
        // Formato comum da Z-API
        if (jsonContent.message) {
          return jsonContent.message;
        }
        
        // Outro formato da Z-API 
        if (jsonContent.text && jsonContent.text.message) {
          return jsonContent.text.message;
        }
        
        // Último recurso: retorna a representação do objeto como string
        return JSON.stringify(jsonContent);
      } catch (e) {
        // Se não conseguiu fazer parse, deve ser texto simples
        return message.content;
      }
    } catch (error) {
      console.error('Erro ao extrair conteúdo:', error);
      return 'Erro ao processar mensagem';
    }
  };

  return (
    <p className="text-sm whitespace-pre-wrap">
      {extractContent(message)}
    </p>
  );
};

export default WhatsAppMessageContent;