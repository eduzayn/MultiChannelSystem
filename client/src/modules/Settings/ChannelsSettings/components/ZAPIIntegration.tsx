import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Label,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch
} from '@/components/ui/';
import { Loader2, CheckCircle, XCircle, QrCode, ExternalLink, Copy, Phone } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';

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

export const ZAPIIntegration = () => {
  const [activeTab, setActiveTab] = useState('credentials');
  const [qrCodeDialogOpen, setQrCodeDialogOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ success: boolean; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedChannelId, setSelectedChannelId] = useState<number | null>(null);
  const [newChannelDialogOpen, setNewChannelDialogOpen] = useState(false);
  const [credentials, setCredentials] = useState<ZAPICredentials>({
    instanceId: '',
    token: '',
    clientToken: ''
  });
  const [newChannel, setNewChannel] = useState({
    name: 'Canal WhatsApp',
    description: 'Canal para comunicação via WhatsApp usando Z-API',
    type: 'whatsapp',
    isActive: true
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Buscar canais WhatsApp existentes
  const { 
    data: channels,
    isLoading: isLoadingChannels
  } = useQuery({
    queryKey: ['/api/marketing-channels/whatsapp'],
    queryFn: async () => {
      const response = await axios.get('/api/marketing-channels?type=whatsapp');
      return response.data as ZAPIChannel[];
    }
  });
  
  // Carregar detalhes do canal selecionado
  useEffect(() => {
    if (selectedChannelId && channels) {
      const channel = channels.find(c => c.id === selectedChannelId);
      if (channel && channel.configuration) {
        setCredentials(channel.configuration as ZAPICredentials);
      }
    }
  }, [selectedChannelId, channels]);
  
  // Mutation para criar um novo canal
  const createChannelMutation = useMutation({
    mutationFn: async (channelData: any) => {
      const response = await axios.post('/api/marketing-channels', channelData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Canal criado com sucesso',
        description: 'Agora você pode configurar as credenciais do Z-API',
        variant: 'default',
      });
      setNewChannelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/marketing-channels/whatsapp'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao criar canal',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation para atualizar um canal existente
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
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao atualizar canal',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    }
  });
  
  // Testar conexão com Z-API
  const testConnection = async () => {
    setIsSubmitting(true);
    setTestResults(null);
    
    try {
      const response = await axios.post('/api/zapi/test-connection', credentials);
      setTestResults(response.data);
      
      if (response.data.success) {
        toast({
          title: 'Conexão bem-sucedida',
          description: 'A conexão com a Z-API foi estabelecida com sucesso',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Falha na conexão',
          description: response.data.message || 'Não foi possível conectar à Z-API',
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
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Obter QR Code para conexão do WhatsApp
  const getQRCode = async () => {
    setIsSubmitting(true);
    setQrCodeData(null);
    
    try {
      const response = await axios.post('/api/zapi/get-qrcode', credentials);
      
      if (response.data.success && response.data.qrCode) {
        console.log("QR Code recebido:", response.data.qrCode.substring(0, 50) + "...");
        setQrCodeData(response.data.qrCode);
        setQrCodeDialogOpen(true);
        
        toast({
          title: 'QR Code gerado',
          description: 'Escaneie o QR Code com seu WhatsApp para conectar',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Falha ao gerar QR Code',
          description: response.data.message || 'Não foi possível gerar o QR Code',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao gerar QR Code',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Configurar canal selecionado
  const setupChannel = async () => {
    if (!selectedChannelId) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`/api/zapi/setup-channel/${selectedChannelId}`);
      
      if (response.data.status === 'connected') {
        toast({
          title: 'Canal configurado com sucesso',
          description: response.data.message || 'O canal WhatsApp está pronto para uso',
          variant: 'default',
        });
      } else if (response.data.status === 'need_qrcode' && response.data.qrCode) {
        setQrCodeData(response.data.qrCode);
        setQrCodeDialogOpen(true);
        
        toast({
          title: 'QR Code gerado',
          description: 'Escaneie o QR Code com seu WhatsApp para conectar',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Falha na configuração',
          description: response.data.message || 'Não foi possível configurar o canal',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao configurar canal',
        description: error.response?.data?.message || 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Salvar configurações do canal
  const saveChannelConfig = async () => {
    if (!selectedChannelId) return;
    
    // Atualiza o canal existente com as novas credenciais
    updateChannelMutation.mutate({ 
      id: selectedChannelId, 
      data: { 
        configuration: credentials 
      } 
    });
  };
  
  // Criar novo canal
  const handleCreateChannel = () => {
    createChannelMutation.mutate({
      ...newChannel,
      configuration: null // Inicialmente sem configuração, será adicionada depois
    });
  };

  // Renderização de componentes
  const renderTestResults = () => {
    if (!testResults) return null;
    
    return (
      <div className="mt-2 p-3 rounded-md border bg-muted/50">
        {testResults.success ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <span>Conexão estabelecida com sucesso!</span>
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            <span>{testResults.message || 'Falha na conexão'}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Integração com Z-API (WhatsApp)</h3>
          <p className="text-sm text-muted-foreground">
            Configure a integração com Z-API para enviar e receber mensagens pelo WhatsApp.
          </p>
        </div>
        <Button onClick={() => setNewChannelDialogOpen(true)}>
          + Adicionar Canal WhatsApp
        </Button>
      </div>

      {isLoadingChannels ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : !channels || channels.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum canal configurado</CardTitle>
            <CardDescription>
              Adicione um canal WhatsApp para começar a usar a integração com a Z-API.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => setNewChannelDialogOpen(true)}>
              + Adicionar Canal WhatsApp
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Canais WhatsApp</CardTitle>
              <CardDescription>
                Gerencie seus canais de comunicação via WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="channel-select">Selecione um canal</Label>
                <Select
                  value={selectedChannelId?.toString() || ''}
                  onValueChange={(value) => setSelectedChannelId(Number(value))}
                >
                  <SelectTrigger id="channel-select">
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id.toString()}>
                        {channel.name} {channel.isActive ? '(Ativo)' : '(Inativo)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {selectedChannelId && (
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Canal</CardTitle>
                <CardDescription>
                  Configure as credenciais da Z-API para este canal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="credentials">Credenciais</TabsTrigger>
                    <TabsTrigger value="connection">Conexão</TabsTrigger>
                    <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="credentials" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="instance-id">ID da Instância</Label>
                      <Input
                        id="instance-id"
                        value={credentials.instanceId}
                        onChange={(e) => setCredentials({...credentials, instanceId: e.target.value})}
                        placeholder="Ex: 1A2B3C4D5E6F7G8H9I0J"
                      />
                      <p className="text-xs text-muted-foreground">
                        O ID da sua instância na Z-API (disponível no painel da Z-API)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="token">Token da Instância</Label>
                      <Input
                        id="token"
                        value={credentials.token}
                        onChange={(e) => setCredentials({...credentials, token: e.target.value})}
                        placeholder="Ex: abcde12345-abcde12345-abcde12345"
                      />
                      <p className="text-xs text-muted-foreground">
                        O token de acesso à sua instância Z-API
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="client-token">Token do Cliente</Label>
                      <Input
                        id="client-token"
                        value={credentials.clientToken}
                        onChange={(e) => setCredentials({...credentials, clientToken: e.target.value})}
                        placeholder="Ex: 1a2b3c4d5e6f7g8h9i0j"
                      />
                      <p className="text-xs text-muted-foreground">
                        O token de segurança da sua conta Z-API (Client-Token)
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button onClick={testConnection} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Testando...
                          </>
                        ) : (
                          'Testar Conexão'
                        )}
                      </Button>
                      <Button onClick={saveChannelConfig} variant="outline" disabled={isSubmitting}>
                        Salvar Credenciais
                      </Button>
                    </div>
                    
                    {renderTestResults()}
                  </TabsContent>
                  
                  <TabsContent value="connection" className="space-y-4">
                    <div className="space-y-4">
                      <div className="rounded-md border p-4 bg-muted/50">
                        <div className="font-medium">Status da Conexão</div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Para usar o WhatsApp, você precisa escanear o QR Code com o app do WhatsApp 
                          para conectar sua conta à Z-API.
                        </p>
                        <div className="mt-4 flex space-x-2">
                          <Button onClick={getQRCode} disabled={isSubmitting}>
                            {isSubmitting ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Gerando...
                              </>
                            ) : (
                              <>
                                <QrCode className="mr-2 h-4 w-4" />
                                Gerar QR Code
                              </>
                            )}
                          </Button>
                          <Button onClick={setupChannel} variant="outline" disabled={isSubmitting}>
                            Verificar Conexão
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <a 
                          href="https://developer.z-api.io/payment"
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 flex items-center hover:underline"
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Acessar Painel Z-API
                        </a>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="webhooks" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhook-url">
                        URL do Webhook (Recebimento de Mensagens)
                      </Label>
                      <div className="flex space-x-2">
                        <Input
                          id="webhook-url"
                          value={window.location.origin + '/api/zapi/webhook'}
                          readOnly
                        />
                        <Button variant="outline" onClick={() => {
                          navigator.clipboard.writeText(window.location.origin + '/api/zapi/webhook');
                          toast({
                            title: 'URL copiada',
                            description: 'URL do webhook copiada para a área de transferência',
                            variant: 'default',
                          });
                        }}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Configure esta URL no painel da Z-API para receber mensagens do WhatsApp
                      </p>
                    </div>
                    
                    <div className="rounded-md border p-4 bg-muted/50">
                      <div className="font-medium">Configuração de Webhook na Z-API</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Você pode configurar seu webhook automaticamente ou manualmente no painel da Z-API.
                      </p>
                      <div className="mt-4">
                        <Button variant="outline">
                          Configurar Webhook Automaticamente
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* QR Code Dialog */}
      <Dialog open={qrCodeDialogOpen} onOpenChange={setQrCodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conecte seu WhatsApp</DialogTitle>
            <DialogDescription>
              Escaneie o QR Code abaixo com seu WhatsApp para conectar à Z-API
            </DialogDescription>
          </DialogHeader>
          
          {qrCodeData ? (
            <div className="flex flex-col items-center p-4 bg-white rounded-md gap-4">
              <div className="w-64 h-64 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md relative">
                <QRCodeDisplay qrCodeData={qrCodeData} />
              </div>
              
              <div className="text-center mt-4">
                <h3 className="text-lg font-semibold mb-2">Ou insira o código manualmente</h3>
                <div className="bg-gray-100 p-3 rounded-md font-mono text-center break-all">
                  {qrCodeData}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  No WhatsApp, vá em Configurações &gt; Dispositivos Conectados &gt; Parear usando código
                </p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          
          <p className="text-center text-sm text-muted-foreground">
            1. Abra o WhatsApp no seu celular<br />
            2. Toque em Mais opções ⋮ ou Configurações ⚙️<br />
            3. Toque em Aparelhos conectados<br />
            4. Toque em Conectar um aparelho<br />
            5. Escaneie este QR Code
          </p>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setQrCodeDialogOpen(false)}>
              Fechar
            </Button>
            <Button onClick={getQRCode} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                'Atualizar QR Code'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Nova Canal Dialog */}
      <Dialog open={newChannelDialogOpen} onOpenChange={setNewChannelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Canal WhatsApp</DialogTitle>
            <DialogDescription>
              Crie um novo canal para comunicação via WhatsApp usando Z-API
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Nome do Canal</Label>
              <Input
                id="channel-name"
                value={newChannel.name}
                onChange={(e) => setNewChannel({...newChannel, name: e.target.value})}
                placeholder="Ex: WhatsApp Marketing"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="channel-description">Descrição (opcional)</Label>
              <Input
                id="channel-description"
                value={newChannel.description || ''}
                onChange={(e) => setNewChannel({...newChannel, description: e.target.value})}
                placeholder="Ex: Canal para comunicação com clientes via WhatsApp"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                checked={newChannel.isActive}
                onCheckedChange={(checked) => setNewChannel({...newChannel, isActive: checked})}
                id="channel-active"
              />
              <Label htmlFor="channel-active">Ativo</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChannelDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateChannel} disabled={createChannelMutation.isPending}>
              {createChannelMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Canal'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};