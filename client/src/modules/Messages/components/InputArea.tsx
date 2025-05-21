import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Smile, 
  Paperclip, 
  Send, 
  Image as ImageIcon, 
  FileText, 
  Mic, 
  Link2,
  X,
  Plus
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InputAreaProps {
  onSendMessage: (message: string, attachmentType?: string, attachmentData?: any) => void;
  isZapApiEnabled?: boolean;
}

export const InputArea = ({ onSendMessage, isZapApiEnabled = true }: InputAreaProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [interactiveDialogOpen, setInteractiveDialogOpen] = useState(false);
  const [interactiveType, setInteractiveType] = useState<"button" | "list">("button");
  const [interactiveMessage, setInteractiveMessage] = useState("");
  const [buttonOptions, setButtonOptions] = useState(["Opção 1", "Opção 2", "Opção 3"]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Array de sugestões da IA
  const aiSuggestions = [
    "Obrigado pelo seu contato! Como posso ajudar hoje?",
    "Entendido. Vou verificar isso para você.",
    "Poderia fornecer mais detalhes sobre sua solicitação?",
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };
  
  // Lidar com Enter para enviar (mas permitir Shift+Enter para nova linha)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage("");
      }
    }
  };

  // Simular gravação de áudio
  const handleRecordAudio = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Aqui seria implementada a lógica real de gravação
    } else {
      setIsRecording(false);
      // Simular envio de mensagem de áudio
      onSendMessage("mensagem-de-audio.mp3", "audio");
    }
  };

  // Função para enviar imagem
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Em uma implementação real, aqui enviaria o arquivo para um servidor
      // e receberia a URL da imagem. Estamos simulando com placeholder
      const imageUrl = URL.createObjectURL(file);
      onSendMessage(imageUrl, "image", { caption: file.name });
      
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Função para enviar documento
  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulando envio de documento
      onSendMessage(file.name, "document", { fileSize: formatFileSize(file.size) });
      
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Função para formatar o tamanho do arquivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Função para enviar mensagem interativa
  const handleSendInteractiveMessage = () => {
    if (interactiveMessage.trim()) {
      onSendMessage(
        interactiveMessage, 
        "interactive", 
        {
          type: interactiveType,
          options: buttonOptions,
          selected: buttonOptions[0]
        }
      );
      setInteractiveDialogOpen(false);
      setInteractiveMessage("");
    }
  };

  // Função para atualizar uma opção de botão específica
  const updateButtonOption = (index: number, value: string) => {
    const newOptions = [...buttonOptions];
    newOptions[index] = value;
    setButtonOptions(newOptions);
  };

  // Função para usar uma sugestão da IA
  const useSuggestion = (suggestion: string) => {
    setMessage(suggestion);
  };

  return (
    <div className="flex flex-col">
      {/* Área de sugestões da IA */}
      <div className="px-3 py-1.5 flex items-center space-x-2 overflow-x-auto">
        <div className="flex-shrink-0 text-xs text-purple-600 font-medium px-2">
          Sugestões da IA:
        </div>
        {aiSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => useSuggestion(suggestion)}
            className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 text-sm rounded-full hover:bg-gray-50"
          >
            {suggestion.length > 30 ? suggestion.substring(0, 30) + "..." : suggestion}
          </button>
        ))}
      </div>

      {/* Área de entrada de mensagem */}
      <form onSubmit={handleSubmit} className="p-2 border-t flex items-end">
        <div className="flex items-end gap-1 w-full rounded-full border bg-white p-1">
          {/* Botões de ação lateral esquerda */}
          <div className="flex gap-1">
            {/* Emoji picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-gray-100"
                >
                  <Smile className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-80">
                <div className="p-2">
                  <div className="text-sm font-medium mb-2">Emojis</div>
                  <div className="grid grid-cols-8 gap-2">
                    {["😊", "👍", "❤️", "😂", "🎉", "🙌", "🤔", "👏", "🔥", "✅", "⭐", "🌟", "💯", "🙏", "👌", "🤩"].map((emoji, i) => (
                      <button
                        key={i}
                        type="button"
                        className="h-8 w-8 flex items-center justify-center rounded hover:bg-muted"
                        onClick={() => setMessage(prev => prev + emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Anexo */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-gray-100"
                  disabled={!isZapApiEnabled}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-56">
                <div className="grid gap-1">
                  <Button 
                    variant="ghost" 
                    className="justify-start" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <span>Imagem</span>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      hidden 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.accept = "application/pdf,text/*,.doc,.docx,.xls,.xlsx";
                        fileInputRef.current.click();
                        fileInputRef.current.onchange = handleDocumentUpload as any;
                      }
                    }}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Documento</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                    onClick={handleRecordAudio}
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    <span>{isRecording ? "Parar Gravação" : "Áudio"}</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="justify-start"
                  >
                    <Link2 className="mr-2 h-4 w-4" />
                    <span>Link</span>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          
          {/* Campo de texto para mensagem */}
          <div className="flex-1 relative">
            <Textarea
              placeholder="Escreva sua mensagem..."
              className="min-h-[40px] max-h-[120px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isRecording}
              rows={1}
            />
            
            {/* Indicador de gravação */}
            {isRecording && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                <div className="animate-pulse mr-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500"></span>
                  <span className="ml-1 text-xs text-red-500">Gravando...</span>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6 text-red-500 hover:bg-red-500/10 rounded-full"
                  onClick={() => setIsRecording(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Botões de ação lateral direita */}
          <div className="flex gap-1">
            {/* Botão de mensagem interativa */}
            <Dialog open={interactiveDialogOpen} onOpenChange={setInteractiveDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full text-muted-foreground hover:bg-gray-100"
                  disabled={!isZapApiEnabled}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Criar Mensagem Interativa</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="button" onValueChange={(val) => setInteractiveType(val as any)}>
                  <TabsList className="w-full">
                    <TabsTrigger value="button" className="flex-1">Botões</TabsTrigger>
                    <TabsTrigger value="list" className="flex-1">Lista</TabsTrigger>
                  </TabsList>
                  <TabsContent value="button" className="pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="button-message">Mensagem</Label>
                        <Textarea 
                          id="button-message" 
                          placeholder="Digite a mensagem principal..." 
                          value={interactiveMessage}
                          onChange={(e) => setInteractiveMessage(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Opções de botão</Label>
                        {buttonOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={option} 
                              onChange={(e) => updateButtonOption(index, e.target.value)}
                              placeholder={`Opção ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="list" className="pt-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="list-message">Mensagem</Label>
                        <Textarea 
                          id="list-message" 
                          placeholder="Digite a mensagem principal..." 
                          value={interactiveMessage}
                          onChange={(e) => setInteractiveMessage(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Opções da lista</Label>
                        {buttonOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input 
                              value={option} 
                              onChange={(e) => updateButtonOption(index, e.target.value)}
                              placeholder={`Item ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setInteractiveDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSendInteractiveMessage}>
                    Enviar Mensagem
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Botão de enviar */}
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full text-primary bg-primary-50 hover:bg-primary-100"
              disabled={!message.trim() && !isRecording}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};