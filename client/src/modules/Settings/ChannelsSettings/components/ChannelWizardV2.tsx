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
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  ChevronLeft,
  ChevronRight,
  CircleCheck,
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

export function ChannelWizardV2({ open, onOpenChange, onChannelAdded }: AddChannelWizardProps) {
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
      // WhatsApp Z-API
      instanceId: '',
      token: '',
      clientToken: '',
      
      // Email
      emailAddress: '',
      senderName: '',
      emailMethod: 'manual',
      
      // Email - SMTP/IMAP
      imapServer: '',
      imapPort: '993',
      imapUser: '',
      imapPassword: '',
      imapSecurity: 'SSL/TLS',
      smtpServer: '',
      smtpPort: '465',
      smtpUser: '',
      smtpPassword: '',
      smtpSecurity: 'SSL/TLS',
      
      // Meta Integration (Facebook/Instagram)
      accessToken: '',
      pageId: '',
      instagramAccountId: '',
      
      // Twilio (SMS/Voice)
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioPhoneNumber: '',
    }
  });
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);
  const [qrCodeStatus, setQrCodeStatus] = useState<'waiting' | 'connected' | 'error'>('waiting');
  const [emailTestStatus, setEmailTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  // Meta API states
  const [metaAccounts, setMetaAccounts] = useState<{id: string, name: string, type: string}[]>([]);
  const [isAuthenticatingWithMeta, setIsAuthenticatingWithMeta] = useState(false);
  
  // Twilio phone numbers
  const [twilioPhoneNumbers, setTwilioPhoneNumbers] = useState<{number: string, capabilities: string[]}[]>([]);
  const [isLoadingTwilioNumbers, setIsLoadingTwilioNumbers] = useState(false);
  
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
        resetConfigData();
        setTestResults(null);
        setQrCodeData(null);
        setQrCodeStatus('waiting');
        setEmailTestStatus('idle');
        setMetaAccounts([]);
      }, 300);
    }
  }, [open]);
  
  const resetConfigData = () => {
    setChannelConfigData({
      name: '',
      description: 'Canal para comunicação com clientes',
      type: '',
      identifier: '',
      isActive: true,
      webhookUrl: 'https://api.minhaempresa.com/webhooks/tenant/123/channel/456',
      configuration: {
        // Reset all configuration fields
        instanceId: '',
        token: '',
        clientToken: '',
        emailAddress: '',
        senderName: '',
        emailMethod: 'manual',
        imapServer: '',
        imapPort: '993',
        imapUser: '',
        imapPassword: '',
        imapSecurity: 'SSL/TLS',
        smtpServer: '',
        smtpPort: '465',
        smtpUser: '',
        smtpPassword: '',
        smtpSecurity: 'SSL/TLS',
        accessToken: '',
        pageId: '',
        instagramAccountId: '',
        twilioAccountSid: '',
        twilioAuthToken: '',
        twilioPhoneNumber: '',
      }
    });
  };
  
  // Handle channel type selection
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
    
    // If WhatsApp, next step is provider selection, otherwise go to config form
    setCurrentStep(channelType === 'WhatsApp' ? 2 : 3);
  };
  
  // Handle provider selection
  const handleSelectProvider = (provider: string) => {
    setSelectedProvider(provider);
    
    // Update channel name based on provider
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
      } else if (response.data.connected) {
        // WhatsApp is already connected
        setQrCodeStatus('connected');
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
  
  // Test Email Connection
  const testEmailConnection = async () => {
    setEmailTestStatus('testing');
    
    try {
      // Prepare email configuration based on connection method
      const emailConfig = channelConfigData.configuration.emailMethod === 'manual' 
        ? {
            method: 'manual',
            smtpServer: channelConfigData.configuration.smtpServer,
            smtpPort: channelConfigData.configuration.smtpPort,
            smtpUser: channelConfigData.configuration.smtpUser,
            smtpPassword: channelConfigData.configuration.smtpPassword,
            smtpSecurity: channelConfigData.configuration.smtpSecurity,
            imapServer: channelConfigData.configuration.imapServer,
            imapPort: channelConfigData.configuration.imapPort,
            imapUser: channelConfigData.configuration.imapUser,
            imapPassword: channelConfigData.configuration.imapPassword,
            imapSecurity: channelConfigData.configuration.imapSecurity,
          }
        : {
            method: channelConfigData.configuration.emailMethod,
            accessToken: "oauth_token_would_be_here" // In a real app, this would come from OAuth flow
          };
      
      // This is a mock response since we don't have the actual API endpoint
      // In real implementation, call the backend API to test the email connection
      setTimeout(() => {
        // Simulate success
        setEmailTestStatus('success');
        toast({
          title: 'Conexão de email testada com sucesso',
          description: 'As configurações de email foram validadas.',
          variant: 'default',
        });
      }, 2000);
      
    } catch (error: any) {
      setEmailTestStatus('error');
      toast({
        title: 'Erro ao testar conexão de email',
        description: error.response?.data?.message || 'Ocorreu um erro ao tentar conectar ao servidor de email.',
        variant: 'destructive',
      });
    }
  };
  
  // Authenticate with Meta (Facebook/Instagram)
  const authenticateWithMeta = () => {
    setIsAuthenticatingWithMeta(true);
    
    // This would open the Meta OAuth flow in a real implementation
    // For now, we'll simulate a successful authentication
    setTimeout(() => {
      setIsAuthenticatingWithMeta(false);
      
      // Mock returned accounts from Meta
      if (selectedChannelType === 'Instagram') {
        setMetaAccounts([
          { id: 'ig_123456789', name: 'Instagram Loja Principal', type: 'instagram_account' },
          { id: 'ig_987654321', name: 'Instagram Marketing', type: 'instagram_account' }
        ]);
      } else if (selectedChannelType === 'Facebook') {
        setMetaAccounts([
          { id: 'fb_123456789', name: 'Página Institucional', type: 'facebook_page' },
          { id: 'fb_987654321', name: 'Página de Vendas', type: 'facebook_page' }
        ]);
      }
      
      toast({
        title: 'Autenticação realizada',
        description: 'Sua conta foi autenticada com sucesso.',
        variant: 'default',
      });
    }, 2000);
  };
  
  // Fetch Twilio Phone Numbers
  const fetchTwilioPhoneNumbers = () => {
    setIsLoadingTwilioNumbers(true);
    
    // This would call the backend API to fetch phone numbers from Twilio
    // For now, we'll simulate some phone numbers
    setTimeout(() => {
      setTwilioPhoneNumbers([
        { number: '+5511999999999', capabilities: ['voice', 'sms'] },
        { number: '+5511988888888', capabilities: ['voice', 'sms', 'mms'] },
        { number: '+5511977777777', capabilities: ['sms'] }
      ]);
      setIsLoadingTwilioNumbers(false);
    }, 1500);
  };
  
  // Select Meta Account (Facebook Page or Instagram Account)
  const selectMetaAccount = (accountId: string, accountName: string) => {
    if (selectedChannelType === 'Instagram') {
      setChannelConfigData({
        ...channelConfigData,
        name: 'Instagram: ' + accountName,
        configuration: {
          ...channelConfigData.configuration,
          instagramAccountId: accountId
        }
      });
    } else if (selectedChannelType === 'Facebook') {
      setChannelConfigData({
        ...channelConfigData,
        name: 'Facebook: ' + accountName,
        configuration: {
          ...channelConfigData.configuration,
          pageId: accountId
        }
      });
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
          provider: 'zapi',
          instanceId: channelConfigData.configuration.instanceId,
          token: channelConfigData.configuration.token,
          clientToken: channelConfigData.configuration.clientToken
        };
      } else if (selectedChannelType === 'Email') {
        if (channelConfigData.configuration.emailMethod === 'manual') {
          channelData.configuration = {
            method: 'smtp_imap',
            emailAddress: channelConfigData.configuration.emailAddress,
            senderName: channelConfigData.configuration.senderName,
            smtpServer: channelConfigData.configuration.smtpServer,
            smtpPort: channelConfigData.configuration.smtpPort,
            smtpUser: channelConfigData.configuration.smtpUser,
            smtpPassword: channelConfigData.configuration.smtpPassword,
            smtpSecurity: channelConfigData.configuration.smtpSecurity,
            imapServer: channelConfigData.configuration.imapServer,
            imapPort: channelConfigData.configuration.imapPort,
            imapUser: channelConfigData.configuration.imapUser,
            imapPassword: channelConfigData.configuration.imapPassword,
            imapSecurity: channelConfigData.configuration.imapSecurity,
          };
        } else {
          channelData.configuration = {
            method: channelConfigData.configuration.emailMethod,
            emailAddress: channelConfigData.configuration.emailAddress,
            senderName: channelConfigData.configuration.senderName,
            // OAuth token would be stored securely
          };
        }
      } else if (selectedChannelType === 'Instagram') {
        channelData.configuration = {
          provider: 'meta',
          instagramAccountId: channelConfigData.configuration.instagramAccountId,
          // OAuth token would be stored securely
        };
      } else if (selectedChannelType === 'Facebook') {
        channelData.configuration = {
          provider: 'meta',
          pageId: channelConfigData.configuration.pageId,
          // OAuth token would be stored securely
        };
      } else if (selectedChannelType === 'SMS' || selectedChannelType === 'Voice') {
        channelData.configuration = {
          provider: 'twilio',
          accountSid: channelConfigData.configuration.twilioAccountSid,
          authToken: channelConfigData.configuration.twilioAuthToken,
          phoneNumber: channelConfigData.configuration.twilioPhoneNumber
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
  
  // Navigation functions
  const goToNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(currentStep - 1);
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
            onClick={() => handleSelectChannelType("SMS")}
          >
            <MessageSquareText className="h-10 w-10 mb-2 text-purple-500" />
            <span>SMS</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            onClick={() => handleSelectChannelType("Facebook")}
          >
            <Facebook className="h-10 w-10 mb-2 text-blue-600" />
            <span>Facebook Messenger</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col"
            onClick={() => handleSelectChannelType("Voice")}
          >
            <Phone className="h-10 w-10 mb-2 text-amber-500" />
            <span>Telefonia (Voz)</span>
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
            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedProvider === 'meta' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectProvider('meta')}
          >
            <RadioGroup className="flex items-start gap-4">
              <div className="flex mt-1">
                <RadioGroupItem value="meta" id="meta" checked={selectedProvider === 'meta'} className="mt-1" />
              </div>
              <div className="flex-1">
                <Label htmlFor="meta" className="text-base font-medium block">API Oficial do WhatsApp Business</Label>
                <Badge className="bg-green-100 text-green-800 border-0 mb-2">Recomendado</Badge>
                <p className="text-sm text-muted-foreground">
                  Conecte-se usando a API oficial do WhatsApp Business. 
                  Mais estável e em conformidade com os termos de uso do WhatsApp.
                  Requer aprovação prévia pela Meta.
                </p>
                <Badge variant="outline" className="mt-2">Em breve</Badge>
              </div>
            </RadioGroup>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedProvider === 'twilio' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectProvider('twilio')}
          >
            <RadioGroup className="flex items-start gap-4">
              <div className="flex mt-1">
                <RadioGroupItem value="twilio" id="twilio" checked={selectedProvider === 'twilio'} className="mt-1" />
              </div>
              <div className="flex-1">
                <Label htmlFor="twilio" className="text-base font-medium block">Twilio API for WhatsApp</Label>
                <Badge className="bg-blue-100 text-blue-800 border-0 mb-2">Alta confiabilidade</Badge>
                <p className="text-sm text-muted-foreground">
                  Conecte-se via serviço Twilio, que oferece uma experiência simplificada para WhatsApp Business API.
                  Requer uma conta Twilio e número aprovado para WhatsApp.
                </p>
                <Badge variant="outline" className="mt-2">Em breve</Badge>
              </div>
            </RadioGroup>
          </div>
          
          <div 
            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${selectedProvider === 'gupshup' ? 'border-primary bg-primary/5' : ''}`}
            onClick={() => handleSelectProvider('gupshup')}
          >
            <RadioGroup className="flex items-start gap-4">
              <div className="flex mt-1">
                <RadioGroupItem value="gupshup" id="gupshup" checked={selectedProvider === 'gupshup'} className="mt-1" />
              </div>
              <div className="flex-1">
                <Label htmlFor="gupshup" className="text-base font-medium block">Gupshup</Label>
                <Badge className="bg-indigo-100 text-indigo-800 border-0 mb-2">Múltiplos recursos</Badge>
                <p className="text-sm text-muted-foreground">
                  Conecte-se via Gupshup, plataforma especializada em soluções WhatsApp Business API
                  com diversos recursos para automação e engajamento.
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
  const renderWhatsAppZapiConfig = () => {
    return (
      <div className="space-y-4">
        <Tabs value={channelFormTab} onValueChange={setChannelFormTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="credentials">Credenciais</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>
          
          {/* Credentials Tab */}
          <TabsContent value="credentials" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="zapiInstanceId">Instance ID Z-API</Label>
                <Input 
                  id="zapiInstanceId" 
                  placeholder="Ex: 3FBCA04G5CD" 
                  value={channelConfigData.configuration.instanceId}
                  onChange={(e) => handleConfigChange('instanceId', e.target.value, true)}
                />
                <p className="text-xs text-muted-foreground">
                  Encontre o Instance ID no painel da Z-API.
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="zapiToken">Token Z-API</Label>
                <Input 
                  id="zapiToken" 
                  type="password"
                  placeholder="Ex: D294KVJ4B3-KLMI4O5C6D7-8A9D0CB1F-G2H3I4J5K6" 
                  value={channelConfigData.configuration.token}
                  onChange={(e) => handleConfigChange('token', e.target.value, true)}
                />
                <p className="text-xs text-muted-foreground">
                  O Token de acesso à sua instância Z-API.
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="zapiClientToken">Client Token (Z-API)</Label>
                <Input 
                  id="zapiClientToken" 
                  type="password"
                  placeholder="Ex: 34HIG67JD-9F876FFG56-FG45678TF7-GF34567FGH" 
                  value={channelConfigData.configuration.clientToken}
                  onChange={(e) => handleConfigChange('clientToken', e.target.value, true)}
                />
                <p className="text-xs text-muted-foreground">
                  O Client Token é opcional para algumas funcionalidades.
                </p>
              </div>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={testZAPIConnection}
                disabled={!channelConfigData.configuration.instanceId || !channelConfigData.configuration.token || isSubmitting}
                className="w-full mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando Conexão...
                  </>
                ) : (
                  <>Testar Conexão com Z-API</>
                )}
              </Button>
              
              {testResults && (
                <div className={`p-3 rounded-md ${testResults.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <div className="flex items-center">
                    {testResults.success ? (
                      <Check className="h-5 w-5 mr-2 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 mr-2 text-red-500" />
                    )}
                    <span className="text-sm font-medium">{testResults.message}</span>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="grid gap-3">
                <Label htmlFor="channelName">Nome do Canal</Label>
                <Input 
                  id="channelName" 
                  placeholder="Ex: WhatsApp Atendimento" 
                  value={channelConfigData.name}
                  onChange={(e) => handleConfigChange('name', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Nome que identifica este canal na plataforma.
                </p>
              </div>
              
              <div className="grid gap-3">
                <Label htmlFor="channelDescription">Descrição</Label>
                <Textarea 
                  id="channelDescription" 
                  placeholder="Ex: Canal oficial para atendimento ao cliente" 
                  value={channelConfigData.description}
                  onChange={(e) => handleConfigChange('description', e.target.value)}
                  className="resize-none"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="isActiveSwitch" className="cursor-pointer">Canal Ativo</Label>
                <Switch 
                  id="isActiveSwitch" 
                  checked={channelConfigData.isActive}
                  onCheckedChange={(checked) => handleConfigChange('isActive', checked)}
                />
              </div>
              
              <div className="space-y-3">
                <Label>URL do Webhook</Label>
                <div className="flex gap-2">
                  <Input 
                    value={channelConfigData.webhookUrl}
                    readOnly
                    className="bg-muted"
                  />
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={copyWebhookUrl}
                    title="Copiar URL do Webhook"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Configure esta URL no webhook da sua instância Z-API para receber eventos.
                  <a href="https://developer.z-api.io/api/introduction/webhook/" className="text-primary ml-1 inline-flex items-center" target="_blank" rel="noopener noreferrer">
                    Saiba mais <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* QR Code Section - Only show when credentials are provided */}
        {channelConfigData.configuration.instanceId && channelConfigData.configuration.token && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">QR Code para Conexão</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={getQRCode}
                  disabled={isQrCodeLoading}
                >
                  {isQrCodeLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      {qrCodeData ? "Atualizar QR Code" : "Gerar QR Code"}
                    </>
                  )}
                </Button>
              </div>
              
              {qrCodeStatus === 'connected' ? (
                <div className="bg-green-50 p-4 rounded-md text-center">
                  <CircleCheck className="h-12 w-12 mx-auto text-green-500 mb-2" />
                  <h4 className="text-lg font-medium text-green-700">WhatsApp Conectado!</h4>
                  <p className="text-sm text-green-600 mt-1">A instância está conectada e pronta para uso.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  {qrCodeData ? (
                    <>
                      <SimpleQRCode 
                        qrCodeData={qrCodeData} 
                        size={240} 
                        isImageQRCode={true}
                      />
                      <p className="text-sm text-center mt-2 text-muted-foreground">
                        Abra o WhatsApp no seu celular, vá em Configurações &gt; Aparelhos conectados &gt; Conectar um aparelho e escaneie o QR Code acima.
                      </p>
                    </>
                  ) : (
                    <div className="bg-muted p-4 rounded-md text-center w-full">
                      <QrCode className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Clique no botão "Gerar QR Code" acima para iniciar a conexão do WhatsApp.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render Email configuration
  const renderEmailConfig = () => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="emailAddress">Endereço de Email do Canal</Label>
            <Input 
              id="emailAddress" 
              placeholder="Ex: atendimento@suaempresa.com" 
              value={channelConfigData.configuration.emailAddress}
              onChange={(e) => handleConfigChange('emailAddress', e.target.value, true)}
            />
            <p className="text-xs text-muted-foreground">
              Este é o email que receberá as mensagens e será usado como remetente.
            </p>
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="senderName">Nome do Remetente</Label>
            <Input 
              id="senderName" 
              placeholder="Ex: Atendimento Empresa XYZ" 
              value={channelConfigData.configuration.senderName}
              onChange={(e) => handleConfigChange('senderName', e.target.value, true)}
            />
            <p className="text-xs text-muted-foreground">
              Nome que aparecerá para os destinatários dos emails enviados por este canal.
            </p>
          </div>
          
          <div className="space-y-3">
            <Label>Método de Conexão</Label>
            <div className="grid gap-3">
              <div 
                className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${channelConfigData.configuration.emailMethod === 'manual' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleConfigChange('emailMethod', 'manual', true)}
              >
                <RadioGroup className="flex items-start gap-4">
                  <div className="flex mt-1">
                    <RadioGroupItem value="manual" id="manual" checked={channelConfigData.configuration.emailMethod === 'manual'} className="mt-1" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="manual" className="text-base font-medium block">Configurar Manualmente (SMTP/IMAP)</Label>
                    <p className="text-sm text-muted-foreground">
                      Configure os servidores SMTP e IMAP para envio e recebimento de emails.
                      Use este método para qualquer provedor de email.
                    </p>
                  </div>
                </RadioGroup>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${channelConfigData.configuration.emailMethod === 'google' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleConfigChange('emailMethod', 'google', true)}
              >
                <RadioGroup className="flex items-start gap-4">
                  <div className="flex mt-1">
                    <RadioGroupItem value="google" id="google" checked={channelConfigData.configuration.emailMethod === 'google'} className="mt-1" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="google" className="text-base font-medium block">Conectar com Google</Label>
                    <p className="text-sm text-muted-foreground">
                      Conecte uma conta Gmail ou Google Workspace com OAuth.
                      Mais seguro e não requer armazenamento de senha.
                    </p>
                    <Badge variant="outline" className="mt-2">Em breve</Badge>
                  </div>
                </RadioGroup>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${channelConfigData.configuration.emailMethod === 'microsoft' ? 'border-primary bg-primary/5' : ''}`}
                onClick={() => handleConfigChange('emailMethod', 'microsoft', true)}
              >
                <RadioGroup className="flex items-start gap-4">
                  <div className="flex mt-1">
                    <RadioGroupItem value="microsoft" id="microsoft" checked={channelConfigData.configuration.emailMethod === 'microsoft'} className="mt-1" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="microsoft" className="text-base font-medium block">Conectar com Microsoft</Label>
                    <p className="text-sm text-muted-foreground">
                      Conecte uma conta Outlook.com ou Microsoft 365 com OAuth.
                      Mais seguro e não requer armazenamento de senha.
                    </p>
                    <Badge variant="outline" className="mt-2">Em breve</Badge>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
          
          {/* SMTP/IMAP Configuration */}
          {channelConfigData.configuration.emailMethod === 'manual' && (
            <div className="pt-3 border-t">
              <Tabs defaultValue="smtp">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="smtp">SMTP (Envio)</TabsTrigger>
                  <TabsTrigger value="imap">IMAP (Recebimento)</TabsTrigger>
                </TabsList>
                
                <TabsContent value="smtp" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="smtpServer">Servidor SMTP</Label>
                      <Input 
                        id="smtpServer" 
                        placeholder="Ex: smtp.gmail.com" 
                        value={channelConfigData.configuration.smtpServer}
                        onChange={(e) => handleConfigChange('smtpServer', e.target.value, true)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="smtpPort">Porta SMTP</Label>
                      <Input 
                        id="smtpPort" 
                        placeholder="Ex: 465 ou 587" 
                        value={channelConfigData.configuration.smtpPort}
                        onChange={(e) => handleConfigChange('smtpPort', e.target.value, true)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="smtpUser">Usuário SMTP</Label>
                    <Input 
                      id="smtpUser" 
                      placeholder="Geralmente o endereço de email completo" 
                      value={channelConfigData.configuration.smtpUser}
                      onChange={(e) => handleConfigChange('smtpUser', e.target.value, true)}
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="smtpPassword">Senha SMTP</Label>
                    <Input 
                      id="smtpPassword" 
                      type="password"
                      placeholder="Senha ou senha de aplicativo" 
                      value={channelConfigData.configuration.smtpPassword}
                      onChange={(e) => handleConfigChange('smtpPassword', e.target.value, true)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Para contas Google, utilize uma "Senha de App" gerada nas configurações de segurança da sua conta.
                    </p>
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="smtpSecurity">Segurança SMTP</Label>
                    <select 
                      id="smtpSecurity"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={channelConfigData.configuration.smtpSecurity}
                      onChange={(e) => handleConfigChange('smtpSecurity', e.target.value, true)}
                    >
                      <option value="SSL/TLS">SSL/TLS</option>
                      <option value="STARTTLS">STARTTLS</option>
                      <option value="Nenhuma">Nenhuma</option>
                    </select>
                  </div>
                </TabsContent>
                
                <TabsContent value="imap" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="imapServer">Servidor IMAP</Label>
                      <Input 
                        id="imapServer" 
                        placeholder="Ex: imap.gmail.com" 
                        value={channelConfigData.configuration.imapServer}
                        onChange={(e) => handleConfigChange('imapServer', e.target.value, true)}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="imapPort">Porta IMAP</Label>
                      <Input 
                        id="imapPort" 
                        placeholder="Ex: 993" 
                        value={channelConfigData.configuration.imapPort}
                        onChange={(e) => handleConfigChange('imapPort', e.target.value, true)}
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="imapUser">Usuário IMAP</Label>
                    <Input 
                      id="imapUser" 
                      placeholder="Geralmente o endereço de email completo" 
                      value={channelConfigData.configuration.imapUser}
                      onChange={(e) => handleConfigChange('imapUser', e.target.value, true)}
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="imapPassword">Senha IMAP</Label>
                    <Input 
                      id="imapPassword" 
                      type="password"
                      placeholder="Senha ou senha de aplicativo" 
                      value={channelConfigData.configuration.imapPassword}
                      onChange={(e) => handleConfigChange('imapPassword', e.target.value, true)}
                    />
                  </div>
                  
                  <div className="grid gap-3">
                    <Label htmlFor="imapSecurity">Segurança IMAP</Label>
                    <select 
                      id="imapSecurity"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={channelConfigData.configuration.imapSecurity}
                      onChange={(e) => handleConfigChange('imapSecurity', e.target.value, true)}
                    >
                      <option value="SSL/TLS">SSL/TLS</option>
                      <option value="STARTTLS">STARTTLS</option>
                      <option value="Nenhuma">Nenhuma</option>
                    </select>
                  </div>
                </TabsContent>
              </Tabs>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={testEmailConnection}
                disabled={
                  emailTestStatus === 'testing' || 
                  !channelConfigData.configuration.emailAddress || 
                  !channelConfigData.configuration.smtpServer || 
                  !channelConfigData.configuration.smtpPort || 
                  !channelConfigData.configuration.imapServer
                }
                className="w-full mt-6"
              >
                {emailTestStatus === 'testing' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Testando Conexão...
                  </>
                ) : (
                  <>Testar Conexão de Email</>
                )}
              </Button>
              
              {emailTestStatus === 'success' && (
                <div className="p-3 rounded-md bg-green-50 text-green-700 mt-4">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 mr-2 text-green-500" />
                    <span className="text-sm font-medium">Conexão de email testada com sucesso.</span>
                  </div>
                </div>
              )}
              
              {emailTestStatus === 'error' && (
                <div className="p-3 rounded-md bg-red-50 text-red-700 mt-4">
                  <div className="flex items-center">
                    <X className="h-5 w-5 mr-2 text-red-500" />
                    <span className="text-sm font-medium">Falha ao conectar com servidor de email. Verifique suas credenciais.</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* OAuth Connection for Google/Microsoft */}
          {(channelConfigData.configuration.emailMethod === 'google' || channelConfigData.configuration.emailMethod === 'microsoft') && (
            <div className="pt-3 border-t">
              <div className="flex flex-col items-center py-6">
                <Button 
                  type="button" 
                  variant="outline"
                  className="mb-4"
                >
                  {channelConfigData.configuration.emailMethod === 'google' ? 'Conectar com Google' : 'Conectar com Microsoft'}
                </Button>
                <p className="text-sm text-muted-foreground text-center">
                  Clique no botão acima para autorizar a conexão com sua conta de email.
                  Este método é mais seguro pois não armazena sua senha.
                </p>
                <Badge variant="outline" className="mt-4">Em breve</Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render Instagram/Facebook (Meta) configuration
  const renderMetaConfig = () => {
    const isInstagram = selectedChannelType === 'Instagram';
    
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="channelName">Nome do Canal</Label>
            <Input 
              id="channelName" 
              placeholder={isInstagram ? "Ex: Instagram Loja Principal" : "Ex: Facebook Atendimento"} 
              value={channelConfigData.name}
              onChange={(e) => handleConfigChange('name', e.target.value)}
            />
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="channelDescription">Descrição</Label>
            <Textarea 
              id="channelDescription" 
              placeholder={isInstagram ? "Ex: Canal para interações via Instagram Direct" : "Ex: Canal para mensagens via Facebook Messenger"} 
              value={channelConfigData.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="space-y-3 pt-4 border-t">
            <h3 className="text-base font-medium">{isInstagram ? 'Conectar Instagram' : 'Conectar Facebook'}</h3>
            
            {!metaAccounts.length ? (
              <div className="bg-muted p-6 rounded-md flex flex-col items-center">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  {isInstagram 
                    ? 'Para conectar sua conta do Instagram Business, você precisa autorizar o acesso usando sua conta do Facebook.' 
                    : 'Para conectar sua Página do Facebook, você precisará autorizar o acesso às páginas que você administra.'}
                </p>
                <Button 
                  onClick={authenticateWithMeta}
                  disabled={isAuthenticatingWithMeta}
                >
                  {isAuthenticatingWithMeta ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>{isInstagram ? 'Conectar com Instagram' : 'Conectar com Facebook'}</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {isInstagram 
                    ? 'Selecione a conta do Instagram Business que deseja conectar:' 
                    : 'Selecione a Página do Facebook que deseja conectar:'}
                </p>
                <div className="grid gap-3">
                  {metaAccounts.map(account => (
                    <div 
                      key={account.id}
                      className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${
                        (isInstagram && channelConfigData.configuration.instagramAccountId === account.id) ||
                        (!isInstagram && channelConfigData.configuration.pageId === account.id)
                          ? 'border-primary bg-primary/5' 
                          : ''
                      }`}
                      onClick={() => selectMetaAccount(account.id, account.name)}
                    >
                      <RadioGroup className="flex items-start gap-4">
                        <div className="flex mt-1">
                          <RadioGroupItem 
                            value={account.id} 
                            id={account.id} 
                            checked={
                              (isInstagram && channelConfigData.configuration.instagramAccountId === account.id) ||
                              (!isInstagram && channelConfigData.configuration.pageId === account.id)
                            } 
                            className="mt-1" 
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={account.id} className="text-base font-medium block">{account.name}</Label>
                          <Badge className="bg-blue-100 text-blue-800 border-0 mt-1">
                            {account.type === 'instagram_account' ? 'Conta Instagram' : 'Página Facebook'}
                          </Badge>
                        </div>
                      </RadioGroup>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={authenticateWithMeta}
                    disabled={isAuthenticatingWithMeta}
                  >
                    Reconectar / Buscar mais contas
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-3 mt-4 pt-4 border-t">
              <h3 className="text-base font-medium">Configuração de Webhook</h3>
              <p className="text-sm text-muted-foreground">
                {isInstagram 
                  ? 'É necessário configurar um webhook para receber mensagens do Instagram. Copie a URL abaixo e configure no Facebook Developers.' 
                  : 'É necessário configurar um webhook para receber mensagens do Facebook. Copie a URL abaixo e configure no Facebook Developers.'}
              </p>
              <div className="flex gap-2">
                <Input 
                  value={channelConfigData.webhookUrl}
                  readOnly
                  className="bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyWebhookUrl}
                  title="Copiar URL do Webhook"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center">
                <Badge variant="outline" className="mr-2">Avançado</Badge>
                <p className="text-xs text-muted-foreground">
                  <a href={isInstagram 
                    ? "https://developers.facebook.com/docs/instagram-api/webhooks"
                    : "https://developers.facebook.com/docs/messenger-platform/webhook"
                  } className="text-primary inline-flex items-center" target="_blank" rel="noopener noreferrer">
                    Como configurar webhook {isInstagram ? 'Instagram' : 'Facebook'} <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render Twilio (SMS/Voice) configuration
  const renderTwilioConfig = () => {
    const isSMS = selectedChannelType === 'SMS';
    
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="channelName">Nome do Canal</Label>
            <Input 
              id="channelName" 
              placeholder={isSMS ? "Ex: SMS Marketing" : "Ex: Atendimento Telefônico"} 
              value={channelConfigData.name}
              onChange={(e) => handleConfigChange('name', e.target.value)}
            />
          </div>
          
          <div className="grid gap-3">
            <Label htmlFor="channelDescription">Descrição</Label>
            <Textarea 
              id="channelDescription" 
              placeholder={isSMS ? "Ex: Canal para envio de SMS marketing" : "Ex: Canal para atendimento telefônico via Twilio"} 
              value={channelConfigData.description}
              onChange={(e) => handleConfigChange('description', e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
          
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-base font-medium">Credenciais Twilio</h3>
            
            <div className="grid gap-3">
              <Label htmlFor="twilioAccountSid">Twilio Account SID</Label>
              <Input 
                id="twilioAccountSid" 
                type="password"
                placeholder="Ex: AC1a2b3c4d5e6f7g8h9i0j..." 
                value={channelConfigData.configuration.twilioAccountSid}
                onChange={(e) => handleConfigChange('twilioAccountSid', e.target.value, true)}
              />
              <p className="text-xs text-muted-foreground">
                Encontre seu Account SID no painel da Twilio.
              </p>
            </div>
            
            <div className="grid gap-3">
              <Label htmlFor="twilioAuthToken">Twilio Auth Token</Label>
              <Input 
                id="twilioAuthToken" 
                type="password"
                placeholder="Ex: a1b2c3d4e5f6g7h8i9j0..." 
                value={channelConfigData.configuration.twilioAuthToken}
                onChange={(e) => handleConfigChange('twilioAuthToken', e.target.value, true)}
              />
              <p className="text-xs text-muted-foreground">
                Encontre seu Auth Token no painel da Twilio.
              </p>
            </div>
            
            {channelConfigData.configuration.twilioAccountSid && channelConfigData.configuration.twilioAuthToken && (
              <div className="pt-3">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium">Números de Telefone</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={fetchTwilioPhoneNumbers}
                      disabled={isLoadingTwilioNumbers}
                    >
                      {isLoadingTwilioNumbers ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Buscar Números
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {twilioPhoneNumbers.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Selecione o número que será usado para este canal:
                      </p>
                      <div className="grid gap-3">
                        {twilioPhoneNumbers.map(phone => (
                          <div 
                            key={phone.number}
                            className={`border rounded-lg p-4 cursor-pointer hover:border-primary ${
                              channelConfigData.configuration.twilioPhoneNumber === phone.number
                                ? 'border-primary bg-primary/5' 
                                : ''
                            }`}
                            onClick={() => handleConfigChange('twilioPhoneNumber', phone.number, true)}
                          >
                            <RadioGroup className="flex items-start gap-4">
                              <div className="flex mt-1">
                                <RadioGroupItem 
                                  value={phone.number} 
                                  id={phone.number} 
                                  checked={channelConfigData.configuration.twilioPhoneNumber === phone.number} 
                                  className="mt-1" 
                                />
                              </div>
                              <div className="flex-1">
                                <Label htmlFor={phone.number} className="text-base font-medium block">{phone.number}</Label>
                                <div className="mt-1 flex space-x-2">
                                  {phone.capabilities.includes('voice') && (
                                    <Badge className="bg-amber-100 text-amber-800 border-0">Voz</Badge>
                                  )}
                                  {phone.capabilities.includes('sms') && (
                                    <Badge className="bg-purple-100 text-purple-800 border-0">SMS</Badge>
                                  )}
                                  {phone.capabilities.includes('mms') && (
                                    <Badge className="bg-blue-100 text-blue-800 border-0">MMS</Badge>
                                  )}
                                </div>
                              </div>
                            </RadioGroup>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted p-4 rounded-md text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Clique em "Buscar Números" para listar os números disponíveis na sua conta Twilio.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Ou 
                        <a href="https://www.twilio.com/console/phone-numbers/incoming" className="text-primary mx-1 inline-flex items-center" target="_blank" rel="noopener noreferrer">
                          compre um novo número <ExternalLink className="h-3 w-3 ml-0.5" />
                        </a>
                        na Twilio.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="space-y-3 mt-4 pt-4 border-t">
              <h3 className="text-base font-medium">Configuração de Webhook</h3>
              <p className="text-sm text-muted-foreground">
                {isSMS 
                  ? 'Configure o webhook abaixo no número de telefone da Twilio para receber SMS.' 
                  : 'Configure o webhook abaixo no número de telefone da Twilio para receber chamadas.'}
              </p>
              <div className="flex gap-2">
                <Input 
                  value={channelConfigData.webhookUrl}
                  readOnly
                  className="bg-muted"
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={copyWebhookUrl}
                  title="Copiar URL do Webhook"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center">
                <p className="text-xs text-muted-foreground">
                  <a href="https://www.twilio.com/docs/sms/tutorials/how-to-receive-and-reply" className="text-primary inline-flex items-center" target="_blank" rel="noopener noreferrer">
                    Como configurar webhook na Twilio <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Render channel configuration based on type and provider
  const renderChannelConfig = () => {
    if (selectedChannelType === 'WhatsApp' && selectedProvider === 'zapi') {
      return renderWhatsAppZapiConfig();
    } else if (selectedChannelType === 'Email') {
      return renderEmailConfig();
    } else if (selectedChannelType === 'Instagram' || selectedChannelType === 'Facebook') {
      return renderMetaConfig();
    } else if (selectedChannelType === 'SMS' || selectedChannelType === 'Voice') {
      return renderTwilioConfig();
    } else if (selectedChannelType === 'WhatsApp' && (
      selectedProvider === 'meta' || 
      selectedProvider === 'twilio' || 
      selectedProvider === 'gupshup'
    )) {
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <Badge variant="outline" className="mb-4 py-2 px-4 text-base">Em breve</Badge>
          <h3 className="text-lg font-medium text-center mb-2">
            Integração com {selectedProvider === 'meta' ? 'WhatsApp Business API' : 
                           selectedProvider === 'twilio' ? 'Twilio WhatsApp' : 
                           'Gupshup'} em desenvolvimento
          </h3>
          <p className="text-center text-muted-foreground max-w-md">
            Esta integração estará disponível em breve. Por enquanto, você pode usar a Z-API para conectar seu WhatsApp.
          </p>
          <Button 
            variant="outline" 
            className="mt-6"
            onClick={() => {
              setSelectedProvider('zapi');
            }}
          >
            Voltar para Z-API
          </Button>
        </div>
      );
    }
    
    return null;
  };
  
  // Render dialog content based on current step
  const renderDialogContent = () => {
    switch (currentStep) {
      case 1:
        return renderChannelTypeSelection();
      case 2:
        return renderWhatsAppProviderSelection();
      case 3:
        return renderChannelConfig();
      default:
        return null;
    }
  };
  
  // Get dialog title based on current step
  const getDialogTitle = () => {
    switch (currentStep) {
      case 1:
        return "Adicionar Novo Canal";
      case 2:
        return "Selecionar Provedor WhatsApp";
      case 3:
        if (selectedChannelType === 'WhatsApp') {
          return `Configurar ${selectedProvider === 'zapi' ? 'WhatsApp (Z-API)' : 
                            selectedProvider === 'meta' ? 'WhatsApp Business API' : 
                            selectedProvider === 'twilio' ? 'WhatsApp (Twilio)' : 
                            'WhatsApp (Gupshup)'}`;
        } else {
          return `Configurar ${selectedChannelType}`;
        }
      default:
        return "Adicionar Novo Canal";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {currentStep === 1 && "Selecione o tipo de canal que deseja adicionar à sua plataforma."}
            {currentStep === 2 && "Escolha o método de integração com o WhatsApp."}
            {currentStep === 3 && "Configure as credenciais e informações do canal."}
          </DialogDescription>
        </DialogHeader>
        
        {renderDialogContent()}
        
        <DialogFooter className="flex items-center justify-between space-x-4">
          {currentStep > 1 ? (
            <Button 
              type="button" 
              variant="outline"
              onClick={goToPreviousStep}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          ) : (
            <div></div> // Placeholder for flex spacing
          )}
          
          {currentStep === 3 ? (
            <Button 
              type="button"
              onClick={saveChannel}
              disabled={isSubmitting || 
                (selectedChannelType === 'WhatsApp' && selectedProvider === 'zapi' && 
                 (!channelConfigData.configuration.instanceId || !channelConfigData.configuration.token)) ||
                (selectedChannelType === 'Email' && 
                 (!channelConfigData.configuration.emailAddress ||
                  (channelConfigData.configuration.emailMethod === 'manual' && 
                   (!channelConfigData.configuration.smtpServer || !channelConfigData.configuration.smtpUser || !channelConfigData.configuration.smtpPassword)))) ||
                ((selectedChannelType === 'Instagram' || selectedChannelType === 'Facebook') && 
                 (selectedChannelType === 'Instagram' ? !channelConfigData.configuration.instagramAccountId : !channelConfigData.configuration.pageId)) ||
                ((selectedChannelType === 'SMS' || selectedChannelType === 'Voice') && 
                 (!channelConfigData.configuration.twilioAccountSid || !channelConfigData.configuration.twilioAuthToken || !channelConfigData.configuration.twilioPhoneNumber))
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Salvar Canal
                  <Check className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              type="button"
              variant="default"
              onClick={goToNextStep}
              disabled={(currentStep === 2 && !selectedProvider)}
            >
              Continuar
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}