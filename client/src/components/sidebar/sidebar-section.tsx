import { ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  children: ReactNode;
}

export function SidebarSection({ title, children }: SidebarSectionProps) {
  return (
    <div className="mb-6">
      <div className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
        {title}
      </div>
      <ul className="space-y-1">
        {children}
      </ul>
    </div>
  );
}
