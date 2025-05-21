import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, MessageSquare, UserPlus, AlertTriangle } from 'lucide-react';
import { getRelativeTime } from '@/lib/utils';

interface ActivityItem {
  id: string;
  title: string;
  description: string;
  icon: 'message' | 'check' | 'user' | 'alert';
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
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-0">
        <h2 className="text-lg font-medium">Atividades Recentes</h2>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {activities.map((activity) => {
            const { icon, bgClass } = getIconForType(activity.icon);
            
            return (
              <div key={activity.id} className="flex items-start">
                <div className={`h-10 w-10 rounded-full ${bgClass} flex items-center justify-center mr-3 flex-shrink-0`}>
                  {icon}
                </div>
                <div>
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{getRelativeTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">Ver todas as atividades</Button>
      </CardFooter>
    </Card>
  );
}
