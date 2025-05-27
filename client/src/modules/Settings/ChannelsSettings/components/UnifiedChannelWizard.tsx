import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  CheckCircle,
  XCircle,
} from 'lucide-react';

import { SimpleQRCode } from '@/components/SimpleQRCode';
import { WhatsAppConnectionStatus } from '@/components/channel/WhatsAppConnectionStatus';

interface ZAPICredentials {
  instanceId: string;
  token: string;
  clientToken: string;
}

interface ZAPIChannel {
  id: number;
  name: string;
  description: string | null;
  type: string;
  configuration: ZAPICredentials | null;
  isActive: boolean;
}

interface UnifiedChannelWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChannelAdded?: () => void;
  existingChannelId?: number | null;
}

export function UnifiedChannelWizard({ 
  open, 
  onOpenChange, 
  onChannelAdded,
  existingChannelId = null
}: UnifiedChannelWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedChannelType, setSelectedChannelType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('credentials');
  
  const [channelConfigData, setChannelConfigData] = useState({
    name: '',
    description: 'Canal para comunicação com clientes',
    type: '',
    isActive: true,
    configuration: {
      instanceId: '',
      token: '',
      clientToken: '',
    }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);
  const [qrCodeStatus, setQrCodeStatus] = useState<'waiting' | 'connected' | 'error'>('waiting');
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    data: channels,
    isLoading: isLoadingChannels
  } = useQuery({
    queryKey: ['/api/marketing-channels/whatsapp'],
    queryFn: async () => {
      const response = await axios.get('/api/marketing-channels?type=whatsapp');
      return response.data as ZAPIChannel[];
    },
    enabled: open && existingChannelId !== null
  });
  
  const updateChannelMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await axios.put(`/api/marketing-channels/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Canal atualizado com sucesso',
        description: 'As configurações do canal foram salvas',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-channels/whatsapp'] });
      if (onChannelAdded) onChannelAdded();
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar canal',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    }
  });
  
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setCurrentStep(1);
        setSelectedChannelType(null);
        setSelectedProvider(null);
        setActiveTab('credentials');
        resetConfigData();
        setTestResults(null);
        setQrCodeData(null);
        setQrCodeStatus('waiting');
      }, 300);
    } else if (open && existingChannelId !== null) {
      loadExistingChannelData();
    }
  }, [open, existingChannelId]);
  
  const loadExistingChannelData = () => {
    if (!existingChannelId || !channels) return;
    
    const channel = channels.find(c => c.id === existingChannelId);
    if (channel && channel.configuration) {
      setSelectedChannelType('WhatsApp');
      setSelectedProvider('zapi');
      setCurrentStep(3); // Skip to configuration step
      
      setChannelConfigData({
        name: channel.name,
        description: channel.description || 'Canal para comunicação com clientes',
        type: channel.type,
        isActive: channel.isActive,
        configuration: {
          instanceId: channel.configuration.instanceId || '',
          token: channel.configuration.token || '',
          clientToken: channel.configuration.clientToken || '',
        }
      });
    }
  };
  
  const resetConfigData = () => {
    setChannelConfigData({
      name: '',
      description: 'Canal para comunicação com clientes',
      type: '',
      isActive: true,
      configuration: {
        instanceId: '',
        token: '',
        clientToken: '',
      }
    });
  };
  
  const handleSelectChannelType = (channelType: string) => {
    setSelectedChannelType(channelType);
    setChannelConfigData({
      ...channelConfigData,
      type: channelType.toLowerCase(),
      name: channelType === 'WhatsApp' ? 'Canal WhatsApp' : 
            channelType === 'Instagram' ? 'Instagram Direct' :
            channelType === 'Facebook' ? 'Facebook Messenger' :
            channelType === 'Email' ? 'Email Corporativo' :
            channelType === 'SMS' ? 'SMS Marketing' :
            channelType === 'Voice' ? 'Telefonia' :
            'Novo Canal'
    });
    
    setCurrentStep(channelType === 'WhatsApp' ? 2 : 3);
  };
  
  const handleSelectProvider = (provider: string) => {
    setSelectedProvider(provider);
    
    setChannelConfigData({
      ...channelConfigData,
      name: provider === 'zapi' ? 'WhatsApp Z-API' : 
            provider === 'meta' ? 'WhatsApp Business API' :
            provider === 'twilio' ? 'WhatsApp Twilio' :
            provider === 'gupshup' ? 'WhatsApp Gupshup' :
            'WhatsApp'
    });
    
    setCurrentStep(3);
  };
  
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
        console.log("QR Code recebido:", 
          response.data.qrCode.substring(0, 50) + 
          "... (comprimento total: " + response.data.qrCode.length + ")"
        );
        
        setQrCodeData(response.data.qrCode);
        setQrCodeStatus('waiting');
        setQrCodeDialogOpen(true);
        
        toast({
          title: 'QR Code gerado',
          description: 'Escaneie o QR Code com seu WhatsApp para conectar',
          variant: 'default',
        });
        
        startPollingConnectionStatus(zapiCredentials);
      } else if (response.data.connected || 
                (response.data.details && response.data.details.connected === true)) {
        setQrCodeStatus('connected');
        setQrCodeData(null); // Limpar QR code quando conectado
        
        toast({
          title: 'WhatsApp conectado',
          description: 'Esta instância já está conectada ao WhatsApp.',
          variant: 'default',
        });
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
  
  const startPollingConnectionStatus = (credentials: ZAPICredentials) => {
    let shouldContinuePolling = true;
    let pollCount = 0;
    const maxPolls = 30; // Máximo de tentativas (5 minutos, 10s cada)
    
    const checkStatus = async () => {
      if (!shouldContinuePolling || pollCount >= maxPolls) {
        console.log("Polling de status encerrado", 
          !shouldContinuePolling ? "manualmente" : "após máximo de tentativas");
        return;
      }
      
      pollCount++;
      console.log(`Verificando status de conexão (tentativa ${pollCount}/${maxPolls})...`);
      
      try {
        const response = await axios.post('/api/zapi/test-connection', credentials);
        
        const isConnected = 
          (response.data.success && response.data.status === 'connected') ||
          (response.data.details && response.data.details.connected === true);
        
        if (isConnected) {
          setQrCodeStatus('connected');
          setQrCodeData(null); // Limpar o QR code quando conectado
          
          toast({
            title: 'WhatsApp conectado!',
            description: 'Seu WhatsApp foi conectado com sucesso à Z-API.',
            variant: 'default',
          });
          
          shouldContinuePolling = false;
          return;
        } else {
          setTimeout(checkStatus, 10000);
        }
      } catch (error) {
        console.error("Erro ao verificar status de conexão:", error);
        setTimeout(checkStatus, 10000);
      }
    };
    
    setTimeout(checkStatus, 10000);
    
    return () => {
      shouldContinuePolling = false;
    };
  };
  
  const configureWebhook = async () => {
    if (!existingChannelId) return;
    
    setIsSubmitting(true);
    
    try {
      const zapiCredentials: ZAPICredentials = {
        instanceId: channelConfigData.configuration.instanceId,
        token: channelConfigData.configuration.token,
        clientToken: channelConfigData.configuration.clientToken
      };
      
      const webhookUrl = `${window.location.origin}/api/zapi/webhook/${existingChannelId}`;
      
      const response = await axios.post('/api/zapi/configure-webhook', {
        ...zapiCredentials,
        webhookUrl
      });
      
      if (response.data.success) {
        toast({
          title: 'Webhook configurado com sucesso',
          description: 'O webhook foi configurado na Z-API',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Falha ao configurar webhook',
          description: response.data.message || 'Não foi possível configurar o webhook',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao configurar webhook',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const saveChannel = async () => {
    setIsSubmitting(true);
    
    try {
      if (existingChannelId) {
        await updateChannelMutation.mutateAsync({
          id: existingChannelId,
          data: channelConfigData
        });
      } else {
        const response = await axios.post('/api/marketing-channels', channelConfigData);
        
        if (response.data) {
          toast({
            title: 'Canal criado com sucesso',
            description: 'O novo canal foi adicionado ao sistema',
            variant: 'default',
          });
          
          if (onChannelAdded) onChannelAdded();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar canal',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderQRCodeDialog = () => {
    return (
      <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code com seu WhatsApp para conectar
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-4">
            {isQrCodeLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin mb-2" />
                <p>Gerando QR Code...</p>
              </div>
            ) : qrCodeStatus === 'connected' ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">WhatsApp Conectado!</h3>
                <p>Seu WhatsApp foi conectado com sucesso à Z-API.</p>
              </div>
            ) : qrCodeStatus === 'error' ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Erro ao gerar QR Code</h3>
                <p>Não foi possível gerar o QR Code. Tente novamente.</p>
              </div>
            ) : qrCodeData ? (
              <div className="flex flex-col items-center justify-center">
                <SimpleQRCode qrCodeData={qrCodeData} size={250} />
                <p className="text-sm text-muted-foreground mt-4">
                  Abra o WhatsApp no seu celular, toque em Menu ou Configurações e selecione WhatsApp Web
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <XCircle className="h-16 w-16 text-red-500 mb-4" />
                <p>Nenhum QR Code disponível</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQrCodeDialogOpen(false)}
            >
              Fechar
            </Button>
            {qrCodeStatus !== 'connected' && (
              <Button
                onClick={getQRCode}
                disabled={isQrCodeLoading}
              >
                {isQrCodeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gerar Novo QR Code
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  const renderChannelTypeStep = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
        <Card 
          className={`cursor-pointer hover:border-primary ${
            selectedChannelType === 'WhatsApp' ? 'border-primary' : ''
          }`}
          onClick={() => handleSelectChannelType('WhatsApp')}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">WhatsApp</CardTitle>
              <MessageSquare className="h-6 w-6 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conecte-se com seus clientes via WhatsApp
            </p>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary opacity-50"
          onClick={() => toast({
            title: 'Em breve',
            description: 'Integração com Instagram em desenvolvimento',
            variant: 'default',
          })}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Instagram</CardTitle>
              <Instagram className="h-6 w-6 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conecte-se com seus clientes via Instagram Direct
            </p>
            <Badge variant="outline" className="mt-2">Em breve</Badge>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:border-primary opacity-50"
          onClick={() => toast({
            title: 'Em breve',
            description: 'Integração com Email em desenvolvimento',
            variant: 'default',
          })}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Email</CardTitle>
              <Mail className="h-6 w-6 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Conecte-se com seus clientes via Email
            </p>
            <Badge variant="outline" className="mt-2">Em breve</Badge>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderProviderStep = () => {
    return (
      <div className="py-4">
        <h3 className="text-lg font-medium mb-4">Selecione o provedor de WhatsApp</h3>
        
        <RadioGroup 
          defaultValue={selectedProvider || undefined}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div 
            className={`flex items-start space-x-3 border rounded-md p-4 cursor-pointer ${
              selectedProvider === 'zapi' ? 'border-primary' : 'border-input'
            }`}
            onClick={() => handleSelectProvider('zapi')}
          >
            <RadioGroupItem value="zapi" id="zapi" className="mt-1" />
            <div>
              <Label htmlFor="zapi" className="text-base font-medium">Z-API</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Integração oficial com Z-API para WhatsApp
              </p>
            </div>
          </div>
          
          <div 
            className="flex items-start space-x-3 border rounded-md p-4 cursor-pointer opacity-50"
            onClick={() => toast({
              title: 'Em breve',
              description: 'Integração com Meta Business API em desenvolvimento',
              variant: 'default',
            })}
          >
            <RadioGroupItem value="meta" id="meta" className="mt-1" disabled />
            <div>
              <Label htmlFor="meta" className="text-base font-medium">Meta Business API</Label>
              <p className="text-sm text-muted-foreground mt-1">
                API oficial do WhatsApp Business
              </p>
              <Badge variant="outline" className="mt-2">Em breve</Badge>
            </div>
          </div>
        </RadioGroup>
      </div>
    );
  };
  
  const renderConfigurationStep = () => {
    return (
      <div className="py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          <TabsContent value="credentials" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="instanceId">ID da Instância</Label>
                <Input
                  id="instanceId"
                  value={channelConfigData.configuration.instanceId}
                  onChange={(e) => handleConfigChange('instanceId', e.target.value, true)}
                  placeholder="Ex: 1A2B3C4D5E6F7G8H9I0J"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token">Token</Label>
                <Input
                  id="token"
                  value={channelConfigData.configuration.token}
                  onChange={(e) => handleConfigChange('token', e.target.value, true)}
                  placeholder="Ex: abcdef1234567890abcdef1234567890"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="clientToken">Client Token (opcional)</Label>
                <Input
                  id="clientToken"
                  value={channelConfigData.configuration.clientToken}
                  onChange={(e) => handleConfigChange('clientToken', e.target.value, true)}
                  placeholder="Ex: abcdef1234567890abcdef1234567890"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={testZAPIConnection}
                  disabled={isSubmitting || !channelConfigData.configuration.instanceId || !channelConfigData.configuration.token}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Testar Conexão
                </Button>
                
                <Button
                  variant="outline"
                  onClick={getQRCode}
                  disabled={isSubmitting || !channelConfigData.configuration.instanceId || !channelConfigData.configuration.token}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Gerar QR Code
                </Button>
              </div>
              
              {testResults && (
                <div className={`p-4 rounded-md ${
                  testResults.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <div className="flex items-center">
                    {testResults.success ? (
                      <Check className="h-5 w-5 mr-2" />
                    ) : (
                      <X className="h-5 w-5 mr-2" />
                    )}
                    <p>{testResults.message}</p>
                  </div>
                </div>
              )}
              
              {channelConfigData.configuration.instanceId && 
               channelConfigData.configuration.token && (
                <div className="pt-2">
                  <WhatsAppConnectionStatus 
                    instanceId={channelConfigData.configuration.instanceId}
                    token={channelConfigData.configuration.token}
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Canal</Label>
                <Input
                  id="name"
                  value={channelConfigData.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                  placeholder="Ex: WhatsApp Atendimento"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={channelConfigData.description || ''}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  placeholder="Ex: Canal para atendimento ao cliente"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="isActive"
                  checked={channelConfigData.isActive}
                  onCheckedChange={(checked) => handleConfigChange('isActive', checked)}
                />
                <Label htmlFor="isActive">Canal Ativo</Label>
              </div>
              
              {existingChannelId && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={configureWebhook}
                    disabled={isSubmitting}
                  >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Configurar Webhook
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Configura o webhook na Z-API para receber notificações de mensagens
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };
  
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderChannelTypeStep();
      case 2:
        return renderProviderStep();
      case 3:
        return renderConfigurationStep();
      default:
        return null;
    }
  };
  
  const renderNavButtons = () => {
    return (
      <div className="flex justify-between">
        {currentStep > 1 && (
          <Button
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={isSubmitting}
          >
            Voltar
          </Button>
        )}
        
        <div className="flex-1" />
        
        {currentStep < 3 ? (
          <Button
            onClick={() => {
              if (currentStep === 1 && !selectedChannelType) {
                toast({
                  title: 'Selecione um tipo de canal',
                  description: 'Você precisa selecionar um tipo de canal para continuar',
                  variant: 'destructive',
                });
                return;
              }
              
              if (currentStep === 2 && !selectedProvider) {
                toast({
                  title: 'Selecione um provedor',
                  description: 'Você precisa selecionar um provedor para continuar',
                  variant: 'destructive',
                });
                return;
              }
              
              setCurrentStep(currentStep + 1);
            }}
            disabled={isSubmitting}
          >
            Próximo
          </Button>
        ) : (
          <Button
            onClick={saveChannel}
            disabled={
              isSubmitting || 
              !channelConfigData.name || 
              !channelConfigData.configuration.instanceId || 
              !channelConfigData.configuration.token
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingChannelId ? 'Atualizar Canal' : 'Criar Canal'}
          </Button>
        )}
      </div>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>
            {existingChannelId ? 'Editar Canal' : 'Adicionar Novo Canal'}
          </DialogTitle>
          <DialogDescription>
            Configure as credenciais e configurações para este canal.
          </DialogDescription>
        </DialogHeader>
        
        {isLoadingChannels ? (
          <div className="text-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando informações do canal...</p>
          </div>
        ) : (
          <>
            {renderCurrentStep()}
            {renderNavButtons()}
            {renderQRCodeDialog()}
          </>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
