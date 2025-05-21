import { useEffect } from 'react';
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
  const { isAuthenticated } = useAuthStore();

  // Close sidebar when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isMobileOpen) {
        // This is a simplified check - in a real app, you might want to use refs
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

  if (!isAuthenticated) {
    return <div>Please log in</div>;
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
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {/* Botão de retorno - sem div extra para evitar espaço em branco quando não é exibido */}
          <BackButton className="mb-2" />
          
          {children}
        </main>
      </div>
    </div>
  );
}
