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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AsaasIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AsaasIntegrationModal: React.FC<AsaasIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [connectionName, setConnectionName] = useState('Asaas Principal');
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState('sandbox');
  const [webhookToken, setWebhookToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isConnectionTested, setIsConnectionTested] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const { toast } = useToast();
  
  // URL do webhook que o tenant deve configurar na plataforma Asaas
  const webhookUrl = `https://api.suaapp.com/webhooks/tenant/12345/asaas/abcdef`;

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
      // Simulação - em produção, faria uma chamada real à API Asaas
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

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "URL do webhook foi copiada para a área de transferência."
    });
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
      setIsSubmitted(true);
      
      toast({
        title: "Integração salva com sucesso",
        description: "A integração com Asaas foi configurada."
      });
      
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Conectar com Asaas</DialogTitle>
            <DialogDescription>
              Configure a integração com o Asaas para gerenciar cobranças e receber atualizações de pagamento automaticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="connectionName">Nome da Conexão</Label>
              <Input
                id="connectionName"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="ex: Asaas Principal"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="apiKey">Chave de API (API Key)</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="$aact_YourAsaasApiKey"
              />
              <p className="text-xs text-muted-foreground">
                Encontre sua chave de API no painel da Asaas em Configurações &gt; Integrações &gt; API
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Ambiente</Label>
              <RadioGroup value={environment} onValueChange={setEnvironment}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sandbox" id="sandbox" />
                  <Label htmlFor="sandbox">Sandbox (Testes)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="production" id="production" />
                  <Label htmlFor="production">Produção</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-2 mt-2">
              <Label>URL do Webhook</Label>
              <div className="flex w-full items-center space-x-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="font-mono text-xs"
                />
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleCopyWebhook}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Configure esta URL como endpoint de webhook nas configurações da sua conta Asaas para receber notificações.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="webhookToken">Token de Autenticação do Webhook</Label>
              <Input
                id="webhookToken"
                type="password"
                value={webhookToken}
                onChange={(e) => setWebhookToken(e.target.value)}
                placeholder="Token configurado na Asaas"
              />
              <p className="text-xs text-muted-foreground">
                Configure um token de autenticação no painel da Asaas e adicione-o aqui.
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