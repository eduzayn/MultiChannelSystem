import { Headphones, HandshakeIcon, Clock, Smile } from 'lucide-react';
import { StatsCard } from '@/components/stats-card';
import { ActivityFeed } from '@/components/activity-feed';
import { Attendances } from '@/components/attendances';
import { TopPerformers } from '@/components/top-performers';
import { QuickActions } from '@/components/quick-actions';

export default function Dashboard() {
  // Activity data
  const activities = [
    {
      id: '1',
      title: 'Nova mensagem recebida',
      description: 'Carlos Oliveira via WhatsApp',
      icon: 'message' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    },
    {
      id: '2',
      title: 'Oportunidade fechada',
      description: 'Plano Premium - Empresa ABC Ltda.',
      icon: 'check' as const,
      timestamp: new Date(Date.now() - 27 * 60 * 1000), // 27 minutes ago
    },
    {
      id: '3',
      title: 'Novo contato adicionado',
      description: 'Mariana Santos via formulário do site',
      icon: 'user' as const,
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      id: '4',
      title: 'Alerta de SLA',
      description: 'Ticket #5782 - 4 horas sem resposta',
      icon: 'alert' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  ];

  // Attendances data
  const attendances = [
    {
      id: '1',
      name: 'Maria Silva',
      channel: 'WhatsApp',
      subject: 'Dúvida sobre plano de assinatura',
      status: 'success' as const,
      time: '4m',
    },
    {
      id: '2',
      name: 'João Costa',
      channel: 'Chat',
      subject: 'Solicitação de demonstração',
      status: 'warning' as const,
      time: '12m',
    },
    {
      id: '3',
      name: 'Empresa XYZ',
      channel: 'Email',
      subject: 'Reclamação sobre atendimento',
      status: 'danger' as const,
      time: '28m',
      isUrgent: true,
    },
  ];

  // Top performers data
  const performers = [
    {
      id: '1',
      name: 'Lucas Fernandes',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80',
      attendances: 24,
      score: 98,
    },
    {
      id: '2',
      name: 'Carla Santos',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80',
      attendances: 18,
      score: 95,
    },
    {
      id: '3',
      name: 'André Martins',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=32&h=32&q=80',
      attendances: 16,
      score: 92,
    },
  ];

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
          value="72"
          icon={<Headphones className="h-6 w-6" />}
          iconBgColor="bg-primary-50"
          iconColor="text-primary-500"
          changeValue={12}
          changeText="vs. ontem"
          isPositive={true}
        />
        
        <StatsCard
          title="Oportunidades abertas"
          value="24"
          icon={<HandshakeIcon className="h-6 w-6" />}
          iconBgColor="bg-secondary-50"
          iconColor="text-secondary-500"
          changeValue={3}
          changeText="vs. semana passada"
          isPositive={false}
        />
        
        <StatsCard
          title="Tempo médio de resposta"
          value="5.2 min"
          icon={<Clock className="h-6 w-6" />}
          iconBgColor="bg-success-50"
          iconColor="text-success-500"
          changeValue={7}
          changeText="melhor que ontem"
          isPositive={true}
        />
        
        <StatsCard
          title="Satisfação do cliente"
          value="92%"
          icon={<Smile className="h-6 w-6" />}
          iconBgColor="bg-warning-50"
          iconColor="text-warning-500"
          changeValue={2}
          changeText="vs. média mensal"
          isPositive={true}
        />
      </div>
      
      {/* Middle Content: Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-3 sm:p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-0">Atendimentos por Canal</h2>
            <div className="flex space-x-1 sm:space-x-2">
              <button className="px-2 sm:px-3 py-1 text-xs rounded-md bg-primary-500 text-white">Hoje</button>
              <button className="px-2 sm:px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-600">Semana</button>
              <button className="px-2 sm:px-3 py-1 text-xs rounded-md bg-gray-100 text-gray-600">Mês</button>
            </div>
          </div>
          
          {/* Chart Placeholder */}
          <div className="h-48 sm:h-56 md:h-64 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center">
            <div className="text-center px-2 sm:px-4">
              <div className="text-3xl sm:text-4xl text-gray-300 mb-2 sm:mb-3">📊</div>
              <p className="text-xs sm:text-sm text-gray-500">Gráfico de distribuição de atendimentos por canal</p>
            </div>
          </div>
          
          {/* Stats Below Chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-4 sm:mt-6">
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <div className="text-base sm:text-lg font-semibold text-success-500">42%</div>
              <div className="text-xs text-gray-500">WhatsApp</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <div className="text-base sm:text-lg font-semibold text-primary-500">28%</div>
              <div className="text-xs text-gray-500">Chat</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <div className="text-base sm:text-lg font-semibold text-secondary-500">18%</div>
              <div className="text-xs text-gray-500">Email</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-md">
              <div className="text-base sm:text-lg font-semibold text-warning-500">12%</div>
              <div className="text-xs text-gray-500">Instagram</div>
            </div>
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
