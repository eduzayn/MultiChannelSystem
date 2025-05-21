import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attendance {
  id: string;
  name: string;
  channel: string;
  subject: string;
  status: 'success' | 'warning' | 'danger';
  time: string;
  isUrgent?: boolean;
}

interface AttendancesProps {
  attendances: Attendance[];
}

export function Attendances({ attendances }: AttendancesProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-0">
        <h2 className="text-lg font-medium">Atendimentos em Andamento</h2>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {attendances.map((attendance) => (
            <div key={attendance.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div 
                  className={cn(
                    "w-2 h-10 rounded-full mr-3",
                    attendance.status === 'success' && "bg-success-500",
                    attendance.status === 'warning' && "bg-warning-500",
                    attendance.status === 'danger' && "bg-danger-500"
                  )}
                ></div>
                <div>
                  <p className="font-medium">{attendance.name} - {attendance.channel}</p>
                  <p className="text-xs text-gray-500">{attendance.subject}</p>
                </div>
              </div>
              <div className="flex items-center">
                <span 
                  className={cn(
                    "text-xs px-2 py-1 rounded mr-2",
                    attendance.isUrgent 
                      ? "bg-danger-100 text-danger-800" 
                      : "bg-gray-200 text-gray-800"
                  )}
                >
                  {attendance.time}
                </span>
                <Button variant="ghost" size="icon" className="text-primary-500 hover:text-primary-700">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" variant="outline">Ver todos os atendimentos</Button>
      </CardFooter>
    </Card>
  );
}
