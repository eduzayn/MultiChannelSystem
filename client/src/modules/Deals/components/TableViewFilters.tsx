import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useDeals } from '../hooks/useDeals';

interface TableViewFiltersProps {
  onClose: () => void;
}

const TableViewFilters = ({ onClose }: TableViewFiltersProps) => {
  const { stages } = useDeals();

  return (
    <div className="border rounded-md shadow-sm p-4 mb-4 bg-background">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Filtrar Negócios</h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Filtros Básicos</TabsTrigger>
          <TabsTrigger value="advanced">Filtros Avançados</TabsTrigger>
          <TabsTrigger value="custom">Campos Personalizados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Proprietário */}
            <div className="space-y-2">
              <Label htmlFor="owner">Proprietário do Negócio</Label>
              <select id="owner" className="w-full border rounded p-2">
                <option value="">Todos os proprietários</option>
                <option value="1">João Silva</option>
                <option value="2">Maria Oliveira</option>
                <option value="3">Carlos Santos</option>
              </select>
            </div>

            {/* Etapa */}
            <div className="space-y-2">
              <Label>Etapa do Funil</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded p-2">
                {stages.map(stage => (
                  <div key={stage.id} className="flex items-center gap-2">
                    <Checkbox id={`stage-${stage.id}`} />
                    <Label htmlFor={`stage-${stage.id}`} className="text-sm cursor-pointer">{stage.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status do Negócio</Label>
              <div className="space-y-2 border rounded p-2">
                <div className="flex items-center gap-2">
                  <Checkbox id="status-open" />
                  <Label htmlFor="status-open" className="text-sm cursor-pointer">Aberto</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="status-won" />
                  <Label htmlFor="status-won" className="text-sm cursor-pointer">Ganho</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="status-lost" />
                  <Label htmlFor="status-lost" className="text-sm cursor-pointer">Perdido</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="status-onhold" />
                  <Label htmlFor="status-onhold" className="text-sm cursor-pointer">Em Espera</Label>
                </div>
              </div>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label>Valor do Negócio</Label>
              <div className="flex gap-2 items-center">
                <Input type="number" placeholder="De" className="w-full" />
                <span>até</span>
                <Input type="number" placeholder="Até" className="w-full" />
              </div>
            </div>

            {/* Data de Fechamento Prevista */}
            <div className="space-y-2">
              <Label>Data de Fechamento Prevista</Label>
              <div className="flex gap-2 items-center">
                <Input type="date" className="w-full" />
                <span>até</span>
                <Input type="date" className="w-full" />
              </div>
            </div>

            {/* Empresa */}
            <div className="space-y-2">
              <Label htmlFor="company">Empresa Associada</Label>
              <Input id="company" placeholder="Buscar empresa..." />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Data de Criação */}
            <div className="space-y-2">
              <Label>Data de Criação</Label>
              <div className="flex gap-2 items-center">
                <Input type="date" className="w-full" />
                <span>até</span>
                <Input type="date" className="w-full" />
              </div>
            </div>

            {/* Origem do Negócio */}
            <div className="space-y-2">
              <Label>Origem do Negócio</Label>
              <select className="w-full border rounded p-2">
                <option value="">Todas as origens</option>
                <option value="website">Website</option>
                <option value="referral">Indicação</option>
                <option value="email">Email Marketing</option>
                <option value="social">Redes Sociais</option>
                <option value="event">Evento</option>
              </select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <Input placeholder="Buscar tags..." />
              <div className="flex flex-wrap gap-1 mt-2">
                <Badge variant="outline">Urgente</Badge>
                <Badge variant="outline">Proposta</Badge>
                <Badge variant="outline">Novo cliente</Badge>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Esta seção exibirá campos personalizados configurados pelo tenant para o módulo de Negócios.
            </p>
            <div className="p-8 border rounded flex items-center justify-center text-muted-foreground">
              Nenhum campo personalizado configurado
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-6">
        <div className="space-x-2">
          <Button variant="secondary">Limpar Filtros</Button>
          <Button variant="outline">Salvar Visualização Atual</Button>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button>Aplicar Filtros</Button>
        </div>
      </div>
    </div>
  );
};

export default TableViewFilters;