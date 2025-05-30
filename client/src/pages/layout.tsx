import { useEffect, useRef } from 'react';
import { Sidebar } from '@/components/sidebar/sidebar';
import { Header } from '@/components/header';
import { useSidebarStore } from '@/store/sidebarStore';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';
import { BackButton } from '@/components/ui/back-button';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { isMobileOpen, closeMobileSidebar } = useSidebarStore();
  const { isAuthenticated, isLoading } = useAuthStore();
  const [location, setLocation] = useLocation();
  const mountedRef = useRef(true);

  // Verificar se o componente está montado antes de fazer atualizações de estado
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && mountedRef.current) {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Adicionar timeout para evitar conflito de atualizações no ciclo de renderização
        setTimeout(() => {
          if (mountedRef.current) {
            setLocation('/login');
          }
        }, 0);
      }
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobileOpen) {
        const target = e.target as HTMLElement;
        if (!target.closest('#sidebar')) {
          closeMobileSidebar();
        }
      }
    };

    if (isMobileOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isMobileOpen, closeMobileSidebar]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Mobile Sidebar Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-gray-900 bg-opacity-50 z-20 transition-opacity md:hidden",
          isMobileOpen ? "block" : "hidden"
        )}
        onClick={closeMobileSidebar}
      />
      
      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-2 sm:p-4 md:p-6 lg:p-8">
          {/* Botão de retorno - sem div extra para evitar espaço em branco quando não é exibido */}
          <BackButton className="mb-2" />
          
          <div className="max-w-full overflow-x-hidden">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
