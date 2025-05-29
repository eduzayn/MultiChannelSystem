import { Headphones, HandshakeIcon, Clock, Smile, Loader2 } from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import { ActivityFeed, ActivityItem } from '@/components/activity-feed';
import { Attendances } from '@/components/attendances';
import { TopPerformers } from '@/components/top-performers';
import { QuickActions } from '@/components/quick-actions';
import { useKpis, useKpiValues } from '@/hooks/useKpis';
import { useUserActivities, useTeamPerformance, useTeamRanking } from '@/hooks/useTeamMetrics';
import { useDefaultDashboard, useDashboardWidgets } from '@/hooks/useDashboard';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [teamId, setTeamId] = useState<number>(1); // ID da equipe padrão
  
  const [loadingKpis, setLoadingKpis] = useState(true);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [loadingTeamPerformance, setLoadingTeamPerformance] = useState(true);
  const [loadingRanking, setLoadingRanking] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [loadingWidgets, setLoadingWidgets] = useState(true);
  
  const kpis = [
    { id: 1, name: 'Tempo Médio de Resposta' },
    { id: 2, name: 'Taxa de Resolução' },
    { id: 3, name: 'Produtividade do Atendente' },
    { id: 4, name: 'Satisfação do Cliente' }
  ];
  
  const userActivities = [
    {
      id: 1,
      activityType: 'message_received',
      details: { description: 'Nova mensagem de Maria Silva' },
      performedAt: new Date().toISOString()
    },
    {
      id: 2,
      activityType: 'deal_created',
      details: { description: 'Oportunidade criada para Empresa ABC' },
      performedAt: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ];
  
  const teamPerformance = {
    metrics: {
      conversationsHandled: 42,
      conversationsHandledChange: 5,
      dealsCreated: 12,
      dealsCreatedChange: 2
    },
    channelDistribution: {
      whatsapp: 65,
      chat: 20,
      email: 10,
      instagram: 5
    }
  };
  
  const teamRanking = [
    { userId: 1, name: 'Ana Silva', metrics: { conversationsHandled: 28, customerSatisfaction: 0.95 } },
    { userId: 2, name: 'Carlos Oliveira', metrics: { conversationsHandled: 24, customerSatisfaction: 0.92 } },
    { userId: 3, name: 'Mariana Santos', metrics: { conversationsHandled: 22, customerSatisfaction: 0.90 } }
  ];
  
  const defaultDashboard = { id: 1, name: 'Dashboard Padrão' };
  
  const dashboardWidgets = [
    { id: 1, type: 'channel_distribution', title: 'Distribuição por Canal' }
  ];
  
  const responseTimeKpi = { value: 3.5, change: -0.5 };
  const resolutionRateKpi = { value: 0.85, change: 0.03 };
  const productivityKpi = { value: 22, change: 2 };
  const satisfactionKpi = { value: 0.92, change: 0.01 };
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingKpis(false);
      setLoadingActivities(false);
      setLoadingTeamPerformance(false);
      setLoadingRanking(false);
      setLoadingDashboard(false);
      setLoadingWidgets(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  
  const activities: ActivityItem[] = userActivities?.map((activity: { 
    id: number; 
    activityType: string; 
    details?: any; 
    performedAt: string;
  }) => ({
    id: activity.id.toString(),
    title: activity.activityType === 'message_received' 
      ? 'Nova mensagem recebida'
      : activity.activityType === 'deal_created'
      ? 'Oportunidade criada'
      : activity.activityType === 'contact_created'
      ? 'Novo contato adicionado'
      : activity.activityType === 'sla_alert'
      ? 'Alerta de SLA'
      : activity.activityType,
    description: activity.details?.description || '',
    icon: (activity.activityType === 'message_received' 
      ? 'message' 
      : activity.activityType === 'deal_created'
      ? 'check'
      : activity.activityType === 'contact_created'
      ? 'user'
      : activity.activityType === 'sla_alert'
      ? 'alert'
      : 'info') as 'message' | 'check' | 'user' | 'alert' | 'info',
    timestamp: new Date(activity.performedAt),
  })) || [];
  
  const [attendances, setAttendances] = useState<Array<{
    id: string;
    name: string;
    channel: string;
    subject: string;
    status: 'success' | 'warning' | 'danger';
    time: string;
    isUrgent?: boolean;
  }>>([]);
  
  useEffect(() => {
    const formatElapsedTime = (date: Date): string => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins}m`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}h`;
      } else {
        return `${Math.floor(diffMins / 1440)}d`;
      }
    };
    
    const fetchActiveConversations = async () => {
      try {
        
        const mockData = [
          {
            id: '1',
            name: 'Maria Silva',
            channel: 'WhatsApp',
            subject: 'Dúvida sobre plano de assinatura',
            status: 'success' as const,
            lastMessageAt: new Date(Date.now() - 4 * 60 * 1000), // 4 minutos atrás
          },
          {
            id: '2',
            name: 'João Costa',
            channel: 'Chat',
            subject: 'Solicitação de demonstração',
            status: 'warning' as const,
            lastMessageAt: new Date(Date.now() - 12 * 60 * 1000), // 12 minutos atrás
          },
          {
            id: '3',
            name: 'Empresa XYZ',
            channel: 'Email',
            subject: 'Reclamação sobre atendimento',
            status: 'danger' as const,
            lastMessageAt: new Date(Date.now() - 28 * 60 * 1000), // 28 minutos atrás
            isUrgent: true,
          },
        ];
        
        const formattedData = mockData.map(item => ({
          id: item.id,
          name: item.name,
          channel: item.channel,
          subject: item.subject,
          status: item.status,
          time: formatElapsedTime(item.lastMessageAt),
          isUrgent: item.isUrgent,
        }));
        
        setAttendances(formattedData);
      } catch (error) {
        console.error('Erro ao buscar atendimentos ativos:', error);
      }
    };
    
    fetchActiveConversations();
    
    const intervalId = setInterval(() => {
      fetchActiveConversations();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const performers = teamRanking?.map((performer: { 
    userId: number; 
    name?: string; 
    avatar?: string; 
    metrics?: { 
      conversationsHandled?: number; 
      customerSatisfaction?: number; 
    } 
  }, index: number) => ({
    id: performer.userId.toString(),
    name: performer.name || `Usuário ${performer.userId}`,
    avatar: performer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(performer.name || 'User')}&background=random`,
    attendances: performer.metrics?.conversationsHandled || 0,
    score: performer.metrics?.customerSatisfaction ? Math.round(performer.metrics.customerSatisfaction * 20) : 90 - (index * 3),
  })) || [];
  
  // Quick actions data
  const quickActions = [
    {
      icon: 'contact' as const,
      label: 'Novo Contato',
      href: '/contacts/new',
    },
    {
      icon: 'email' as const,
      label: 'Novo Email',
      href: '/email/new',
    },
    {
      icon: 'task' as const,
      label: 'Nova Tarefa',
      href: '/tasks/new',
    },
    {
      icon: 'campaign' as const,
      label: 'Campanha',
      href: '/marketing/campaigns/new',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Atendimentos hoje"
          value={teamPerformance?.metrics?.conversationsHandled?.toString() || "0"}
          icon={<Headphones className="h-6 w-6" />}
          iconBgColor="bg-primary-50"
          iconColor="text-primary-500"
          changeValue={teamPerformance?.metrics?.conversationsHandledChange || 0}
          changeText="vs. ontem"
          isPositive={teamPerformance?.metrics?.conversationsHandledChange > 0}
          isLoading={loadingTeamPerformance}
        />
        
        <StatsCard
          title="Oportunidades abertas"
          value={teamPerformance?.metrics?.dealsCreated?.toString() || "0"}
          icon={<HandshakeIcon className="h-6 w-6" />}
          iconBgColor="bg-secondary-50"
          iconColor="text-secondary-500"
          changeValue={teamPerformance?.metrics?.dealsCreatedChange || 0}
          changeText="vs. semana passada"
          isPositive={teamPerformance?.metrics?.dealsCreatedChange > 0}
          isLoading={loadingTeamPerformance}
        />
        
        <StatsCard
          title="Tempo médio de resposta"
          value={responseTimeKpi?.value 
            ? `${responseTimeKpi.value.toFixed(1)} min` 
            : "0 min"}
          icon={<Clock className="h-6 w-6" />}
          iconBgColor="bg-success-50"
          iconColor="text-success-500"
          changeValue={responseTimeKpi?.change || 0}
          changeText="vs. ontem"
          isPositive={responseTimeKpi?.change < 0} // Menor tempo é melhor
          isLoading={loadingKpis}
        />
        
        <StatsCard
          title="Satisfação do cliente"
          value={satisfactionKpi?.value 
            ? `${Math.round(satisfactionKpi.value * 100)}%` 
            : "0%"}
          icon={<Smile className="h-6 w-6" />}
          iconBgColor="bg-warning-50"
          iconColor="text-warning-500"
          changeValue={satisfactionKpi?.change ? Math.round(satisfactionKpi.change * 100) : 0}
          changeText="vs. média mensal"
          isPositive={satisfactionKpi?.change > 0}
          isLoading={loadingKpis}
        />
      </div>
      
      {/* Middle Content: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-0">Atendimentos por Canal</h2>
            <div className="flex space-x-1 sm:space-x-2">
              <button 
                className={`px-2 sm:px-3 py-1 text-xs rounded-md ${dateRange === 'today' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setDateRange('today')}
              >
                Hoje
              </button>
              <button 
                className={`px-2 sm:px-3 py-1 text-xs rounded-md ${dateRange === 'week' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setDateRange('week')}
              >
                Semana
              </button>
              <button 
                className={`px-2 sm:px-3 py-1 text-xs rounded-md ${dateRange === 'month' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setDateRange('month')}
              >
                Mês
              </button>
            </div>
          </div>
          
          {/* Chart Content */}
          {loadingWidgets ? (
            <div className="h-48 sm:h-56 md:h-64 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Carregando dados do gráfico...</p>
              </div>
            </div>
          ) : dashboardWidgets?.find((w: { type: string }) => w.type === 'channel_distribution') ? (
            <div className="h-48 sm:h-56 md:h-64 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
              {/* Aqui seria implementado o gráfico real com os dados de dashboardWidgets */}
              <div className="text-center px-2 sm:px-4">
                <div className="text-3xl sm:text-4xl text-gray-300 mb-2 sm:mb-3">📊</div>
                <p className="text-xs sm:text-sm text-gray-500">Gráfico de distribuição de atendimentos por canal</p>
              </div>
            </div>
          ) : (
            <div className="h-48 sm:h-56 md:h-64 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
              <div className="text-center px-2 sm:px-4">
                <p className="text-sm text-gray-500">Nenhum dado disponível para exibição</p>
              </div>
            </div>
          )}
          
          {/* Stats Below Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
            {loadingWidgets ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="text-center p-2 bg-gray-50 rounded-md">
                  <div className="flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Carregando...</div>
                </div>
              ))
            ) : (
              <>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <div className="text-base sm:text-lg font-semibold text-success-500">
                    {teamPerformance?.channelDistribution?.whatsapp || '0'}%
                  </div>
                  <div className="text-xs text-gray-500">WhatsApp</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <div className="text-base sm:text-lg font-semibold text-primary-500">
                    {teamPerformance?.channelDistribution?.chat || '0'}%
                  </div>
                  <div className="text-xs text-gray-500">Chat</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <div className="text-base sm:text-lg font-semibold text-secondary-500">
                    {teamPerformance?.channelDistribution?.email || '0'}%
                  </div>
                  <div className="text-xs text-gray-500">Email</div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-md">
                  <div className="text-base sm:text-lg font-semibold text-warning-500">
                    {teamPerformance?.channelDistribution?.instagram || '0'}%
                  </div>
                  <div className="text-xs text-gray-500">Instagram</div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Activity Feed */}
        <ActivityFeed activities={activities} />
      </div>
      
      {/* Bottom Section: Attendances & Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Atendimentos em Andamento */}
        <div className="md:col-span-2">
          <Attendances attendances={attendances} />
        </div>
        
        {/* Top Performers */}
        <div className="md:col-span-1">
          <TopPerformers performers={performers} />
        </div>
        
        {/* Quick Actions */}
        <div className="md:col-span-1">
          <QuickActions actions={quickActions} />
        </div>
      </div>
    </div>
  );
}
