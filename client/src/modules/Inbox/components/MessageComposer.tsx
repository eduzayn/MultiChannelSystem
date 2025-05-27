import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Send, 
  Smile, 
  Paperclip, 
  Mic, 
  Video, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  File, 
  FileText,
  X,
  Sparkles,
  MessageCircle,
  SlidersHorizontal,
  ListPlus,
  MessageSquare as ButtonIcon,
  Plus,
  Trash2
} from "lucide-react";

interface MessageComposerProps {
  onSendMessage: (text: string) => void;
  onFileSelect: (file: File, type: string) => void;
  onSendAttachment: () => void;
  onSendButtonMessage?: (title: string, message: string, footer: string, buttons: any[]) => void;
  onSendOptionList?: (title: string, buttonLabel: string, options: any[], description?: string) => void;
  isSending: boolean;
  selectedAttachment: { file: File; type: string } | null;
}

const MessageComposer = ({ 
  onSendMessage, 
  onFileSelect,
  onSendAttachment,
  onSendButtonMessage,
  onSendOptionList,
  isSending,
  selectedAttachment 
}: MessageComposerProps) => {
  const [messageText, setMessageText] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedTone, setSelectedTone] = useState('normal');
  const [isAttachmentPopoverOpen, setIsAttachmentPopoverOpen] = useState(false);
  
  const [showButtonDialog, setShowButtonDialog] = useState(false);
  const [showOptionListDialog, setShowOptionListDialog] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [buttonMessage, setButtonMessage] = useState('');
  const [buttonFooter, setButtonFooter] = useState('');
  const [buttons, setButtons] = useState<Array<{id?: string; label: string}>>([]);
  
  const [optionListTitle, setOptionListTitle] = useState('');
  const [optionListButtonLabel, setOptionListButtonLabel] = useState('');
  const [optionListDescription, setOptionListDescription] = useState('');
  const [optionSections, setOptionSections] = useState<Array<{
    title: string;
    rows: Array<{
      title: string;
      description?: string;
      id?: string;
    }>;
  }>>([{ title: 'Opções', rows: [{ title: '', description: '' }] }]);
  
  // Refs para os inputs de arquivo
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);

  // Limita o tamanho da textarea ao digitar
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [messageText]);

  // Monitora o texto para sugestões de IA
  useEffect(() => {
    if (messageText.length > 10 && !aiSuggestion && 
        (messageText.toLowerCase().includes('bom dia') || 
         messageText.toLowerCase().includes('boa tarde') || 
         messageText.toLowerCase().includes('boa noite')) && 
        Math.random() > 0.5) {
      setAiSuggestion("Que tal adicionar uma pergunta sobre como posso ajudar hoje?");
    } else if (messageText.length === 0) {
      setAiSuggestion(null);
    }
  }, [messageText]);

  // Detecta comandos de barra (slash commands)
  useEffect(() => {
    if (messageText.match(/\/\w*$/)) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  }, [messageText]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log("Enviando mensagem:", messageText);
      onSendMessage(messageText);
      setMessageText('');
      setAiSuggestion(null);
      
      // Limpa a textarea após envio
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      try {
        onFileSelect(file, type);
      } catch (error) {
        console.error('Erro ao processar arquivo:', error);
        alert('Erro ao processar arquivo. Por favor, tente novamente.');
      }
      
      setIsAttachmentPopoverOpen(false); // Fecha o popover após selecionar o arquivo
      e.target.value = ''; // Limpa o input
    }
  };

  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      // Extrai a sugestão da IA (neste exemplo, é adicionar uma pergunta)
      const suggestion = "Como posso ajudar você hoje?";
      setMessageText(prev => `${prev} ${suggestion}`);
      setAiSuggestion(null);
    }
  };
  
  const handleAddButton = () => {
    if (buttons.length < 3) {
      setButtons([...buttons, { label: '' }]);
    }
  };
  
  const handleRemoveButton = (index: number) => {
    const newButtons = [...buttons];
    newButtons.splice(index, 1);
    setButtons(newButtons);
  };
  
  const handleButtonChange = (index: number, value: string) => {
    const newButtons = [...buttons];
    newButtons[index].label = value;
    setButtons(newButtons);
  };
  
  const handleSendButtonMessage = () => {
    if (buttonMessage && buttons.length > 0 && buttons.every(b => b.label.trim())) {
      if (onSendButtonMessage) {
        onSendButtonMessage(buttonTitle, buttonMessage, buttonFooter, buttons);
      }
      setShowButtonDialog(false);
      resetButtonDialog();
    }
  };
  
  const resetButtonDialog = () => {
    setButtonTitle('');
    setButtonMessage('');
    setButtonFooter('');
    setButtons([{ label: '' }]);
  };
  
  const handleAddSection = () => {
    setOptionSections([...optionSections, { 
      title: `Seção ${optionSections.length + 1}`, 
      rows: [{ title: '', description: '' }] 
    }]);
  };
  
  const handleRemoveSection = (sectionIndex: number) => {
    const newSections = [...optionSections];
    newSections.splice(sectionIndex, 1);
    setOptionSections(newSections);
  };
  
  const handleAddRow = (sectionIndex: number) => {
    const newSections = [...optionSections];
    newSections[sectionIndex].rows.push({ title: '', description: '' });
    setOptionSections(newSections);
  };
  
  const handleRemoveRow = (sectionIndex: number, rowIndex: number) => {
    const newSections = [...optionSections];
    newSections[sectionIndex].rows.splice(rowIndex, 1);
    setOptionSections(newSections);
  };
  
  const handleSectionTitleChange = (sectionIndex: number, value: string) => {
    const newSections = [...optionSections];
    newSections[sectionIndex].title = value;
    setOptionSections(newSections);
  };
  
  const handleRowTitleChange = (sectionIndex: number, rowIndex: number, value: string) => {
    const newSections = [...optionSections];
    newSections[sectionIndex].rows[rowIndex].title = value;
    setOptionSections(newSections);
  };
  
  const handleRowDescriptionChange = (sectionIndex: number, rowIndex: number, value: string) => {
    const newSections = [...optionSections];
    newSections[sectionIndex].rows[rowIndex].description = value;
    setOptionSections(newSections);
  };
  
  const handleSendOptionList = () => {
    if (optionListTitle && optionListButtonLabel && optionSections.length > 0 && 
        optionSections.every(section => 
          section.title.trim() && 
          section.rows.length > 0 && 
          section.rows.every(row => row.title.trim())
        )) {
      if (onSendOptionList) {
        onSendOptionList(
          optionListTitle, 
          optionListButtonLabel, 
          optionSections, 
          optionListDescription || undefined
        );
      }
      setShowOptionListDialog(false);
      resetOptionListDialog();
    }
  };
  
  const resetOptionListDialog = () => {
    setOptionListTitle('');
    setOptionListButtonLabel('');
    setOptionListDescription('');
    setOptionSections([{ title: 'Opções', rows: [{ title: '', description: '' }] }]);
  };

  return (
    <div className="border-t bg-background">
      {/* Área de visualização de anexos */}
      {selectedAttachment && (
        <div className="bg-muted/10 px-4 py-2 flex gap-2 overflow-x-auto">
          <div className="relative group min-w-[120px]">
            <div className="bg-background border rounded-md p-2 flex items-center gap-2">
              {selectedAttachment.file.type.startsWith('image/') ? (
                <div className="w-10 h-10 relative">
                  <img 
                    src={URL.createObjectURL(selectedAttachment.file)} 
                    alt={selectedAttachment.file.name} 
                    className="w-full h-full object-cover rounded-sm"
                  />
                  {isSending && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-sm">
                      <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-muted rounded-sm">
                  {selectedAttachment.file.type.startsWith('audio/') && <Mic className="h-5 w-5 text-muted-foreground" />}
                  {selectedAttachment.file.type.startsWith('video/') && <Video className="h-5 w-5 text-muted-foreground" />}
                  {selectedAttachment.file.type.includes('pdf') && <FileText className="h-5 w-5 text-muted-foreground" />}
                  {selectedAttachment.file.type.includes('doc') && <FileText className="h-5 w-5 text-muted-foreground" />}
                  {(!selectedAttachment.file.type.startsWith('audio/') && 
                    !selectedAttachment.file.type.startsWith('video/') && 
                    !selectedAttachment.file.type.includes('pdf') &&
                    !selectedAttachment.file.type.includes('doc') &&
                    !selectedAttachment.file.type.startsWith('image/')) && 
                    <File className="h-5 w-5 text-muted-foreground" />}
                  {isSending && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-sm">
                      <span className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <div className="text-xs font-medium truncate">{selectedAttachment.file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {(selectedAttachment.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onFileSelect(null as any, '')}
                disabled={isSending}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sugestão da IA */}
      {aiSuggestion && (
        <div className="px-4 py-2 bg-primary/5 border-t flex items-start gap-2">
          <div className="bg-primary/10 rounded-full p-1 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium">Sugestão da Prof. Ana:</p>
            <p className="text-sm">{aiSuggestion}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs"
            onClick={applyAiSuggestion}
          >
            Aplicar
          </Button>
        </div>
      )}

      {/* Menu de comandos rápidos */}
      {showCommands && (
        <div className="px-4 py-2 border-t">
          <div className="text-xs font-medium mb-2">Comandos disponíveis:</div>
          <div className="grid grid-cols-2 gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="justify-start text-xs h-7"
              onClick={() => setMessageText("/saudacao Olá! Como posso ajudar?")}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              /saudacao
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="justify-start text-xs h-7"
              onClick={() => setMessageText("/horario Nosso horário de atendimento é...")}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
              /horario
            </Button>
          </div>
        </div>
      )}

      <div className="px-3 pt-2 flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          {/* Botão de anexo com menu dropdown */}
          <Popover open={isAttachmentPopoverOpen} onOpenChange={setIsAttachmentPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" title="Anexar arquivo">
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" side="top">
              <div className="space-y-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => audioInputRef.current?.click()}
                >
                  <Mic className="h-4 w-4 mr-2" />
                  Áudio
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => videoInputRef.current?.click()}
                >
                  <Video className="h-4 w-4 mr-2" />
                  Vídeo
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => imageInputRef.current?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Imagem
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => documentInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Documento
                </Button>
                <hr className="my-1 border-muted" />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => setShowButtonDialog(true)}
                  disabled={!onSendButtonMessage}
                >
                  <ButtonIcon className="h-4 w-4 mr-2" />
                  Botões
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-xs h-8 px-2"
                  onClick={() => setShowOptionListDialog(true)}
                  disabled={!onSendOptionList}
                >
                  <ListPlus className="h-4 w-4 mr-2" />
                  Lista de opções
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="p-3 relative">
        <Textarea 
          ref={textareaRef}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="resize-none min-h-[80px] pr-16 py-3"
        />
        
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="default"
            size="icon" 
            className="h-9 w-9 rounded-full bg-primary text-primary-foreground" 
            disabled={isSending || (!messageText.trim() && !selectedAttachment)}
            onClick={selectedAttachment ? onSendAttachment : handleSendMessage}
          >
            {isSending ? (
              <span className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Input ocultos para upload de arquivos */}
      <input 
        type="file" 
        accept="audio/*" 
        ref={audioInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, 'audio')}
      />
      <input 
        type="file" 
        accept="video/*" 
        ref={videoInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, 'video')}
      />
      <input 
        type="file" 
        accept="image/*" 
        ref={imageInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, 'image')}
      />
      <input 
        type="file" 
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" 
        ref={documentInputRef} 
        className="hidden" 
        onChange={(e) => handleFileChange(e, 'document')}
      />
      
      {/* Dialog para mensagens com botões */}
      <Dialog open={showButtonDialog} onOpenChange={setShowButtonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar mensagem com botões</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="button-title">Título (opcional)</Label>
              <Input
                id="button-title"
                value={buttonTitle}
                onChange={(e) => setButtonTitle(e.target.value)}
                placeholder="Título da mensagem"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="button-message" className="text-red-500">Mensagem *</Label>
              <Textarea
                id="button-message"
                value={buttonMessage}
                onChange={(e) => setButtonMessage(e.target.value)}
                placeholder="Texto principal da mensagem"
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="button-footer">Rodapé (opcional)</Label>
              <Input
                id="button-footer"
                value={buttonFooter}
                onChange={(e) => setButtonFooter(e.target.value)}
                placeholder="Texto do rodapé"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-red-500">Botões * (máx. 3)</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddButton}
                  disabled={buttons.length >= 3}
                  className="h-7 px-2"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>
              
              <div className="space-y-2 mt-1">
                {buttons.map((button, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      value={button.label}
                      onChange={(e) => handleButtonChange(index, e.target.value)}
                      placeholder={`Texto do botão ${index + 1}`}
                      className="flex-1"
                      required
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveButton(index)}
                      disabled={buttons.length <= 1}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowButtonDialog(false);
                resetButtonDialog();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSendButtonMessage}
              disabled={!buttonMessage || buttons.length === 0 || !buttons.every(b => b.label.trim())}
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog para listas de opções */}
      <Dialog open={showOptionListDialog} onOpenChange={setShowOptionListDialog}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar lista de opções</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="option-list-title" className="text-red-500">Título *</Label>
              <Input
                id="option-list-title"
                value={optionListTitle}
                onChange={(e) => setOptionListTitle(e.target.value)}
                placeholder="Título da lista"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="option-list-button" className="text-red-500">Texto do botão *</Label>
              <Input
                id="option-list-button"
                value={optionListButtonLabel}
                onChange={(e) => setOptionListButtonLabel(e.target.value)}
                placeholder="Ex: Ver opções"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="option-list-description">Descrição (opcional)</Label>
              <Textarea
                id="option-list-description"
                value={optionListDescription}
                onChange={(e) => setOptionListDescription(e.target.value)}
                placeholder="Descrição adicional"
                className="min-h-[60px]"
              />
            </div>
            
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-red-500">Seções e opções *</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAddSection}
                  className="h-7 px-2"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Nova seção
                </Button>
              </div>
              
              <div className="space-y-6 mt-1">
                {optionSections.map((section, sectionIndex) => (
                  <div key={sectionIndex} className="border rounded-md p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label htmlFor={`section-${sectionIndex}`} className="text-red-500">Título da seção *</Label>
                        <Input
                          id={`section-${sectionIndex}`}
                          value={section.title}
                          onChange={(e) => handleSectionTitleChange(sectionIndex, e.target.value)}
                          placeholder="Título da seção"
                          className="mt-1"
                          required
                        />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemoveSection(sectionIndex)}
                        disabled={optionSections.length <= 1}
                        className="h-8 w-8 text-destructive ml-2 self-end"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-red-500">Opções *</Label>
                      
                      <div className="space-y-3 mt-1">
                        {section.rows.map((row, rowIndex) => (
                          <div key={rowIndex} className="grid gap-2">
                            <div className="flex gap-2 items-start">
                              <div className="flex-1">
                                <Input
                                  value={row.title}
                                  onChange={(e) => handleRowTitleChange(sectionIndex, rowIndex, e.target.value)}
                                  placeholder={`Título da opção ${rowIndex + 1}`}
                                  required
                                />
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveRow(sectionIndex, rowIndex)}
                                disabled={section.rows.length <= 1}
                                className="h-8 w-8 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            <Input
                              value={row.description || ''}
                              onChange={(e) => handleRowDescriptionChange(sectionIndex, rowIndex, e.target.value)}
                              placeholder="Descrição (opcional)"
                              className="mt-1"
                            />
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddRow(sectionIndex)}
                        className="w-full mt-2"
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Adicionar opção
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowOptionListDialog(false);
                resetOptionListDialog();
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSendOptionList}
              disabled={
                !optionListTitle || 
                !optionListButtonLabel || 
                optionSections.length === 0 || 
                !optionSections.every(section => 
                  section.title.trim() && 
                  section.rows.length > 0 && 
                  section.rows.every(row => row.title.trim())
                )
              }
            >
              Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessageComposer;
