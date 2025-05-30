import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, AlertTriangle, Settings } from 'lucide-react';

export type IntegrationStatus = 'connected' | 'error' | 'not_connected';

interface IntegrationCardProps {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: IntegrationStatus;
  onActionClick: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  name,
  description,
  logo,
  status,
  onActionClick
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <Check className="h-3 w-3" />
            <span>Conectado</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
            <AlertTriangle className="h-3 w-3" />
            <span>Requer atenção</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground px-2 py-1 rounded-full">
            <span>Não conectado</span>
          </div>
        );
    }
  };

  const getActionButton = () => {
    switch (status) {
      case 'connected':
        return (
          <Button onClick={onActionClick} variant="outline" className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Gerenciar
          </Button>
        );
      case 'error':
        return (
          <Button onClick={onActionClick} variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Corrigir
          </Button>
        );
      default:
        return (
          <Button onClick={onActionClick} className="w-full">
            Conectar
          </Button>
        );
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 mr-3 flex-shrink-0">
              <img
                src={logo}
                alt={`${name} logo`}
                className="h-full w-full object-contain"
              />
            </div>
            <CardTitle className="text-lg">{name}</CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        {getActionButton()}
      </CardFooter>
    </Card>
  );
};