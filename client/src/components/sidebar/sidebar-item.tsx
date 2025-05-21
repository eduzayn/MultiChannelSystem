import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

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
  const isActive = location === href;
  
  return (
    <li 
      className="relative sidebar-menu-item"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link href={href}>
        <a 
          className={cn(
            "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md group",
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
        </a>
      </Link>
      
      {submenu && submenu.length > 0 && (
        <div 
          className={cn(
            "sidebar-submenu absolute left-full top-0 ml-2 w-64 bg-gray-700 rounded-md shadow-lg z-10",
            isHovering ? "block" : "hidden"
          )}
        >
          <div className="py-1">
            {submenu.map((item, index) => (
              <Link key={index} href={item.href}>
                <a className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-600">
                  {item.label}
                </a>
              </Link>
            ))}
          </div>
        </div>
      )}
    </li>
  );
}
