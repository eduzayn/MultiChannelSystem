import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IntegrationCard, type IntegrationStatus } from './components/IntegrationCard';
import { OpenAIIntegrationModal } from './components/OpenAIIntegrationModal';
import { ElevenLabsIntegrationModal } from './components/ElevenLabsIntegrationModal';
import { AsaasIntegrationModal } from './components/AsaasIntegrationModal';
import { PerplexityIntegrationModal } from './components/PerplexityIntegrationModal';

// Logos de integrações
const PLACEHOLDER_LOGO = "https://via.placeholder.com/32";

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: IntegrationStatus;
  category: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'Modelos de linguagem avançados para a Prof. Ana e outras funcionalidades de IA.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'ia'
  },
  {
    id: 'perplexity',
    name: 'Perplexity AI',
    description: 'Busca e respostas inteligentes com acesso à internet em tempo real.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'ia'
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Síntese de voz avançada para a Prof. Ana e mensagens de voz.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'voz'
  },
  {
    id: 'asaas',
    name: 'Asaas',
    description: 'Automatize a criação e o acompanhamento de cobranças para seus clientes.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'pagamentos'
  },
  {
    id: 'aws',
    name: 'Amazon S3',
    description: 'Armazenamento de arquivos e imagens com Amazon Web Services.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'storage'
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    description: 'Análise de tráfego e comportamento dos usuários no seu sistema.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'analytics'
  },
  {
    id: 'facebook',
    name: 'Meta Business',
    description: 'Integração com Facebook e Instagram para gerenciamento de anúncios.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'marketing'
  },
  {
    id: 'google_ads',
    name: 'Google Ads',
    description: 'Gerenciamento de campanhas publicitárias no Google.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'marketing'
  },
  {
    id: 'shopify',
    name: 'Shopify',
    description: 'Integração com sua loja Shopify para sincronização de produtos e pedidos.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'ecommerce'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    description: 'Integração com WooCommerce para sincronização de produtos e pedidos.',
    logo: PLACEHOLDER_LOGO,
    status: 'not_connected',
    category: 'ecommerce'
  }
];

export const IntegrationsSettings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [openAIModalOpen, setOpenAIModalOpen] = useState(false);
  const [elevenLabsModalOpen, setElevenLabsModalOpen] = useState(false);
  const [asaasModalOpen, setAsaasModalOpen] = useState(false);
  const [perplexityModalOpen, setPerplexityModalOpen] = useState(false);
  
  // Filtragem por pesquisa e categoria
  const filteredIntegrations = INTEGRATIONS
    .filter(integration => 
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(integration => 
      activeTab === 'all' || integration.category === activeTab
    );

  const handleIntegrationClick = (integrationId: string) => {
    switch (integrationId) {
      case 'openai':
        setOpenAIModalOpen(true);
        break;
      case 'elevenlabs':
        setElevenLabsModalOpen(true);
        break;
      case 'asaas':
        setAsaasModalOpen(true);
        break;
      case 'perplexity':
        setPerplexityModalOpen(true);
        break;
      default:
        // Para outras integrações que ainda não foram implementadas
        alert(`A integração ${integrationId} será implementada em breve.`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Integrações</h2>
        <p className="text-muted-foreground">
          Configure integrações com serviços externos para expandir as funcionalidades da sua plataforma
        </p>
      </div>

      <div className="space-y-4">
        <Input
          placeholder="Buscar integrações..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
            <TabsTrigger value="ia">Inteligência Artificial</TabsTrigger>
            <TabsTrigger value="voz">Comunicação</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="ecommerce">E-commerce</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="outros">Outros</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  id={integration.id}
                  name={integration.name}
                  description={integration.description}
                  logo={integration.logo}
                  status={integration.status}
                  onActionClick={() => handleIntegrationClick(integration.id)}
                />
              ))}
              
              {filteredIntegrations.length === 0 && (
                <div className="col-span-3 py-10 text-center text-muted-foreground">
                  Nenhuma integração encontrada.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais de configuração */}
      <OpenAIIntegrationModal 
        isOpen={openAIModalOpen}
        onClose={() => setOpenAIModalOpen(false)}
      />
      
      <ElevenLabsIntegrationModal 
        isOpen={elevenLabsModalOpen}
        onClose={() => setElevenLabsModalOpen(false)}
      />
      
      <AsaasIntegrationModal 
        isOpen={asaasModalOpen}
        onClose={() => setAsaasModalOpen(false)}
      />
      
      <PerplexityIntegrationModal 
        isOpen={perplexityModalOpen}
        onClose={() => setPerplexityModalOpen(false)}
      />
    </div>
  );
};