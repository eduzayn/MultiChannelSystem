import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  changeValue: number;
  changeText: string;
  isPositive?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changeValue,
  changeText,
  isPositive = true
}: StatsCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
            <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center", iconBgColor)}>
            <div className={cn("text-lg sm:text-xl", iconColor)}>
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
          <span className={cn("flex items-center", isPositive ? "text-success-500" : "text-destructive")}>
            {isPositive ? <ArrowUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />}
            {changeValue}%
          </span>
          <span className="text-gray-500 ml-1 sm:ml-2">{changeText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
