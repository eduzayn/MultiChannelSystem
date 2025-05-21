import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

// Icons
import {
  MessageSquare,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MessageSquareText,
  Loader2,
  QrCode,
  Check,
  X,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react';

import { SimpleQRCode } from '@/components/SimpleQRCode';

// Interfaces 
interface ZAPICredentials {
  instanceId: string;
  token: string;
  clientToken: string;
}

interface AddChannelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChannelAdded?: () => void;
}

export function AddChannelWizard({ open, onOpenChange, onChannelAdded }: AddChannelWizardProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChannelType, setSelectedChannelType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [channelFormTab, setChannelFormTab] = useState('credentials');
  
  // Channel configuration data
  const [channelConfigData, setChannelConfigData] = useState({
    name: '',
    description: 'Canal para comunicação com clientes',
    type: '',
    identifier: '',
    isActive: true,
    webhookUrl: 'https://api.minhaempresa.com/webhooks/tenant/123/channel/456',
    configuration: {
      instanceId: '',
      token: '',
      clientToken: ''
    }
  });
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);
  const [qrCodeStatus, setQrCodeStatus] = useState<'waiting' | 'connected' | 'error'>('waiting');
  
  const { toast } = useToast();
  
  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      // Reset all state when dialog closes
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedChannelType(null);
        setSelectedProvider(null);
        setChannelFormTab('credentials');
        setChannelConfigData({
          name: '',
          description: 'Canal para comunicação com clientes',
          type: '',
          identifier: '',
          isActive: true,
          webhookUrl: 'https://api.minhaempresa.com/webhooks/tenant/123/channel/456',
          configuration: {
            instanceId: '',
            token: '',
            clientToken: ''
          }
        });
        setTestResults(null);
        setQrCodeData(null);
        setQrCodeStatus('waiting');
      }, 300);
    }
  }, [open]);
  
  // Handle channel type selection
  const handleSelectChannelType = (channelType: string) => {
    setSelectedChannelType(channelType);
    setChannelConfigData({
      ...channelConfigData,
      type: channelType.toLowerCase(),
      name: channelType === 'WhatsApp' ? 'Canal WhatsApp' : 
            channelType === 'Instagram' ? 'Instagram Direct' :
            channelType === 'Email' ? 'Email Corporativo' :
            channelType === 'SMS' ? 'SMS Marketing' :
            'Novo Canal'
    });
    
    // If WhatsApp, next step is provider selection, otherwise go to config form
    setCurrentStep(channelType === 'WhatsApp' ? 2 : 3);
  };
  
  // Handle provider selection
  const handleSelectProvider = (provider: string) => {
    setSelectedProvider(provider);
    
    // Update channel name based on provider
    setChannelConfigData({
      ...channelConfigData,
      name: provider === 'zapi' ? 'WhatsApp Z-API' : 'WhatsApp Business API'
    });
    
    setCurrentStep(3);
  };
  
  // Generic input handler for channel configuration
  const handleConfigChange = (
    field: string, 
    value: string | boolean,
    isConfigField: boolean = false
  ) => {
    if (isConfigField) {
      setChannelConfigData({
        ...channelConfigData,
        configuration: {
          ...channelConfigData.configuration,
          [field]: value
        }
      });
    } else {
      setChannelConfigData({
        ...channelConfigData,
        [field]: value
      });
    }
  };
  
  // Test connection to Z-API 
  const testZAPIConnection = async () => {
    setIsSubmitting(true);
    setTestResults(null);
    
    try {
      const zapiCredentials: ZAPICredentials = {
        instanceId: channelConfigData.configuration.instanceId,
        token: channelConfigData.configuration.token,
        clientToken: channelConfigData.configuration.clientToken
      };
      
      const response = await axios.post('/api/zapi/test-connection', zapiCredentials);
      setTestResults(response.data);
      
      if (response.data.success) {
        toast({
          title: 'Conexão bem-sucedida',
          description: 'As credenciais da Z-API foram validadas com sucesso.',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Falha na conexão',
          description: response.data.message || 'Não foi possível conectar com a Z-API. Verifique suas credenciais.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      setTestResults({
        success: false,
        message: error.response?.data?.message || 'Erro ao conectar à Z-API'
      });
      
      toast({
        title: 'Erro ao testar conexão',
        description: error.response?.data?.message || 'Ocorreu um erro ao tentar conectar com o serviço.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get QR Code from Z-API
  const getQRCode = async () => {
    setIsQrCodeLoading(true);
    setQrCodeData(null);
    
    try {
      const zapiCredentials: ZAPICredentials = {
        instanceId: channelConfigData.configuration.instanceId,
        token: channelConfigData.configuration.token,
        clientToken: channelConfigData.configuration.clientToken
      };
      
      const response = await axios.post('/api/zapi/get-qrcode', zapiCredentials);
      
      if (response.data.success && response.data.qrCode) {
        console.log("QR Code recebido:", response.data.qrCode.substring(0, 50) + "...");
        setQrCodeData(response.data.qrCode);
        setQrCodeStatus('waiting');
        
        toast({
          title: 'QR Code gerado',
          description: 'Escaneie o QR Code com seu WhatsApp para conectar',
          variant: 'default',
        });
        
        // Start polling connection status
        startPollingConnectionStatus(zapiCredentials);
      } else {
        toast({
          title: 'Falha ao gerar QR Code',
          description: response.data.message || 'Não foi possível gerar o QR Code',
          variant: 'destructive',
        });
        setQrCodeStatus('error');
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar QR Code',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      setQrCodeStatus('error');
    } finally {
      setIsQrCodeLoading(false);
    }
  };
  
  // Poll connection status
  const startPollingConnectionStatus = (credentials: ZAPICredentials) => {
    // Check status initially after 10 seconds
    setTimeout(async () => {
      try {
        const response = await axios.post('/api/zapi/test-connection', credentials);
        
        if (response.data.success) {
          setQrCodeStatus('connected');
          toast({
            title: 'WhatsApp conectado!',
            description: 'Seu WhatsApp foi conectado com sucesso à Z-API.',
            variant: 'default',
          });
          
          // Stop polling
          return;
        } else {
          // Continue polling every 10 seconds
          setTimeout(() => startPollingConnectionStatus(credentials), 10000);
        }
      } catch (error) {
        console.error("Erro ao verificar status de conexão:", error);
        // Continue polling despite errors
        setTimeout(() => startPollingConnectionStatus(credentials), 10000);
      }
    }, 10000);
  };
  
  // Save the channel
  const saveChannel = async () => {
    setIsSubmitting(true);
    
    try {
      // Prepare the data based on the channel type and provider
      let channelData = {
        name: channelConfigData.name,
        description: channelConfigData.description,
        type: channelConfigData.type,
        isActive: channelConfigData.isActive,
        configuration: {}
      };
      
      // Add specific configuration based on channel type and provider
      if (selectedChannelType === 'WhatsApp' && selectedProvider === 'zapi') {
        channelData.configuration = {
          instanceId: channelConfigData.configuration.instanceId,
          token: channelConfigData.configuration.token,
          clientToken: channelConfigData.configuration.clientToken
        };
      }
      
      // Create the channel
      const response = await axios.post('/api/marketing-channels', channelData);
      
      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Canal criado com sucesso',
          description: 'O canal foi adicionado à sua conta',
          variant: 'default',
        });
        
        // Notify parent component and close dialog
        if (onChannelAdded) onChannelAdded();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao criar canal',
        description: error.response?.data?.message || 'Ocorreu um erro ao salvar o canal',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(channelConfigData.webhookUrl);
    toast({
      title: 'URL copiada',
      description: 'URL de webhook copiada para a área de transferência',
      variant: 'default',
    });
  };
  
  // Render channel type selection (Step 1)
  const renderChannelTypeSelection = () => {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Selecione o tipo de canal que deseja adicionar:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            onClick={() => handleSelectChannelType("WhatsApp")}
          >
            <MessageSquare className="h-10 w-10 mb-2 text-green-500" />
            <span>WhatsApp</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            onClick={() => handleSelectChannelType("Email")}
          >
            <Mail className="h-10 w-10 mb-2 text-blue-500" />
            <span>Email</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            onClick={() => handleSelectChannelType("Instagram")}
          >
            <Instagram className="h-10 w-10 mb-2 text-pink-500" />
            <span>Instagram Direct</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            disabled
          >
            <Phone className="h-10 w-10 mb-2 text-gray-500" />
            <span>SMS</span>
            <span className="text-xs mt-1">(Em breve)</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            disabled
          >
            <Facebook className="h-10 w-10 mb-2 text-gray-500" />
            <span>Facebook Messenger</span>
            <span className="text-xs mt-1">(Em breve)</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            disabled
          >
            <MessageSquareText className="h-10 w-10 mb-2 text-gray-500" />
            <span>Chat</span>
            <span className="text-xs mt-1">(Em breve)</span>
          </Button>
        </div>
      </div>
    );
  };
  
  // Render WhatsApp provider selection (Step 2)
  const renderWhatsAppProviderSelection = () => {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Como você deseja conectar o WhatsApp?</p>
        <div className="space-y-4">
          <div 
            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedProvider === 'zapi' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectProvider('zapi')}
          >
            <RadioGroup className="flex items-start gap-4">
              <div className="flex mt-1">
                <RadioGroupItem value="zapi" id="zapi" checked={selectedProvider === 'zapi'} className="mt-1" />
              </div>
              <div className="flex-1">
                <Label htmlFor="zapi" className="text-base font-medium block">Conexão via Z-API</Label>
                <Badge className="bg-yellow-100 text-yellow-800 border-0 mb-2">Requer celular conectado</Badge>
                <p className="text-sm text-muted-foreground">
                  Conecte-se usando Z-API, que permite integrar seu WhatsApp pessoal ou comercial via QR Code. 
                  Requer um celular dedicado com internet constante. Pode apresentar instabilidades se o celular ficar offline.
                </p>
              </div>
            </RadioGroup>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedProvider === 'api' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectProvider('api')}
          >
            <RadioGroup className="flex items-start gap-4">
              <div className="flex mt-1">
                <RadioGroupItem value="api" id="api" checked={selectedProvider === 'api'} className="mt-1" />
              </div>
              <div className="flex-1">
                <Label htmlFor="api" className="text-base font-medium block">API Oficial do WhatsApp Business</Label>
                <Badge className="bg-green-100 text-green-800 border-0 mb-2">Recomendado</Badge>
                <p className="text-sm text-muted-foreground">
                  Conecte-se usando um provedor oficial da API do WhatsApp Business como Gupshup, Twilio ou 360Dialog. 
                  Mais estável e em conformidade com os termos de uso do WhatsApp.
                </p>
                <Badge variant="outline" className="mt-2">Em breve</Badge>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    );
  };
  
  // Render channel configuration form (Step 3)
  const renderChannelConfigForm = () => {
    // Z-API WhatsApp configuration
    if (selectedChannelType === 'WhatsApp' && selectedProvider === 'zapi') {
      return (
        <div className="space-y-4">
          <Tabs value={channelFormTab} onValueChange={setChannelFormTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">Credenciais</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            {/* Credentials Tab */}
            <TabsContent value="credentials" className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel-name">Nome Personalizado do Canal</Label>
                <Input 
                  id="channel-name" 
                  placeholder="Ex: WhatsApp Vendas - Z-API" 
                  value={channelConfigData.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instance-id">ID da Instância Z-API</Label>
                <Input 
                  id="instance-id" 
                  placeholder="Ex: 3DF871A7ADFB20FB49998E66062CE0C1" 
                  value={channelConfigData.configuration.instanceId}
                  onChange={(e) => handleConfigChange('instanceId', e.target.value, true)}
                />
                <p className="text-xs text-muted-foreground">
                  O ID da sua instância na Z-API (disponível no painel da Z-API)
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token">Token da Instância Z-API</Label>
                <Input 
                  id="token" 
                  placeholder="Ex: A4E42029C248B72DA0842F47" 
                  value={channelConfigData.configuration.token}
                  onChange={(e) => handleConfigChange('token', e.target.value, true)}
                />
                <p className="text-xs text-muted-foreground">
                  O token de acesso à sua instância Z-API
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-token">Client Token Z-API</Label>
                <Input 
                  id="client-token" 
                  placeholder="Ex: Fc8381522d96c45888a430cfcbf4271d2S" 
                  value={channelConfigData.configuration.clientToken}
                  onChange={(e) => handleConfigChange('clientToken', e.target.value, true)}
                />
                <p className="text-xs text-muted-foreground">
                  O token de segurança da sua conta Z-API (Client-Token)
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={testZAPIConnection} 
                  disabled={isSubmitting}
                  variant="outline"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    'Testar Conexão'
                  )}
                </Button>
                <Button 
                  onClick={getQRCode} 
                  disabled={isQrCodeLoading || !channelConfigData.configuration.instanceId || !channelConfigData.configuration.token || !channelConfigData.configuration.clientToken}
                >
                  {isQrCodeLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Gerar QR Code para Conexão
                    </>
                  )}
                </Button>
              </div>
              
              {/* Test results */}
              {testResults && (
                <div className="mt-2 p-3 rounded-md border bg-muted/50">
                  {testResults.success ? (
                    <div className="flex items-center text-green-600">
                      <Check className="h-5 w-5 mr-2" />
                      <span>Conexão estabelecida com sucesso!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <X className="h-5 w-5 mr-2" />
                      <span>{testResults.message || 'Falha na conexão'}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* QR Code Display */}
              {qrCodeData && (
                <div className="mt-4 border rounded-md p-6 bg-white">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-semibold">Conecte seu WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">
                        Escaneie este QR Code no aplicativo WhatsApp
                      </p>
                    </div>
                    
                    <div className="p-4 border-2 border-primary/10 bg-white rounded-lg shadow-lg">
                      <SimpleQRCode qrCodeData={qrCodeData} size={250} isImageQRCode={true} />
                    </div>
                    
                    <div className="text-center mt-4">
                      {qrCodeStatus === 'waiting' && (
                        <div className="flex items-center justify-center space-x-2 text-amber-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Aguardando conexão...</span>
                        </div>
                      )}
                      
                      {qrCodeStatus === 'connected' && (
                        <div className="flex items-center justify-center space-x-2 text-green-600">
                          <Check className="h-5 w-5" />
                          <span>WhatsApp conectado com sucesso!</span>
                        </div>
                      )}
                      
                      {qrCodeStatus === 'error' && (
                        <div className="flex items-center justify-center space-x-2 text-red-600">
                          <RefreshCw className="h-4 w-4 mr-1" />
                          <Button size="sm" variant="outline" onClick={getQRCode}>
                            Gerar novo QR Code
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
            
            {/* Settings Tab */}
            <TabsContent value="settings" className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="channel-description">Descrição (opcional)</Label>
                <Input 
                  id="channel-description" 
                  placeholder="Ex: Canal para comunicação com clientes via WhatsApp" 
                  value={channelConfigData.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL de Webhook</Label>
                <div className="flex">
                  <Input 
                    id="webhook-url" 
                    value={channelConfigData.webhookUrl}
                    readOnly
                    className="flex-1 rounded-r-none border-r-0"
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-l-none" 
                    onClick={copyWebhookUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Use esta URL no painel da Z-API para configurar o webhook de eventos.
                </p>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  checked={channelConfigData.isActive}
                  onCheckedChange={(checked) => handleConfigChange('isActive', checked)}
                  id="channel-active"
                />
                <Label htmlFor="channel-active">Ativar canal ao criar</Label>
              </div>
              
              <div className="rounded-md border p-4 bg-amber-50 border-amber-200 text-amber-800 text-sm mt-4">
                <p className="font-medium mb-1">Importante:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>A conexão do WhatsApp requer um telefone com bateria carregada e conectado à internet.</li>
                  <li>Para receber atualizações de status e mensagens, configure a URL de webhook na Z-API.</li>
                  <li>O telefone conectado não deve ser usado para outras atividades.</li>
                </ul>
                <p className="mt-2">
                  <a href="https://developer.z-api.io/webhooks" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center">
                    Documentação da Z-API
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );
    } else if (selectedChannelType === 'Email') {
      // Email configuration (placeholder - to be fully implemented)
      return (
        <div className="space-y-4">
          <div className="rounded-md border p-4 bg-amber-50 border-amber-200 text-amber-800 text-sm">
            <p className="font-medium">Em desenvolvimento</p>
            <p>A integração com canais de email estará disponível em breve.</p>
          </div>
        </div>
      );
    } else if (selectedChannelType === 'Instagram') {
      // Instagram configuration (placeholder - to be fully implemented)
      return (
        <div className="space-y-4">
          <div className="rounded-md border p-4 bg-amber-50 border-amber-200 text-amber-800 text-sm">
            <p className="font-medium">Em desenvolvimento</p>
            <p>A integração com Instagram Direct estará disponível em breve.</p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  // Render dialog content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return renderChannelTypeSelection();
      case 2:
        return renderWhatsAppProviderSelection();
      case 3:
        return renderChannelConfigForm();
      default:
        return null;
    }
  };
  
  // Determine what the footer buttons should do
  const handleNext = () => {
    if (currentStep === 3) {
      // Save the channel if on the final step
      saveChannel();
    } else {
      // Otherwise move to the next step
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Check if the current step can be saved/advanced
  const canProceed = () => {
    if (currentStep === 1) {
      return selectedChannelType !== null;
    } else if (currentStep === 2) {
      return selectedProvider !== null;
    } else if (currentStep === 3) {
      // Different validation based on channel type and provider
      if (selectedChannelType === 'WhatsApp' && selectedProvider === 'zapi') {
        return (
          channelConfigData.name.trim() !== '' &&
          channelConfigData.configuration.instanceId.trim() !== '' &&
          channelConfigData.configuration.token.trim() !== '' &&
          channelConfigData.configuration.clientToken.trim() !== ''
        );
      }
      return false;
    }
    return false;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 ? 'Adicionar Novo Canal' : 
             currentStep === 2 ? 'Selecionar Provedor de WhatsApp' : 
             `Configurar ${selectedChannelType}`}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 1 ? 'Selecione o tipo de canal que deseja adicionar ao seu tenant.' :
             currentStep === 2 ? 'Escolha como você deseja conectar o WhatsApp.' :
             'Configure as credenciais e configurações para este canal.'}
          </DialogDescription>
        </DialogHeader>
        
        {renderStepContent()}
        
        <DialogFooter className="flex justify-between items-center">
          {currentStep > 1 ? (
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
              type="button"
            >
              Voltar
            </Button>
          ) : (
            <div />
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancelar
            </Button>
            
            <Button 
              onClick={handleNext} 
              type="button"
              disabled={!canProceed() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === 3 ? 'Salvando...' : 'Processando...'}
                </>
              ) : (
                currentStep === 3 ? 'Salvar Canal' : 'Continuar'
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}