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
      <CardContent className="p-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", iconBgColor)}>
            <div className={cn("text-xl", iconColor)}>
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className={cn("flex items-center", isPositive ? "text-success-500" : "text-destructive")}>
            {isPositive ? <ArrowUp className="mr-1 h-4 w-4" /> : <ArrowDown className="mr-1 h-4 w-4" />}
            {changeValue}%
          </span>
          <span className="text-gray-500 ml-2">{changeText}</span>
        </div>
      </CardContent>
    </Card>
  );
}
