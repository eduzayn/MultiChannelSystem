import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Deal } from '../types/deals.types';
import { formatCurrency } from '@/lib/utils';

interface DealCardProps {
  deal: Deal;
}

const DealCard = ({ deal }: DealCardProps) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', deal.id);
    e.dataTransfer.effectAllowed = 'move';
    
    // Adiciona um efeito visual ao arrastar
    if (e.currentTarget instanceof HTMLElement) {
      setTimeout(() => {
        if (e.currentTarget instanceof HTMLElement) {
          e.currentTarget.style.opacity = '0.5';
        }
      }, 0);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    // Restaura o elemento ao soltar
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  // Calcular o status da data de fechamento
  const today = new Date();
  const closeDate = new Date(deal.closeDate);
  const daysUntilClose = Math.ceil((closeDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  const getCloseDateStatus = () => {
    if (daysUntilClose < 0) {
      return <span className="text-destructive font-medium">Atrasado! Prev: {closeDate.toLocaleDateString()}</span>;
    } else if (daysUntilClose <= 7) {
      return <span className="text-yellow-500 font-medium">Fecha em {daysUntilClose} dias</span>;
    } else {
      return <span>{closeDate.toLocaleDateString()}</span>;
    }
  };

  return (
    <Card 
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <CardContent className="p-3 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm line-clamp-2">{deal.name}</h3>
          <button className="opacity-50 hover:opacity-100 transition-opacity -mt-1 -mr-1 h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={deal.companyLogo} />
            <AvatarFallback>{deal.company.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{deal.company}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="font-medium">{formatCurrency(deal.value)}</span>
          <span className="text-xs">{deal.probability}%</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {getCloseDateStatus()}
        </div>

        {/* Health/Next Action indicator */}
        {deal.status === 'open' && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${
                  deal.health >= 80 ? 'bg-green-500' : 
                  deal.health >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${deal.health}%` }}
              />
            </div>
            <span className="text-xs font-medium">{deal.health}%</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div className="flex gap-1">
          {deal.tags.slice(0, 2).map(tag => (
            <Badge 
              key={tag.id}
              className="text-[10px] px-1 py-0 h-5"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color }}
            >
              {tag.name}
            </Badge>
          ))}
          {deal.tags.length > 2 && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
              +{deal.tags.length - 2}
            </Badge>
          )}
        </div>
        
        <Avatar className="h-5 w-5">
          <AvatarImage src={deal.ownerAvatar} />
          <AvatarFallback>{deal.owner.charAt(0)}</AvatarFallback>
        </Avatar>
      </CardFooter>
    </Card>
  );
};

export default DealCard;