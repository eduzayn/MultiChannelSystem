import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Performer {
  id: string;
  name: string;
  avatar: string;
  attendances: number;
  score: number;
}

interface TopPerformersProps {
  performers: Performer[];
}

export function TopPerformers({ performers }: TopPerformersProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-0 p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-medium">Top Performers</h2>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4 md:p-6">
        <div className="space-y-2 sm:space-y-3">
          {performers.map((performer) => (
            <div key={performer.id} className="flex items-center p-2 rounded-lg hover:bg-gray-50">
              <div className="flex-shrink-0 mr-2 sm:mr-3">
                <img 
                  src={performer.avatar} 
                  alt={performer.name} 
                  className="h-7 w-7 sm:h-8 sm:w-8 rounded-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate">{performer.name}</p>
                <p className="text-xs text-gray-500">{performer.attendances} atendimentos</p>
              </div>
              <div className="ml-2 flex-shrink-0">
                <Badge variant="outline" className="text-xs bg-primary-100 text-primary-800 hover:bg-primary-100">
                  {performer.score}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
