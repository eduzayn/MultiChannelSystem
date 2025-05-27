import React from 'react';

interface WhatsAppMessageContentProps {
  message: any;
}

const WhatsAppMessageContent: React.FC<WhatsAppMessageContentProps> = ({ message }) => {
  // Função para extrair o texto real da mensagem
  const extractContent = (message: any): string => {
    try {
      // Verificar se temos conteúdo direto no objeto da mensagem
      if (message.body && typeof message.body === 'object') {
        // Formatos de webhook da Z-API
        if (message.body.text) return message.body.text;
        if (message.body.caption) return message.body.caption;
        if (message.body.title) return message.body.title;
        if (message.body.listMessage && message.body.listMessage.description) {
          return message.body.listMessage.description;
        }
        if (message.body.buttonMessage && message.body.buttonMessage.text) {
          return message.body.buttonMessage.text;
        }
      }
      
      // Verificar formatos de mensagens interativas
      if (message.buttonList && message.message) {
        return message.message;
      }
      
      if (message.listMessage && message.listMessage.description) {
        return message.listMessage.description;
      }
      
      // Verificar se o conteúdo é uma string
      if (typeof message.content !== 'string') {
        // Verificar outros campos comuns
        if (message.text) return message.text;
        if (message.message) return message.message;
        if (message.caption) return message.caption;
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
        
        // Formato de webhook da Z-API
        if (jsonContent.body) {
          if (jsonContent.body.text) return jsonContent.body.text;
          if (jsonContent.body.caption) return jsonContent.body.caption;
          if (jsonContent.body.title) return jsonContent.body.title;
        }
        
        // Formatos de mensagens interativas
        if (jsonContent.buttonList && jsonContent.message) {
          return jsonContent.message;
        }
        
        if (jsonContent.listMessage && jsonContent.listMessage.description) {
          return jsonContent.listMessage.description;
        }
        
        // Verificar outros campos comuns
        if (jsonContent.text) return jsonContent.text;
        if (jsonContent.caption) return jsonContent.caption;
        
        // Último recurso: retorna a representação do objeto como string
        const stringified = JSON.stringify(jsonContent);
        return stringified.length > 100 ? stringified.substring(0, 100) + '...' : stringified;
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
