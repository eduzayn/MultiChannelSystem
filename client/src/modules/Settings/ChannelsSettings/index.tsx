import React, { useState, useEffect } from "react";
import axios from "axios";
import { UnifiedChannelWizard } from "./components/UnifiedChannelWizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; 
import { MessageSquare, Instagram, Mail, Phone, Facebook, MessageSquareText, PlusCircle, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Channel {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  description: string;
  configuration: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export const ChannelsSettingsModule = () => {
  const [openAddChannelWizard, setOpenAddChannelWizard] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/marketing-channels');
        setChannels(response.data);
      } catch (error) {
        console.error('Erro ao buscar canais:', error);
        setChannels([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChannels();
  }, [refreshTrigger]);

  // Filtra canais por tipo para exibir os que já estão configurados
  const getChannelsByType = (type: string) => {
    return channels.filter(channel => channel.type.toLowerCase() === type.toLowerCase());
  };

  const whatsappChannels = getChannelsByType('whatsapp');
  const instagramChannels = getChannelsByType('instagram');
  const facebookChannels = getChannelsByType('facebook');
  const emailChannels = getChannelsByType('email');
  const smsChannels = getChannelsByType('sms');
  const voiceChannels = getChannelsByType('voice');

  const renderChannelStatus = (channel: Channel) => {
    return (
      <div className="flex items-center mt-2">
        {channel.isActive ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1 border-green-200">
            <CheckCircle2 className="h-3 w-3" />
            Ativo
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1 border-amber-200">
            <AlertCircle className="h-3 w-3" />
            Inativo
          </Badge>
        )}
      </div>
    );
  };

  const renderChannelCard = (
    icon: React.ReactNode, 
    title: string, 
    description: string,
    type: string,
    configChannels: Channel[],
    configButtonText: string
  ) => {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-4/5" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : configChannels.length > 0 ? (
            <div className="space-y-3">
              {configChannels.map(channel => (
                <div key={channel.id} className="border rounded-md p-3">
                  <div className="font-medium">{channel.name}</div>
                  <div className="text-sm text-muted-foreground">{channel.description}</div>
                  {renderChannelStatus(channel)}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-muted-foreground mb-3">
                Nenhum canal {title.toLowerCase()} configurado
              </p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => {
                  setOpenAddChannelWizard(true);
                }}
              >
                {configButtonText}
              </Button>
            </div>
          )}
        </CardContent>
        {configChannels.length > 0 && (
          <CardFooter>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => {
                setOpenAddChannelWizard(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Novo {title}
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} title="Atualizar lista de canais">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={() => setOpenAddChannelWizard(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Adicionar Novo Canal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderChannelCard(
          <MessageSquare className="h-5 w-5 text-green-500" />,
          "WhatsApp",
          "Canal de comunicação via WhatsApp",
          "whatsapp",
          whatsappChannels,
          "Configurar WhatsApp"
        )}

        {renderChannelCard(
          <Instagram className="h-5 w-5 text-pink-500" />,
          "Instagram",
          "Mensagens diretas no Instagram",
          "instagram",
          instagramChannels,
          "Configurar Instagram"
        )}

        {renderChannelCard(
          <Facebook className="h-5 w-5 text-blue-600" />,
          "Facebook",
          "Mensagens via Facebook Messenger",
          "facebook",
          facebookChannels,
          "Configurar Facebook"
        )}

        {renderChannelCard(
          <Mail className="h-5 w-5 text-blue-500" />,
          "Email",
          "Canais de email para atendimento",
          "email",
          emailChannels,
          "Configurar Email"
        )}

        {renderChannelCard(
          <MessageSquareText className="h-5 w-5 text-purple-500" />,
          "SMS",
          "Envio e recebimento de SMS",
          "sms",
          smsChannels,
          "Configurar SMS"
        )}

        {renderChannelCard(
          <Phone className="h-5 w-5 text-amber-500" />,
          "Telefonia",
          "Atendimento telefônico integrado",
          "voice",
          voiceChannels,
          "Configurar Telefonia"
        )}
      </div>

      {/* Wizard unificado de canais */}
      <UnifiedChannelWizard 
        open={openAddChannelWizard} 
        onOpenChange={setOpenAddChannelWizard}
        onChannelAdded={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};
