import React from 'react';
import { format, isToday, isYesterday, isThisYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Separator } from "@/components/ui/separator";

interface DateSeparatorProps {
  date: Date;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const formatDateLabel = (date: Date): string => {
    if (isToday(date)) {
      return 'Hoje';
    } else if (isYesterday(date)) {
      return 'Ontem';
    } else if (isThisYear(date)) {
      return format(date, "dd 'de' MMMM", { locale: ptBR });
    } else {
      return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }
  };

  return (
    <div className="flex items-center justify-center my-4">
      <Separator className="w-full" />
      <div className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground mx-2 shrink-0">
        {formatDateLabel(date)}
      </div>
      <Separator className="w-full" />
    </div>
  );
};