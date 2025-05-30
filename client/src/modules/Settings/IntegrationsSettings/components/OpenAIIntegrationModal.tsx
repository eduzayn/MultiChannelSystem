import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OpenAIIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OpenAIIntegrationModal: React.FC<OpenAIIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [connectionName, setConnectionName] = useState('OpenAI Principal');
  const [apiKey, setApiKey] = useState('');
  const [chatModel, setChatModel] = useState('gpt-4o');
  const [embeddingModel, setEmbeddingModel] = useState('text-embedding-3-small');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectionTested, setIsConnectionTested] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { toast } = useToast();
  
  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        title: "Campo necessário",
        description: "Por favor, forneça uma chave de API para testar a conexão.",
        variant: "destructive"
      });
      return;
    }
    
    setTestStatus('loading');
    
    // Simular um teste de API
    setTimeout(() => {
      // Simulação - em produção, faria uma chamada real à API da OpenAI
      const success = apiKey.length > 10;
      
      setTestStatus(success ? 'success' : 'error');
      setIsConnectionTested(true);
      
      toast({
        title: success ? "Conexão bem-sucedida" : "Erro na conexão",
        description: success 
          ? "A chave de API foi validada com sucesso."
          : "Não foi possível validar a chave de API. Por favor, verifique e tente novamente.",
        variant: success ? "default" : "destructive"
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      toast({
        title: "Campo necessário",
        description: "Por favor, forneça uma chave de API.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulação de envio - em produção, faria uma chamada à API
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Integração salva com sucesso",
        description: "A integração com OpenAI foi configurada."
      });
      
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Conectar com OpenAI</DialogTitle>
            <DialogDescription>
              Configure a integração com a OpenAI para usar modelos de linguagem avançados na IA Prof. Ana.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="connectionName">Nome da Conexão</Label>
              <Input
                id="connectionName"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="ex: OpenAI Principal"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="apiKey">Chave de API (API Key)</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">
                Encontre sua chave de API no painel OpenAI em API Keys
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="chatModel">Modelo para Geração de Respostas</Label>
              <Select value={chatModel} onValueChange={setChatModel}>
                <SelectTrigger id="chatModel">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o-mini (Mais rápido)</SelectItem>
                  <SelectItem value="gpt-4.5-preview">GPT-4.5-preview (Experimental)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Este modelo será usado pela Prof. Ana para gerar respostas
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="embeddingModel">Modelo para Embeddings</Label>
              <Select value={embeddingModel} onValueChange={setEmbeddingModel}>
                <SelectTrigger id="embeddingModel">
                  <SelectValue placeholder="Selecione um modelo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-3-small">text-embedding-3-small (Recomendado)</SelectItem>
                  <SelectItem value="text-embedding-3-large">text-embedding-3-large (Mais preciso)</SelectItem>
                  <SelectItem value="text-embedding-ada-002">text-embedding-ada-002 (Legado)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Este modelo será usado para indexar e buscar na base de conhecimento
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex-col sm:flex-col space-y-2">
            <div className="flex w-full justify-between flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={!apiKey || testStatus === 'loading'}
              >
                {testStatus === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : testStatus === 'success' ? (
                  "Teste bem-sucedido"
                ) : testStatus === 'error' ? (
                  "Falha no teste"
                ) : (
                  "Testar Conexão"
                )}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar e Ativar"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};