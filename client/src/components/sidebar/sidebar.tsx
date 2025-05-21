import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSidebarStore } from '@/store/sidebarStore';
import { cn, userRoles, type UserRole } from '@/lib/utils';
import { SidebarSection } from './sidebar-section';
import { SidebarItem } from './sidebar-item';
import { Home, MessageSquare, Inbox, Users, Building2, DollarSign, 
         Megaphone, Bot, BarChart3, Trophy, Settings, User, HelpCircle, LogOut, Brain } from 'lucide-react';
import { Link } from 'wouter';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

const hasRoleAccess = (userRole: UserRole, roles: UserRole[]) => {
  return roles.includes(userRole);
};

export function Sidebar() {
  const { user } = useAuthStore();
  const { isMobileOpen, closeMobileSidebar } = useSidebarStore();
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileOpen) {
        closeMobileSidebar();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileOpen, closeMobileSidebar]);

  if (!user) return null;

  const sidebarClasses = cn(
    'flex flex-col w-64 bg-gray-800 text-white transition-all duration-300 ease-in-out overflow-hidden',
    isMobileOpen ? 'fixed inset-y-0 left-0 z-30' : 'hidden md:flex'
  );

  return (
    <aside className={sidebarClasses}>
      {/* Tenant Logo and User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-center mb-4">
          {/* Tenant Logo Placeholder */}
          <div className="bg-white bg-opacity-10 p-2 rounded-lg">
            <span className="font-bold text-xl tracking-wider text-primary-500">OMNICHANNEL</span>
          </div>
        </div>
        
        {/* User Info */}
        <div className="flex flex-col items-center space-y-2 pt-2">
          <div className="relative">
            <img 
              src={user.avatar}
              alt={`Foto de ${user.name}`}
              className="h-12 w-12 rounded-full border-2 border-primary-500 object-cover" 
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success-500 border-2 border-gray-800 rounded-full"></span>
          </div>
          <div className="text-center">
            <div className="text-sm font-semibold">Olá, {user.name}</div>
            <div className="text-xs text-gray-400">
              {user.role === userRoles.ADMIN && 'Administrador'}
              {user.role === userRoles.SUPERVISOR && 'Supervisor'}
              {user.role === userRoles.AGENT && 'Agente'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Menu */}
      <ScrollArea className="flex-1">
        <nav className="flex-1 py-4 px-2">
          {/* ÁREA DE TRABALHO PRINCIPAL */}
          <SidebarSection title="Área de Trabalho Principal">
            <SidebarItem icon={<Home />} href="/" label="Dashboard" />
            <SidebarItem 
              icon={<MessageSquare />} 
              href="/chat" 
              label="Chat Interno"
              submenu={[
                { label: 'Canais', href: '/chat/channels' },
                { label: 'Mensagens Diretas', href: '/chat/direct' },
              ]}
            />
            <SidebarItem 
              icon={<Inbox />} 
              href="/inbox" 
              label="Caixa de Entrada Unificada" 
              badge={12}
              submenu={[
                { label: 'Conversas de todos os canais', href: '/inbox/all' },
              ]}
            />
            <SidebarItem 
              icon={<Brain />} 
              href="/profana" 
              label="Prof. Ana" 
            />
          </SidebarSection>
          
          {/* GESTÃO DE CLIENTES (CRM) */}
          {hasRoleAccess(user.role, [userRoles.ADMIN, userRoles.SUPERVISOR]) && (
            <SidebarSection title="Gestão de Clientes (CRM)">
              <SidebarItem 
                icon={<Users />} 
                href="/contacts" 
                label="Contatos"
                submenu={[
                  { label: 'Lista', href: '/contacts' },
                  { label: 'Perfis Individuais', href: '/contacts/profiles' },
                ]}
              />
              <SidebarItem 
                icon={<Building2 />} 
                href="/companies" 
                label="Empresas (Contas B2B)"
                submenu={[
                  { label: 'Lista', href: '/companies' },
                  { label: 'Perfis Organizacionais', href: '/companies/profiles' },
                ]}
              />
              <SidebarItem 
                icon={<DollarSign />} 
                href="/deals" 
                label="Negócios/Oportunidades"
                submenu={[
                  { label: 'Funil de Vendas (Kanban)', href: '/deals/funnel' },
                  { label: 'Lista de Negócios', href: '/deals' },
                ]}
              />
            </SidebarSection>
          )}
          
          {/* MARKETING E ENGAJAMENTO */}
          {hasRoleAccess(user.role, [userRoles.ADMIN, userRoles.SUPERVISOR]) && (
            <SidebarSection title="Marketing e Engajamento">
              <SidebarItem 
                icon={<Megaphone />} 
                href="/marketing/campaigns" 
                label="Campanhas de Marketing"
                submenu={[
                  { label: 'Email', href: '/marketing/campaigns/email' },
                  { label: 'WhatsApp', href: '/marketing/campaigns/whatsapp' },
                ]}
              />
              <SidebarItem 
                icon={<Bot />} 
                href="/marketing/automations" 
                label="Automações (Workflows)"
                submenu={[
                  { label: 'Jornadas Automatizadas', href: '/marketing/automations/journeys' },
                ]}
              />
            </SidebarSection>
          )}
          
          {/* ANÁLISE E PERFORMANCE */}
          {hasRoleAccess(user.role, [userRoles.ADMIN, userRoles.SUPERVISOR]) && (
            <SidebarSection title="Análise e Performance">
              <SidebarItem 
                icon={<BarChart3 />} 
                href="/reports" 
                label="Relatórios"
                submenu={[
                  { label: 'Performance de Atendimento', href: '/reports/performance' },
                  { label: 'Resultados de Vendas e CRM', href: '/reports/sales' },
                  { label: 'Métricas de Marketing', href: '/reports/marketing' },
                ]}
              />
              <SidebarItem 
                icon={<Trophy />} 
                href="/goals" 
                label="Metas e Reconhecimento"
                submenu={[
                  { label: 'Ranking de Desempenho', href: '/goals/ranking' },
                  { label: 'Painel de Reconhecimento Público', href: '/goals/recognition' },
                  { label: 'Minhas Metas/Conquistas', href: '/goals/my' },
                ]}
              />
            </SidebarSection>
          )}
          
          {/* CONFIGURAÇÕES (ADMINISTRAÇÃO) */}
          {hasRoleAccess(user.role, [userRoles.ADMIN]) && (
            <SidebarSection title="Configurações (Administração)">
              <SidebarItem 
                icon={<Settings />} 
                href="/settings" 
                label="Configurações do Tenant"
                submenu={[
                  { label: 'Perfil da Empresa & Branding', href: '/settings/company' },
                  { label: 'Usuários e Equipes', href: '/settings/users' },
                  { label: 'Canais de Comunicação', href: '/settings/channels' },
                  { label: 'Configurações do CRM', href: '/settings/crm' },
                  { label: 'Configurações de Marketing', href: '/settings/marketing' },
                  { label: 'Metas e Gamificação (Setup)', href: '/settings/goals' },
                  { label: 'IA - Prof. Ana (Setup)', href: '/settings/ai' },
                  { label: 'Integrações (Asaas, etc.)', href: '/settings/integrations' },
                  { label: 'Políticas e Conformidade (LGPD)', href: '/settings/compliance' },
                  { label: 'Logs de Auditoria', href: '/settings/logs' },
                  { label: 'Faturamento/Assinatura', href: '/settings/billing' },
                ]}
              />
            </SidebarSection>
          )}
        </nav>
      </ScrollArea>
      
      {/* User Account Section */}
      <div className="mt-auto border-t border-gray-700 p-4">
        <div className="space-y-1">
          <Link href="/profile">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <User className="mr-3 h-5 w-5" />
              <span>Meu Perfil</span>
            </a>
          </Link>
          <Link href="/help">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <HelpCircle className="mr-3 h-5 w-5" />
              <span>Ajuda & Documentação</span>
            </a>
          </Link>
          <Link href="/logout">
            <a className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white">
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sair</span>
            </a>
          </Link>
        </div>
      </div>
    </aside>
  );
}
