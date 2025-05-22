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
      <CardHeader className="pb-0 p-3 sm:p-4 md:p-6">
        <h2 className="text-base sm:text-lg font-medium">Atendimentos em Andamento</h2>
      </CardHeader>
      <CardContent className="pt-3 sm:pt-4 p-3 sm:p-4 md:p-6">
        <div className="space-y-2 sm:space-y-3">
          {attendances.map((attendance) => (
            <div key={attendance.id} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center min-w-0">
                <div 
                  className={cn(
                    "w-1.5 sm:w-2 h-8 sm:h-10 rounded-full mr-2 sm:mr-3",
                    attendance.status === 'success' && "bg-success-500",
                    attendance.status === 'warning' && "bg-warning-500",
                    attendance.status === 'danger' && "bg-danger-500"
                  )}
                ></div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium truncate">{attendance.name} - {attendance.channel}</p>
                  <p className="text-xs text-gray-500 truncate">{attendance.subject}</p>
                </div>
              </div>
              <div className="flex items-center shrink-0 ml-2">
                <span 
                  className={cn(
                    "text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded mr-1 sm:mr-2",
                    attendance.isUrgent 
                      ? "bg-danger-100 text-danger-800" 
                      : "bg-gray-200 text-gray-800"
                  )}
                >
                  {attendance.time}
                </span>
                <Button variant="ghost" size="icon" className="w-8 h-8 text-primary-500 hover:text-primary-700">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 md:p-6 pt-0 sm:pt-0 md:pt-0">
        <Button className="w-full text-xs sm:text-sm" variant="outline">Ver todos os atendimentos</Button>
      </CardFooter>
    </Card>
  );
}
