import React, { useRef, useEffect, useState } from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import WhatsAppMessageContent from './WhatsAppMessageContent';
import { 
  MessageSquare,
  Forward,
  FileText,
  Star,
  Smile,
  MoreHorizontal,
  CheckCheck,
  Trash,
  Send
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { DateSeparator } from './DateSeparator';
import axios from 'axios';

interface MessageListProps {
  messages: Array<{
    id: number;
    conversationId: number;
    content: string;
    type: string;
    sender: 'user' | 'contact' | 'system' | 'ai';
    status: string;
    metadata?: any;
    timestamp: Date;
  }>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  loadMoreMessages: () => void;
  hasMoreMessages: boolean;
  loadingMessages: boolean;
  senderName: string;
  senderAvatar?: string;
  extractMessageContent: (message: any) => string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  messagesEndRef,
  loadMoreMessages,
  hasMoreMessages,
  loadingMessages,
  senderName,
  senderAvatar,
  extractMessageContent
}) => {
  const [showForwardDialog, setShowForwardDialog] = useState(false);
  const [messageToForward, setMessageToForward] = useState<any>(null);
  const [forwardPhone, setForwardPhone] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);
  const { toast } = useToast();
  
  // Função para encaminhar mensagem
  const handleForwardMessage = async () => {
    // Validar número de telefone
    if (!forwardPhone || forwardPhone.length < 10) {
      toast({
        title: "Número inválido",
        description: "Por favor, insira um número de telefone válido (com DDD)",
        variant: "destructive"
      });
      return;
    }
    
    setIsForwarding(true);
    
    try {
      // Remover caracteres não numéricos
      const normalizedPhone = forwardPhone.replace(/\D/g, '');
      
      // Adicionar código do país se não houver
      const phoneWithCountryCode = normalizedPhone.startsWith('55') 
        ? normalizedPhone 
        : `55${normalizedPhone}`;
      
      // Extrair o ID da mensagem da Z-API corretamente
      const zapiMessageId = messageToForward?.metadata?.zapiMessageId || 
                           messageToForward?.metadata?.messageId || 
                           messageToForward?.id;
      
      if (!zapiMessageId) {
        throw new Error("ID da mensagem não encontrado para encaminhamento. Verifique se a mensagem é do WhatsApp.");
      }
      
      console.log("Encaminhando mensagem com ID:", zapiMessageId);
      
      const response = await axios.post('/api/zapi/forward-message', {
        instanceId: '3DF871A7ADFB20FB49998E66062CE0C1', // ID da instância Z-API
        token: '5CD6CAB4A8DBCC35E1C4BB66', // Token da instância Z-API
        phone: phoneWithCountryCode,
        messageId: zapiMessageId
      });
      
      if (response.data.success) {
        toast({
          title: "Mensagem encaminhada",
          description: "A mensagem foi encaminhada com sucesso",
          variant: "default"
        });
        setShowForwardDialog(false);
        setForwardPhone('');
      } else {
        throw new Error(response.data.message || "Erro ao encaminhar mensagem");
      }
    } catch (error) {
      console.error('Erro ao encaminhar mensagem:', error);
      toast({
        title: "Erro ao encaminhar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao encaminhar a mensagem",
        variant: "destructive"
      });
    } finally {
      setIsForwarding(false);
    }
  };

  // Função para renderizar o status de entrega/leitura
  const renderDeliveryStatus = (status: string) => {
    switch(status) {
      case 'sending':
        return (
          <div className="flex items-center">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1 animate-pulse"></span>
            <span className="text-[10px] text-muted-foreground">Enviando</span>
          </div>
        );
      case 'sent':
        return <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="h-3.5 w-3.5 text-blue-500" />;
      case 'read':
        return <CheckCheck className="h-3.5 w-3.5 text-green-500" />;
      case 'error':
        return <span className="text-[10px] text-destructive">Erro</span>;
      default:
        return null;
    }
  };

  // Formata o conteúdo da mensagem com base no tipo
  const renderMessageContent = (message: any) => {
    // Determinar o tipo real da mensagem
    const messageType = message.type || 
                       (message.body && message.body.type) || 
                       (message.metadata && message.metadata.type) || 
                       'text';
    
    // Verificar se é uma mensagem interativa
    const isButtonMessage = messageType === 'button-list' || 
                           (message.buttonList && message.buttonList.buttons) ||
                           (message.body && message.body.buttonList);
                           
    const isOptionList = messageType === 'option-list' || 
                        (message.listMessage && message.listMessage.sections) ||
                        (message.body && message.body.listMessage);
    
    switch(messageType) {
      case 'image':
        // Determinar a URL da imagem
        const imageUrl = message.metadata?.url || 
                        (message.body && message.body.url) || 
                        (message.content && message.content.includes('http') && message.content.match(/https?:\/\/[^\s"]+/)?.[0]);
        
        if (!imageUrl) {
          console.warn('Mensagem de imagem sem URL:', message);
          return <WhatsAppMessageContent message={message} />;
        }
        
        return (
          <div className="media-message-container">
            <div className="relative group">
              <img 
                src={imageUrl}
                alt="Imagem enviada" 
                className="rounded-lg max-w-full max-h-[250px] object-cover mb-2 cursor-pointer transition-transform transform hover:scale-[1.02]"
                onClick={() => window.open(imageUrl, '_blank')}
                onError={(e) => {
                  console.error('Erro ao carregar imagem:', imageUrl);
                  e.currentTarget.src = '/placeholder-image.png';
                  e.currentTarget.className = e.currentTarget.className + ' opacity-50';
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-lg">
                <svg className="h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                  <path d="M11 8v6"></path>
                  <path d="M8 11h6"></path>
                </svg>
              </div>
            </div>
            {message.content && (
              <WhatsAppMessageContent message={message} />
            )}
          </div>
        );
        
      case 'audio':
      case 'ptt':
        // Determinar a URL do áudio
        const audioUrl = message.metadata?.url || 
                        (message.body && message.body.url) || 
                        (message.content && message.content.includes('http') && message.content.match(/https?:\/\/[^\s"]+/)?.[0]);
        
        if (!audioUrl) {
          console.warn('Mensagem de áudio sem URL:', message);
          return <WhatsAppMessageContent message={message} />;
        }
        
        return (
          <div className="media-message-container">
            <div className="bg-background/80 p-2 rounded-md border border-muted/50">
              <div className="flex items-center mb-2">
                <svg className="h-5 w-5 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" x2="12" y1="19" y2="22"></line>
                </svg>
                <span className="text-sm font-medium">Mensagem de áudio</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {message.metadata?.duration || ''}
                </span>
              </div>
              <audio 
                src={audioUrl} 
                controls 
                className="max-w-full w-full h-10" 
                preload="metadata"
              />
            </div>
            {message.content && (
              <WhatsAppMessageContent message={message} />
            )}
          </div>
        );
        
      case 'video':
        // Determinar a URL do vídeo
        const videoUrl = message.metadata?.url || 
                        (message.body && message.body.url) || 
                        (message.content && message.content.includes('http') && message.content.match(/https?:\/\/[^\s"]+/)?.[0]);
        
        if (!videoUrl) {
          console.warn('Mensagem de vídeo sem URL:', message);
          return <WhatsAppMessageContent message={message} />;
        }
        
        return (
          <div className="media-message-container">
            <div className="relative group">
              <video 
                src={videoUrl}
                controls
                className="rounded-lg max-w-full max-h-[250px] object-cover mb-2"
                preload="metadata"
              />
            </div>
            {message.content && (
              <WhatsAppMessageContent message={message} />
            )}
          </div>
        );
        
      case 'document':
        // Determinar a URL do documento
        const docUrl = message.metadata?.url || 
                      (message.body && message.body.url) || 
                      (message.content && message.content.includes('http') && message.content.match(/https?:\/\/[^\s"]+/)?.[0]);
        
        const fileName = message.metadata?.fileName || 
                        (message.body && message.body.fileName) || 
                        'documento.pdf';
        
        if (!docUrl) {
          console.warn('Mensagem de documento sem URL:', message);
          return <WhatsAppMessageContent message={message} />;
        }
        
        return (
          <div className="media-message-container">
            <div className="bg-background/80 p-3 rounded-md border border-muted/50 flex items-center">
              <svg className="h-8 w-8 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium truncate">{fileName}</div>
                <div className="text-xs text-muted-foreground">
                  {message.metadata?.fileSize ? `${(message.metadata.fileSize / 1024).toFixed(1)} KB` : ''}
                </div>
              </div>
              <a 
                href={docUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 p-1.5 rounded-full hover:bg-muted"
              >
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
              </a>
            </div>
          </div>
        );
        
      case 'button-list':
        if (isButtonMessage) {
          // Extrair dados dos botões
          const buttons = message.buttonList?.buttons || 
                         (message.body && message.body.buttonList && message.body.buttonList.buttons) || 
                         [];
          
          const messageText = message.message || 
                             (message.body && message.body.message) || 
                             '';
          
          return (
            <div className="interactive-message-container">
              <div className="bg-background/80 p-3 rounded-md border border-primary/30">
                <div className="text-sm mb-3">{messageText}</div>
                <div className="flex flex-col gap-2">
                  {buttons.map((button: any, index: number) => (
                    <button 
                      key={button.id || index}
                      className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                      onClick={() => {
                        console.log('Botão clicado:', button);
                      }}
                    >
                      {button.label || button.text || `Opção ${index + 1}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        }
        return <WhatsAppMessageContent message={message} />;
        
      case 'option-list':
        if (isOptionList) {
          // Extrair dados da lista de opções
          const sections = message.listMessage?.sections || 
                          (message.body && message.body.listMessage && message.body.listMessage.sections) || 
                          [];
          
          const title = message.listMessage?.title || 
                       (message.body && message.body.listMessage && message.body.listMessage.title) || 
                       'Selecione uma opção';
          
          const description = message.listMessage?.description || 
                             (message.body && message.body.listMessage && message.body.listMessage.description) || 
                             '';
          
          return (
            <div className="interactive-message-container">
              <div className="bg-background/80 p-3 rounded-md border border-primary/30">
                <div className="text-sm font-medium mb-1">{title}</div>
                {description && <div className="text-sm mb-3">{description}</div>}
                
                {sections.map((section: any, sectionIndex: number) => (
                  <div key={sectionIndex} className="mb-3">
                    {section.title && (
                      <div className="text-xs font-medium text-muted-foreground mb-2">{section.title}</div>
                    )}
                    <div className="flex flex-col gap-1.5">
                      {section.rows && section.rows.map((row: any, rowIndex: number) => (
                        <button 
                          key={row.id || rowIndex}
                          className="px-3 py-2 text-sm text-left bg-muted/50 hover:bg-muted rounded-md transition-colors"
                          onClick={() => {
                            console.log('Opção selecionada:', row);
                          }}
                        >
                          <div className="font-medium">{row.title || `Opção ${rowIndex + 1}`}</div>
                          {row.description && (
                            <div className="text-xs text-muted-foreground">{row.description}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        return <WhatsAppMessageContent message={message} />;
        
      default:
        // Usar o componente especializado para mensagens do WhatsApp
        return <WhatsAppMessageContent message={message} />;
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {/* Diálogo para encaminhar mensagem */}
      <Dialog open={showForwardDialog} onOpenChange={setShowForwardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Encaminhar mensagem</DialogTitle>
            <DialogDescription>
              Digite o número de telefone para encaminhar esta mensagem.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Número de telefone</Label>
              <div className="flex space-x-2">
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={forwardPhone}
                  onChange={(e) => setForwardPhone(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="secondary" 
                  size="icon" 
                  title="Selecionar contato"
                  onClick={() => {
                    // Funcionalidade para selecionar um contato (a ser implementada)
                    alert('Funcionalidade para selecionar contato será implementada futuramente');
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Digite o número com DDD, sem o código do país, ou selecione um contato.
              </p>
            </div>
            
            {messageToForward && (
              <div className="border rounded-md p-3 bg-muted/20">
                <p className="text-sm font-medium mb-1">Mensagem a ser encaminhada:</p>
                <div className="text-sm opacity-80">
                  <WhatsAppMessageContent message={messageToForward} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowForwardDialog(false);
                setForwardPhone('');
              }}
              disabled={isForwarding}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleForwardMessage} 
              disabled={!forwardPhone || isForwarding}
            >
              {isForwarding ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Encaminhando...
                </>
              ) : (
                <>
                  <Forward className="h-4 w-4 mr-2" /> Encaminhar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Botão para carregar mensagens anteriores */}
      {hasMoreMessages && (
        <div className="text-center py-2">
          <button 
            onClick={loadMoreMessages}
            disabled={loadingMessages}
            className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-full"
          >
            {loadingMessages ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground inline-block animate-spin mr-2 align-[-2px]"></span>
                Carregando...
              </>
            ) : (
              'Carregar mensagens anteriores'
            )}
          </button>
        </div>
      )}
      
      {/* Lista de mensagens */}
      <div className="px-4 pt-2 flex-1">
        {messages.map((message, index) => {
          // Determinar o tipo de remetente
          const isFromContact = message.sender === 'contact';
          const isFromSystem = message.sender === 'system';
          const isFromAI = message.sender === 'ai';
          
          // Verificar se esta mensagem é a última
          const isLastMessage = index === messages.length - 1;
          
          // Determinar se há mudança de dia entre mensagens
          const messageDate = new Date(message.timestamp);
          const previousMessage = index > 0 ? messages[index - 1] : null;
          const previousDate = previousMessage ? new Date(previousMessage.timestamp) : null;
          const showDateSeparator = !previousDate || !isSameDay(messageDate, previousDate);
          
          // Verificar se é uma mensagem consecutiva do mesmo remetente
          const isConsecutive = index > 0 && 
                               messages[index - 1].sender === message.sender && 
                               !showDateSeparator &&
                               (new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime() < 60 * 1000); // Menos de 1 minuto de diferença
          
          return (
            <div key={message.id}>
              {/* Mostra o separador de data quando necessário */}
              {showDateSeparator && (
                <DateSeparator date={messageDate} />
              )}
              
              {/* Container da mensagem */}
              <div 
                className={`flex ${isFromContact || isFromSystem || isFromAI ? 'justify-start' : 'justify-end'} 
                  ${isConsecutive ? 'mt-1' : 'mt-4'} group`}
                ref={isLastMessage ? messagesEndRef : undefined}
              >
                {/* Avatar para mensagens não consecutivas de contato/sistema/AI */}
                {(isFromContact || isFromSystem || isFromAI) && !isConsecutive && (
                  <div className="flex-shrink-0 mr-2">
                    <Avatar className="h-8 w-8">
                      {isFromAI ? (
                        <AvatarFallback className="bg-blue-100 text-blue-600">IA</AvatarFallback>
                      ) : isFromSystem ? (
                        <AvatarFallback className="bg-yellow-100 text-yellow-600">SYS</AvatarFallback>
                      ) : (
                        <>
                          <AvatarImage src={senderAvatar} alt={senderName} />
                          <AvatarFallback>{senderName?.charAt(0) || 'C'}</AvatarFallback>
                        </>
                      )}
                    </Avatar>
                  </div>
                )}
                
                {/* Container do conteúdo da mensagem */}
                <div className={`max-w-[75%] ${isConsecutive && (isFromContact || isFromSystem || isFromAI) ? 'ml-10' : ''}`}>
                  {/* Nome do remetente para primeira mensagem de uma sequência */}
                  {(isFromContact || isFromSystem || isFromAI) && !isConsecutive && (
                    <div className="text-xs font-medium ml-1 mb-1">
                      {isFromAI ? 'Assistente IA' : isFromSystem ? 'Sistema' : senderName || 'Contato'}
                    </div>
                  )}
                  
                  <div className="flex items-end">
                    {/* Bolha da mensagem */}
                    <div className={`p-3 rounded-lg ${
                      isFromContact ? 'bg-muted text-foreground' : 
                      isFromSystem ? 'bg-yellow-100 dark:bg-yellow-950 text-foreground italic' :
                      isFromAI ? 'bg-blue-100 dark:bg-blue-950 text-foreground' :
                      'bg-primary text-primary-foreground'
                    }`}>
                      {renderMessageContent(message)}
                      
                      {/* Horário e status */}
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-[10px] opacity-70">
                          {format(messageDate, 'HH:mm')}
                        </span>
                        {message.sender === 'user' && (
                          <div className="ml-1">{renderDeliveryStatus(message.status)}</div>
                        )}
                      </div>
                    </div>
                    
                    {/* Menu de ações */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 mb-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-6 w-6 rounded-full flex items-center justify-center hover:bg-muted">
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Star className="h-4 w-4 mr-2" /> Marcar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setMessageToForward(message);
                            setShowForwardDialog(true);
                          }}>
                            <Forward className="h-4 w-4 mr-2" /> Encaminhar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            navigator.clipboard.writeText(extractMessageContent(message));
                            toast({
                              title: "Texto copiado",
                              description: "O conteúdo da mensagem foi copiado para a área de transferência",
                              variant: "default"
                            });
                          }}>
                            <FileText className="h-4 w-4 mr-2" /> Copiar texto
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Estado de carregamento para a lista inteira */}
        {loadingMessages && messages.length === 0 && (
          <div className="flex justify-center items-center h-32">
            <div className="flex flex-col items-center">
              <span className="h-6 w-6 rounded-full border-2 border-muted-foreground/20 border-t-muted-foreground animate-spin mb-2"></span>
              <span className="text-sm text-muted-foreground">Carregando mensagens...</span>
            </div>
          </div>
        )}
        
        {/* Mensagem de lista vazia */}
        {!loadingMessages && messages.length === 0 && (
          <div className="flex justify-center items-center h-32">
            <div className="flex flex-col items-center">
              <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">Nenhuma mensagem encontrada</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageList;
