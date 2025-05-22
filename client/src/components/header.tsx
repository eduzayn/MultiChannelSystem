import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import { Menu, Search, Bell, Mail, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [location] = useLocation();
  const { toggleMobileSidebar } = useSidebarStore();
  const { user } = useAuthStore();

  // Extract page title from location
  const getPageTitle = () => {
    const path = location.split('/')[1];
    
    switch (path) {
      case '':
        return 'Dashboard';
      case 'chat':
        return 'Chat Interno';
      case 'inbox':
        return 'Caixa de Entrada Unificada';
      case 'contacts':
        return 'Contatos';
      case 'companies':
        return 'Empresas (Contas B2B)';
      case 'deals':
        return 'Negócios/Oportunidades';
      default:
        return path.charAt(0).toUpperCase() + path.slice(1);
    }
  };

  // Extract subtitle based on location
  const getSubtitle = () => {
    const path = location.split('/')[1];
    
    switch (path) {
      case '':
        return 'Visão geral';
      case 'chat':
        return 'Canais e mensagens';
      case 'inbox':
        return 'Todos os canais';
      case 'contacts':
        return 'Lista de contatos';
      case 'companies':
        return 'Lista de empresas';
      case 'deals':
        return 'Oportunidades';
      default:
        return '';
    }
  };

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between">
          {/* Left: Mobile Menu Button & Breadcrumb */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2 text-gray-600 hover:text-gray-900 active:bg-gray-200"
              onClick={() => toggleMobileSidebar()}
              onTouchStart={(e) => {
                e.preventDefault(); // Previne comportamento padrão do toque
                toggleMobileSidebar();
              }}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menu</span>
            </Button>
            
            {/* Título da página em dispositivos móveis */}
            <div className="md:hidden">
              <h1 className="text-base font-semibold text-gray-800 truncate max-w-[150px]">{getPageTitle()}</h1>
            </div>
            
            {/* Título da página em desktop */}
            <div className="hidden md:flex items-center">
              <h1 className="text-lg font-semibold text-gray-800">{getPageTitle()}</h1>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm text-gray-500">{getSubtitle()}</span>
            </div>
          </div>
          
          {/* Right: Search, Notifications, etc. */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search */}
            <div className="relative hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input 
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm" 
                placeholder="Buscar..." 
              />
            </div>
            
            {/* Search Button (mobile) */}
            <Button variant="ghost" size="icon" className="md:hidden relative text-gray-600 hover:text-gray-900">
              <Search className="h-5 w-5" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center bg-destructive text-white text-xs rounded-full">
                3
              </Badge>
            </Button>
            
            {/* Messages */}
            <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-gray-900">
              <Mail className="h-5 w-5" />
              <Badge className="absolute top-0 right-0 h-4 w-4 p-0 flex items-center justify-center bg-primary text-white text-xs rounded-full">
                5
              </Badge>
            </Button>
            
            {/* User Avatar/Menu */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="flex items-center space-x-1 p-0 rounded-full">
                <img 
                  src={user?.avatar} 
                  alt="Foto do usuário" 
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200" 
                />
                <ChevronDown className="h-4 w-4 text-gray-600 hidden sm:block" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
