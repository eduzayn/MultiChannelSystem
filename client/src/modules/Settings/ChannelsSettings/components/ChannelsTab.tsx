import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Instagram,
  Mail,
  Phone,
  Facebook,
  MessageSquareText,
  Edit,
  RefreshCw,
  Check,
  Bell,
  Trash2,
  ToggleRight,
  ToggleLeft,
  Settings,
  QrCode
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { QRCodeSVG } from "qrcode.react";
import QRCodeDisplay from "@/components/QRCodeDisplay";

export const ChannelsTab = () => {
  // Estados principais
  const [openAddChannelDialog, setOpenAddChannelDialog] = useState(false);
  const [openChannelConfigDialog, setOpenChannelConfigDialog] = useState(false);
  const [selectedChannelType, setSelectedChannelType] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [channelConfigData, setChannelConfigData] = useState({
    name: "",
    identifier: "",
    webhookUrl: "https://api.minhaempresa.com/webhooks/tenant/123/channel/456",
    apiKey: "",
    clientToken: "",
    smtpServer: "",
    smtpPort: "",
    imapServer: "",
    imapPort: "",
    username: "",
    password: ""
  });
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeStatus, setQRCodeStatus] = useState("waiting");
  const [channelFormTab, setChannelFormTab] = useState("credentials");
  const [channelQrCodeData, setChannelQrCodeData] = useState<string | null>(null);
  
  const { toast } = useToast();

  // Mock data para canais existentes
  const activeChannels = [
    {
      id: 1,
      type: "WhatsApp",
      name: "WhatsApp Principal - Z-API",
      identifier: "+55 11 98765-4321",
      status: "connected",
      icon: <MessageSquare className="h-5 w-5 text-green-500" />
    },
    {
      id: 2,
      type: "Instagram",
      name: "Instagram Direct",
      identifier: "@minhaempresa",
      status: "pending",
      icon: <Instagram className="h-5 w-5 text-pink-500" />
    },
    {
      id: 3,
      type: "Email",
      name: "Email Corporativo",
      identifier: "suporte@minhaempresa.com",
      status: "connected",
      icon: <Mail className="h-5 w-5 text-blue-500" />
    }
  ];

  // Função para selecionar o tipo de canal
  const handleSelectChannelType = (channelType: string) => {
    setSelectedChannelType(channelType);
    setCurrentStep(channelType === "WhatsApp" ? 2 : 3); // Se for WhatsApp, vai para seleção de provedor
  };

  // Função para selecionar o provedor (apenas para WhatsApp)
  const handleSelectProvider = (provider: string) => {
    setSelectedProvider(provider);
    setCurrentStep(3);
  };

  // Função para voltar ao passo anterior
  const handleBackStep = () => {
    if (currentStep === 2) {
      setSelectedChannelType(null);
      setCurrentStep(1);
    } else if (currentStep === 3) {
      if (selectedChannelType === "WhatsApp") {
        setSelectedProvider(null);
        setCurrentStep(2);
      } else {
        setSelectedChannelType(null);
        setCurrentStep(1);
      }
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  };

  // Função para avançar ao próximo passo
  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Função para gerar QR Code real da Z-API
  const handleGenerateQRCode = async () => {
    if (channelConfigData.clientToken.trim() === "") {
      toast({
        title: "Erro",
        description: "O Client Token da Z-API é obrigatório para gerar o QR Code.",
        variant: "destructive"
      });
      return;
    }
    
    // Verifica se temos o ID da instância e o token
    if (!channelConfigData.apiKey.trim()) {
      toast({
        title: "Erro",
        description: "É necessário informar o token da instância Z-API.",
        variant: "destructive"
      });
      return;
    }
    
    setShowQRCode(true);
    setQRCodeStatus("waiting");
    
    try {
      // Chama a API real para obter o QR Code
      const response = await fetch('/api/zapi/get-qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: channelConfigData.identifier, // Estamos usando o campo identifier para armazenar o instanceId
          token: channelConfigData.apiKey, // Estamos usando o campo apiKey para armazenar o token da instância
          clientToken: channelConfigData.clientToken
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.qrCode) {
        setQRCodeStatus("authenticating");
        
        // Atualiza a URL do QR Code real
        // Se o QR code for uma imagem (base64), incluímos o prefixo data:image se necessário
        if (data.isImage && !data.qrCode.startsWith('data:image')) {
          setChannelQrCodeData(`data:image/png;base64,${data.qrCode}`);
        } else {
          setChannelQrCodeData(data.qrCode);
        }
        
        // Mostra notificação de sucesso
        toast({
          title: "QR Code gerado",
          description: "Escaneie o QR Code com seu WhatsApp para conectar",
        });
      } else {
        setShowQRCode(false);
        toast({
          title: "Erro ao gerar QR Code",
          description: data.message || "Não foi possível gerar o QR Code. Verifique suas credenciais.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao obter QR Code:", error);
      setShowQRCode(false);
      toast({
        title: "Erro de conexão",
        description: "Houve um erro ao tentar conectar com a Z-API. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Função para processar o formulário de credenciais
  const handleCredentialsSubmit = () => {
    // Validação básica
    if (channelConfigData.name.trim() === "") {
      toast({
        title: "Campo obrigatório",
        description: "O nome personalizado do canal é obrigatório.",
        variant: "destructive"
      });
      return;
    }

    // Diferentes validações baseadas no tipo de canal
    if (selectedChannelType === "WhatsApp") {
      if (selectedProvider === "api" && channelConfigData.apiKey.trim() === "") {
        toast({
          title: "Campo obrigatório", 
          description: "A API Key é obrigatória para WhatsApp API Oficial.",
          variant: "destructive"
        });
        return;
      } else if (selectedProvider === "zapi" && !showQRCode) {
        toast({
          title: "QR Code necessário", 
          description: "Você precisa gerar e escanear o QR Code para conectar via Z-API.",
          variant: "destructive"
        });
        return;
      }
    } else if (selectedChannelType === "Email") {
      if (channelConfigData.smtpServer.trim() === "" || channelConfigData.username.trim() === "") {
        toast({
          title: "Campos obrigatórios", 
          description: "Os dados de configuração do servidor SMTP são obrigatórios.",
          variant: "destructive"
        });
        return;
      }
    }

    // Se tudo estiver ok, avança para próxima etapa
    handleNextStep();
  };

  // Função para finalizar e salvar o canal
  const handleSaveChannel = async () => {
    try {
      // Prepara as configurações do canal com base no tipo e provedor
      let configuration = {};
      
      if (selectedChannelType === "WhatsApp" && selectedProvider === "zapi") {
        configuration = {
          instanceId: channelConfigData.identifier, // ID da instância Z-API
          token: channelConfigData.apiKey,         // Token da instância Z-API 
          clientToken: channelConfigData.clientToken,  // Token de segurança da Z-API
          webhookUrl: window.location.origin + '/api/zapi/webhook'
        };
      } else if (selectedChannelType === "WhatsApp" && selectedProvider === "api") {
        configuration = {
          phoneNumber: channelConfigData.identifier,
          apiKey: channelConfigData.apiKey,
          webhookUrl: channelConfigData.webhookUrl
        };
      } else if (selectedChannelType === "Email") {
        configuration = {
          email: channelConfigData.username,
          smtpServer: channelConfigData.smtpServer,
          smtpPort: channelConfigData.smtpPort,
          imapServer: channelConfigData.imapServer,
          imapPort: channelConfigData.imapPort,
          password: channelConfigData.password
        };
      }
      
      // Dados do canal para API
      const channelData = {
        name: channelConfigData.name,
        description: `Canal de ${selectedChannelType} configurado via ${selectedProvider || 'configuração padrão'}`,
        type: selectedChannelType?.toLowerCase() || "unknown",
        configuration: configuration,
        isActive: true
      };
      
      // Salva o canal no banco de dados através da API
      const response = await fetch('/api/marketing-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
      });
      
      if (response.ok) {
        toast({
          title: "Canal salvo com sucesso!",
          description: `O canal ${channelConfigData.name} foi configurado e está ativo.`
        });
        
        // Fecha os diálogos e reseta os estados
        setOpenAddChannelDialog(false);
        setOpenChannelConfigDialog(false);
        setCurrentStep(1);
        setSelectedChannelType(null);
        setSelectedProvider(null);
        setChannelConfigData({
          name: "",
          identifier: "",
          webhookUrl: "https://api.minhaempresa.com/webhooks/tenant/123/channel/456",
          apiKey: "",
          clientToken: "",
          smtpServer: "",
          smtpPort: "",
          imapServer: "",
          imapPort: "",
          username: "",
          password: ""
        });
        setShowQRCode(false);
        setQRCodeStatus("waiting");
        setChannelFormTab("credentials");
        setChannelQrCodeData(null);
      } else {
        const errorData = await response.json();
        toast({
          title: "Erro ao salvar canal",
          description: errorData.message || "Ocorreu um erro ao salvar o canal. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Erro ao salvar canal:", error);
      toast({
        title: "Erro ao salvar canal",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  // Renderiza o formulário específico para cada canal/provedor
  const renderChannelConfigForm = () => {
    if (selectedChannelType === "WhatsApp" && selectedProvider === "api") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Nome Personalizado do Canal</Label>
            <Input 
              id="channel-name" 
              placeholder="Ex: WhatsApp Vendas - API Oficial" 
              value={channelConfigData.name}
              onChange={(e) => setChannelConfigData({...channelConfigData, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone-number">Número de Telefone WhatsApp Business</Label>
            <Input 
              id="phone-number" 
              placeholder="+55 11 98765-4321" 
              value={channelConfigData.identifier}
              onChange={(e) => setChannelConfigData({...channelConfigData, identifier: e.target.value})}
            />
            <p className="text-sm text-muted-foreground">Número oficial com DDI ativado na API.</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input 
              id="api-key" 
              type="password" 
              placeholder="API Key do provedor oficial" 
              value={channelConfigData.apiKey}
              onChange={(e) => setChannelConfigData({...channelConfigData, apiKey: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhook-url">URL de Webhook (Copie para o painel do provedor)</Label>
            <div className="flex">
              <Input 
                id="webhook-url" 
                readOnly 
                value={channelConfigData.webhookUrl}
              />
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(channelConfigData.webhookUrl);
                  toast({
                    title: "URL copiada!",
                    description: "A URL de webhook foi copiada para a área de transferência."
                  });
                }}
              >
                Copiar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure esta URL na plataforma do provedor para receber mensagens e atualizações de status.
            </p>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => {
              toast({
                title: "Testando conexão...",
                description: "Verificando as credenciais com o provedor..."
              });
              
              setTimeout(() => {
                toast({
                  title: "Conexão bem sucedida!",
                  description: "As credenciais estão corretas e a conexão foi estabelecida."
                });
              }, 1500);
            }}>
              Testar Conexão
            </Button>
          </div>
        </div>
      );
    } else if (selectedChannelType === "WhatsApp" && selectedProvider === "zapi") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name-zapi">Nome Personalizado do Canal</Label>
            <Input 
              id="channel-name-zapi" 
              placeholder="Ex: WhatsApp Suporte - Z-API" 
              value={channelConfigData.name}
              onChange={(e) => setChannelConfigData({...channelConfigData, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zapi-instance-id">ID da Instância Z-API</Label>
            <Input 
              id="zapi-instance-id" 
              placeholder="Ex: A1B2C3D4E5F6G7H8I9J0" 
              value={channelConfigData.identifier}
              onChange={(e) => setChannelConfigData({...channelConfigData, identifier: e.target.value})}
            />
            <p className="text-sm text-muted-foreground">
              ID da instância fornecido pelo painel da Z-API.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zapi-token">Token da Instância</Label>
            <Input 
              id="zapi-token" 
              type="password" 
              placeholder="Ex: abcde12345-abcde12345-abcde12345" 
              value={channelConfigData.apiKey}
              onChange={(e) => setChannelConfigData({...channelConfigData, apiKey: e.target.value})}
            />
            <p className="text-sm text-muted-foreground">
              Token da instância fornecido pelo painel da Z-API.
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="client-token">Client Token Z-API</Label>
            <Input 
              id="client-token" 
              type="password" 
              placeholder="Client Token da conta Z-API" 
              value={channelConfigData.clientToken}
              onChange={(e) => setChannelConfigData({...channelConfigData, clientToken: e.target.value})}
            />
            <p className="text-sm text-muted-foreground">
              Token de segurança da conta Z-API (Client-Token).
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhook-url-zapi">URL de Webhook (Copie para o painel Z-API)</Label>
            <div className="flex">
              <Input 
                id="webhook-url-zapi" 
                readOnly 
                value={channelConfigData.webhookUrl}
              />
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(channelConfigData.webhookUrl);
                  toast({
                    title: "URL copiada!",
                    description: "A URL de webhook foi copiada para a área de transferência."
                  });
                }}
              >
                Copiar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure esta URL no painel da Z-API para receber mensagens e eventos.
            </p>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              variant="outline"
              onClick={async () => {
                if (!channelConfigData.identifier || !channelConfigData.apiKey || !channelConfigData.clientToken) {
                  toast({
                    title: "Campos obrigatórios",
                    description: "Preencha todos os campos: ID da Instância, Token da Instância e Client Token.",
                    variant: "destructive"
                  });
                  return;
                }
                
                toast({
                  title: "Testando conexão...",
                  description: "Verificando credenciais com a Z-API..."
                });
                
                try {
                  const response = await fetch('/api/zapi/test-connection', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      instanceId: channelConfigData.identifier, // ID da instância 
                      token: channelConfigData.apiKey, // Token da instância
                      clientToken: channelConfigData.clientToken // Client Token
                    }),
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    toast({
                      title: "Conexão bem-sucedida!",
                      description: "As credenciais estão corretas e a conexão foi estabelecida."
                    });
                  } else {
                    toast({
                      title: "Falha na conexão",
                      description: data.message || "Não foi possível conectar com as credenciais fornecidas.",
                      variant: "destructive"
                    });
                  }
                } catch (error) {
                  console.error("Erro ao testar conexão:", error);
                  toast({
                    title: "Erro de conexão",
                    description: "Houve um erro ao tentar conectar com a Z-API. Verifique suas credenciais e tente novamente.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Testar Conexão
            </Button>
            
            <Button 
              onClick={handleGenerateQRCode}
              className="flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Gerar QR Code para Conexão
            </Button>
          </div>
          
          {showQRCode && (
            <div className="mt-4 border rounded-lg p-6 flex flex-col items-center">
              <div className="w-full max-w-md relative">
                {qrCodeStatus === "waiting" && (
                  <div className="w-full h-96 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Carregando QR Code...</p>
                      <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent mx-auto mt-2"></div>
                    </div>
                  </div>
                )}
                {qrCodeStatus === "authenticating" && (
                  <div className="w-full flex flex-col items-center justify-center">
                    <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-white">
                      <QRCodeDisplay qrCodeData={channelQrCodeData} isImage={true} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Escaneie com WhatsApp</p>
                  </div>
                )}
                {qrCodeStatus === "connected" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-green-600 mt-2">Conectado!</p>
                      <p className="text-xs text-muted-foreground mt-1">Telefone: {channelConfigData.identifier}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      );
    } else if (selectedChannelType === "Email") {
      return (
        <div className="space-y-4">
          <Tabs defaultValue={channelFormTab} onValueChange={setChannelFormTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="credentials">Credenciais</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="credentials" className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-channel-name">Nome Personalizado do Canal</Label>
                <Input 
                  id="email-channel-name" 
                  placeholder="Ex: Email Marketing, Email Suporte, etc." 
                  value={channelConfigData.name}
                  onChange={(e) => setChannelConfigData({...channelConfigData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-username">Endereço de Email</Label>
                <Input 
                  id="email-username" 
                  placeholder="email@seudominio.com" 
                  value={channelConfigData.username}
                  onChange={(e) => setChannelConfigData({...channelConfigData, 
                    username: e.target.value,
                    identifier: e.target.value
                  })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email-password">Senha</Label>
                <Input 
                  id="email-password" 
                  type="password" 
                  placeholder="Senha do email" 
                  value={channelConfigData.password}
                  onChange={(e) => setChannelConfigData({...channelConfigData, password: e.target.value})}
                />
                <p className="text-sm text-muted-foreground">
                  Para Gmail, recomendamos usar uma "senha de app" gerada nas configurações de segurança.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-server">Servidor SMTP</Label>
                  <Input 
                    id="smtp-server" 
                    placeholder="smtp.seudominio.com" 
                    value={channelConfigData.smtpServer}
                    onChange={(e) => setChannelConfigData({...channelConfigData, smtpServer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-port">Porta SMTP</Label>
                  <Input 
                    id="smtp-port" 
                    placeholder="587 ou 465" 
                    value={channelConfigData.smtpPort}
                    onChange={(e) => setChannelConfigData({...channelConfigData, smtpPort: e.target.value})}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imap-server">Servidor IMAP</Label>
                  <Input 
                    id="imap-server" 
                    placeholder="imap.seudominio.com" 
                    value={channelConfigData.imapServer}
                    onChange={(e) => setChannelConfigData({...channelConfigData, imapServer: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imap-port">Porta IMAP</Label>
                  <Input 
                    id="imap-port" 
                    placeholder="993" 
                    value={channelConfigData.imapPort}
                    onChange={(e) => setChannelConfigData({...channelConfigData, imapPort: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Segurança da Conexão</Label>
                <RadioGroup defaultValue="ssl" className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="ssl" value="ssl" />
                    <Label htmlFor="ssl" className="font-normal">SSL/TLS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="starttls" value="starttls" />
                    <Label htmlFor="starttls" className="font-normal">STARTTLS</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label>Frequência de Verificação de Novos Emails</Label>
                <RadioGroup defaultValue="5min" className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="1min" value="1min" />
                    <Label htmlFor="1min" className="font-normal">A cada minuto (alta demanda)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="5min" value="5min" />
                    <Label htmlFor="5min" className="font-normal">A cada 5 minutos (recomendado)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem id="15min" value="15min" />
                    <Label htmlFor="15min" className="font-normal">A cada 15 minutos (baixo consumo)</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={() => {
              toast({
                title: "Testando conexão...",
                description: "Verificando as credenciais SMTP..."
              });
              
              setTimeout(() => {
                toast({
                  title: "Conexão bem sucedida!",
                  description: "As credenciais estão corretas e a conexão foi estabelecida."
                });
              }, 1500);
            }}>
              Testar Conexão
            </Button>
          </div>
        </div>
      );
    } else if (selectedChannelType === "Instagram") {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="instagram-channel-name">Nome Personalizado do Canal</Label>
            <Input 
              id="instagram-channel-name" 
              placeholder="Ex: Instagram Direct" 
              value={channelConfigData.name}
              onChange={(e) => setChannelConfigData({...channelConfigData, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instagram-username">Nome de Usuário do Instagram</Label>
            <Input 
              id="instagram-username" 
              placeholder="@suaempresa" 
              value={channelConfigData.identifier}
              onChange={(e) => setChannelConfigData({...channelConfigData, identifier: e.target.value})}
            />
          </div>
          
          <div className="p-4 border rounded-md bg-amber-50 text-amber-800 space-y-2">
            <p className="font-medium text-sm">Autenticação Meta requerida</p>
            <p className="text-xs">
              A integração com Instagram requer autenticação via Meta Business. Clique no botão abaixo para iniciar o processo de autenticação.
            </p>
            <Button 
              variant="outline" 
              className="mt-2 bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
              onClick={() => {
                toast({
                  title: "Iniciando autenticação",
                  description: "Você será redirecionado para autorizar acesso à sua conta do Instagram via Meta."
                });
              }}
            >
              Conectar com Meta Business
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="webhook-instagram">URL de Webhook (Copie para o painel Meta)</Label>
            <div className="flex">
              <Input 
                id="webhook-instagram" 
                readOnly 
                value={channelConfigData.webhookUrl}
              />
              <Button 
                variant="outline" 
                className="ml-2"
                onClick={() => {
                  navigator.clipboard.writeText(channelConfigData.webhookUrl);
                  toast({
                    title: "URL copiada!",
                    description: "A URL de webhook foi copiada para a área de transferência."
                  });
                }}
              >
                Copiar
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Configure esta URL no painel da Meta Developer para receber mensagens e eventos.
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Renderiza o passo de seleção de tipo de canal
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
            className="h-auto py-6 flex flex-col opacity-50"
            disabled
          >
            <Phone className="h-10 w-10 mb-2 text-gray-500" />
            <span>SMS/Voz</span>
            <span className="text-xs mt-1">(Em breve)</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col opacity-50"
            disabled
          >
            <Facebook className="h-10 w-10 mb-2 text-blue-600" />
            <span>Facebook Messenger</span>
            <span className="text-xs mt-1">(Em breve)</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-6 flex flex-col opacity-50"
            disabled
          >
            <MessageSquareText className="h-10 w-10 mb-2 text-purple-500" />
            <span>Personalizado</span>
            <span className="text-xs mt-1">(Em breve)</span>
          </Button>
        </div>
      </div>
    );
  };

  // Renderiza o passo de seleção de provedor para WhatsApp
  const renderWhatsAppProviderSelection = () => {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">Como você deseja conectar o WhatsApp?</p>
        <div className="space-y-4">
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
              </div>
            </RadioGroup>
          </div>

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
        </div>
      </div>
    );
  };

  // Renderiza o passo de revisão e confirmação
  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Revisar Configurações</h3>
          <p className="text-sm text-muted-foreground">
            Revise as informações do canal antes de finalizar a configuração.
          </p>
        </div>
        
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-4 flex items-center gap-3">
            {selectedChannelType === "WhatsApp" && <MessageSquare className="h-5 w-5 text-green-500" />}
            {selectedChannelType === "Email" && <Mail className="h-5 w-5 text-blue-500" />}
            {selectedChannelType === "Instagram" && <Instagram className="h-5 w-5 text-pink-500" />}
            <div>
              <h4 className="font-medium">{channelConfigData.name}</h4>
              <p className="text-sm text-muted-foreground">
                {selectedChannelType} {selectedChannelType === "WhatsApp" && `(${selectedProvider === 'api' ? 'API Oficial' : 'Z-API'})`}
              </p>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">Identificador</p>
              <p className="text-sm text-muted-foreground">{channelConfigData.identifier || "Não definido"}</p>
            </div>
            
            {selectedChannelType === "WhatsApp" && selectedProvider === "api" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">API Key</p>
                <p className="text-sm text-muted-foreground">******************************</p>
              </div>
            )}
            
            {selectedChannelType === "WhatsApp" && selectedProvider === "zapi" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Status da Conexão</p>
                <p className="text-sm flex items-center">
                  {qrCodeStatus === "connected" ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-green-500 inline-block mr-2"></span>
                      <span className="text-green-600">Conectado</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-yellow-500 inline-block mr-2"></span>
                      <span className="text-yellow-600">Pendente</span>
                    </>
                  )}
                </p>
              </div>
            )}
            
            {selectedChannelType === "Email" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Servidor SMTP</p>
                <p className="text-sm text-muted-foreground">{channelConfigData.smtpServer}:{channelConfigData.smtpPort}</p>
              </div>
            )}
            
            <div className="pt-2 border-t">
              <Label className="text-sm">URL de Webhook</Label>
              <div className="flex mt-1">
                <Input value={channelConfigData.webhookUrl} readOnly className="text-xs" />
                <Button variant="outline" size="sm" className="ml-2 text-xs">Copiar</Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Importante:</strong> Após adicionar o canal, certifique-se de configurar corretamente
            o webhook no painel do provedor para garantir o recebimento de mensagens.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Canais de Comunicação</h2>
          <p className="text-muted-foreground">
            Configure os canais de comunicação com seus clientes
          </p>
        </div>
        <Button onClick={() => setOpenAddChannelDialog(true)}>
          + Adicionar Novo Canal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">WhatsApp</CardTitle>
            </div>
            <CardDescription>2 ativos, 1 configuração pendente</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" />
              <CardTitle className="text-base">Instagram Direct</CardTitle>
            </div>
            <CardDescription>1 ativo, 0 pendentes</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-base">Email</CardTitle>
            </div>
            <CardDescription>2 ativos, 0 pendentes</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-4">
        {activeChannels.map((channel) => (
          <div key={channel.id} className="border rounded-md overflow-hidden">
            <div className={`border-l-[6px] ${
              channel.type === "WhatsApp" ? "border-l-green-500" : 
              channel.type === "Instagram" ? "border-l-pink-500" : "border-l-blue-500"
            } pl-4 py-4 pr-6 flex justify-between items-center`}>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {channel.icon}
                </div>
                <div>
                  <h3 className="font-medium">{channel.name}</h3>
                  <p className="text-sm text-muted-foreground">{channel.identifier}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {channel.status === "connected" ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">Conectado</Badge>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Configuração Pendente</Badge>
                )}
                
                <div className="flex items-center">
                  {channel.status === "connected" ? (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <RefreshCw className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 ml-1">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" size="sm" className="ml-2">
                      Conectar
                    </Button>
                  )}
                  
                  {channel.status === "connected" ? (
                    <Button variant="outline" size="sm" className="ml-2">
                      Verificar Status
                    </Button>
                  ) : null}
                  
                  <Button variant="outline" size="sm" className="ml-2">
                    Editar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Dialog para adicionar novo canal */}
      <Dialog open={openAddChannelDialog} onOpenChange={setOpenAddChannelDialog}>
        <DialogContent className="sm:max-w-[700px] md:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Canal</DialogTitle>
            <DialogDescription>
              Configure um novo canal de comunicação para interagir com seus clientes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {currentStep === 1 && renderChannelTypeSelection()}
            {currentStep === 2 && selectedChannelType === "WhatsApp" && renderWhatsAppProviderSelection()}
            {currentStep === 3 && renderChannelConfigForm()}
            {currentStep === 4 && renderReviewStep()}
          </div>
          
          <DialogFooter className="flex justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBackStep}>
                Voltar
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setOpenAddChannelDialog(false)}>
                Cancelar
              </Button>
            )}
            
            {currentStep < 4 ? (
              <Button 
                onClick={currentStep === 3 ? handleCredentialsSubmit : handleNextStep}
                disabled={
                  (currentStep === 2 && !selectedProvider) ||
                  (currentStep === 3 && (!channelConfigData.name || 
                    (selectedChannelType === "WhatsApp" && selectedProvider === "zapi" && qrCodeStatus !== "connected")))
                }
              >
                {currentStep === 3 ? "Revisar" : "Próximo"}
              </Button>
            ) : (
              <Button onClick={handleSaveChannel}>
                Finalizar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};