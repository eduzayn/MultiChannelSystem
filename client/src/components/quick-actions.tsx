import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { PlusCircle, Mail, ListTodo, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: 'contact' | 'email' | 'task' | 'campaign';
  label: string;
  href: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export function QuickActions({ actions }: QuickActionsProps) {
  const getIconForType = (type: QuickAction['icon']) => {
    switch (type) {
      case 'contact':
        return { 
          icon: <PlusCircle className="mb-1" />, 
          color: 'text-success-500' 
        };
      case 'email':
        return { 
          icon: <Mail className="mb-1" />, 
          color: 'text-primary-500' 
        };
      case 'task':
        return { 
          icon: <ListTodo className="mb-1" />, 
          color: 'text-secondary-500' 
        };
      case 'campaign':
        return { 
          icon: <Megaphone className="mb-1" />, 
          color: 'text-warning-500' 
        };
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-0 p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-medium">Ações Rápidas</h2>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, index) => {
            const { icon, color } = getIconForType(action.icon);
            
            return (
              <button key={index} className="p-2 sm:p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left">
                <div className={color}>
                  {icon}
                </div>
                <div className="text-xs sm:text-sm font-medium">{action.label}</div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
