import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { useSidebarStore } from '@/store/sidebarStore';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SubmenuItem {
  label: string;
  href: string;
}

interface SidebarItemProps {
  icon: ReactNode;
  label: string;
  href: string;
  badge?: number;
  submenu?: SubmenuItem[];
}

export function SidebarItem({ icon, label, href, badge, submenu }: SidebarItemProps) {
  const [location] = useLocation();
  const [isHovering, setIsHovering] = useState(false);
  const { isCollapsed } = useSidebarStore();
  const isActive = location === href;
  
  // Renderização do item do menu quando o sidebar está recolhido (apenas ícone com tooltip)
  if (isCollapsed) {
    return (
      <li className="relative sidebar-menu-item">
        <TooltipProvider>
          <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
              <Link href={href}>
                <div 
                  className={cn(
                    "flex items-center justify-center p-2 text-sm font-medium rounded-md group cursor-pointer",
                    isActive 
                      ? "bg-primary-700 text-white" 
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  )}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <div className="text-lg">
                    {icon}
                  </div>
                  
                  {badge && (
                    <span className="absolute top-0 right-0 bg-primary-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700">
              {label}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Submenu como tooltip lateral quando está recolhido */}
        {submenu && submenu.length > 0 && isHovering && (
          <div 
            className="fixed left-full top-0 ml-2 w-64 bg-gray-700 rounded-md shadow-lg z-50"
            style={{
              top: 'var(--submenu-top, 0)',
            }}
            onMouseEnter={(e) => {
              // Calcular posição vertical
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (rect) {
                const topPos = rect.top;
                const windowHeight = window.innerHeight;
                const submenuHeight = e.currentTarget.clientHeight;
                
                let adjustedTop = Math.min(topPos, windowHeight - submenuHeight - 20);
                adjustedTop = Math.max(10, adjustedTop);
                
                e.currentTarget.style.setProperty('--submenu-top', `${adjustedTop}px`);
              }
            }}
          >
            <div className="py-1">
              {submenu.map((item, index) => (
                <Link key={index} href={item.href}>
                  <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer">
                    {item.label}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </li>
    );
  }
  
  // Renderização normal quando o sidebar está expandido
  return (
    <li 
      className="relative sidebar-menu-item"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={href}>
        <div 
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md group cursor-pointer",
            isActive 
              ? "bg-primary-700 text-white" 
              : "text-gray-300 hover:bg-gray-700 hover:text-white"
          )}
        >
          <div className="flex items-center">
            <div className="mr-3 text-lg">
              {icon}
            </div>
            <span>{label}</span>
          </div>
          
          {badge && (
            <span className="bg-primary-500 text-white text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </Link>
      
      {submenu && submenu.length > 0 && (
        <div 
          className={cn(
            "sidebar-submenu fixed left-full top-0 ml-2 w-64 bg-gray-700 rounded-md shadow-lg z-50 transition-opacity duration-150",
            isHovering ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          style={{
            top: 'var(--submenu-top)',
            transform: 'translate3d(0, 0, 0)'
          }}
          onMouseEnter={(e) => {
            // Calcular a posição vertical do submenu
            const rect = e.currentTarget.parentElement?.getBoundingClientRect();
            if (rect) {
              const topPos = rect.top; // Posição superior do item pai
              const windowHeight = window.innerHeight;
              const submenuHeight = e.currentTarget.clientHeight;
              
              // Ajustar posição para evitar que o submenu saia da tela
              let adjustedTop = Math.min(topPos, windowHeight - submenuHeight - 20);
              adjustedTop = Math.max(10, adjustedTop); // Manter pelo menos 10px da parte superior
              
              // Aplicar a posição calculada
              e.currentTarget.style.setProperty('--submenu-top', `${adjustedTop}px`);
            }
          }}
        >
          <div className="py-1">
            {submenu.map((item, index) => (
              <Link key={index} href={item.href}>
                <div className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600 cursor-pointer">
                  {item.label}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
