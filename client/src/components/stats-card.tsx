import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBgColor: string;
  iconColor: string;
  changeValue: number;
  changeText: string;
  isPositive?: boolean;
  isLoading?: boolean;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor,
  iconColor,
  changeValue,
  changeText,
  isPositive = true,
  isLoading = false
}: StatsCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-3 sm:p-4 md:p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
            {isLoading ? (
              <div className="flex items-center mt-1">
                <Loader2 className="h-4 w-4 mr-2 animate-spin text-gray-400" />
                <p className="text-xl sm:text-2xl font-semibold text-gray-400">Carregando...</p>
              </div>
            ) : (
              <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
            )}
          </div>
          <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center", iconBgColor)}>
            <div className={cn("text-lg sm:text-xl", iconColor)}>
              {icon}
            </div>
          </div>
        </div>
        <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
          {isLoading ? (
            <span className="text-gray-400">Carregando dados...</span>
          ) : (
            <>
              <span className={cn("flex items-center", isPositive ? "text-success-500" : "text-destructive")}>
                {isPositive ? <ArrowUp className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> : <ArrowDown className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />}
                {changeValue}%
              </span>
              <span className="text-gray-500 ml-1 sm:ml-2">{changeText}</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
