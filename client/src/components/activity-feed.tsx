import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MessageSquare, UserPlus, AlertTriangle } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';

export interface ActivityItem {
  id: string;
  title: string;
  description: string;
  icon: 'message' | 'check' | 'user' | 'alert' | 'info';
  timestamp: Date;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getIconForType = (type: ActivityItem['icon']) => {
    switch (type) {
      case 'message':
        return { 
          icon: <MessageSquare className="text-primary-500" />, 
          bgClass: 'bg-primary-100' 
        };
      case 'check':
        return { 
          icon: <Check className="text-success-500" />, 
          bgClass: 'bg-success-100' 
        };
      case 'user':
        return { 
          icon: <UserPlus className="text-warning-500" />, 
          bgClass: 'bg-warning-100' 
        };
      case 'alert':
        return { 
          icon: <AlertTriangle className="text-danger-500" />, 
          bgClass: 'bg-danger-100' 
        };
      case 'info':
      default:
        return { 
          icon: <MessageSquare className="text-info-500" />, 
          bgClass: 'bg-info-100' 
        };
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-0 p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-medium">Atividades Recentes</h2>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 md:pt-6 p-3 sm:p-4 md:p-6">
        <div className="space-y-3 sm:space-y-4">
          {activities.map((activity) => {
            const { icon, bgClass } = getIconForType(activity.icon);
            
            return (
              <div key={activity.id} className="flex items-start">
                <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full ${bgClass} flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0`}>
                  {icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-gray-500 truncate">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{getRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <Button className="w-full text-xs sm:text-sm" variant="outline">Ver todas as atividades</Button>
      </CardFooter>
    </Card>
  );
}
