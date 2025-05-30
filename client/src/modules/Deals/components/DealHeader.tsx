import { useState } from 'react';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { ViewMode } from '../types/deals.types';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

interface DealHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onSearchChange?: (search: string) => void;
  onShowFilters?: () => void;
}

// Schema para validação do formulário
const dealFormSchema = z.object({
  name: z.string().min(1, 'Nome do negócio é obrigatório'),
  company: z.string().min(1, 'Empresa é obrigatória'),
  value: z.string().min(1, 'Valor é obrigatório'),
  expectedCloseDate: z.string().min(1, 'Data de fechamento é obrigatória'),
  stage: z.string().min(1, 'Etapa é obrigatória')
});

type DealFormValues = z.infer<typeof dealFormSchema>;

const DealHeader = ({ viewMode, onViewModeChange, onSearchChange, onShowFilters }: DealHeaderProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      name: '',
      company: '',
      value: '',
      expectedCloseDate: '',
      stage: 'prospecting'
    }
  });

  const onSubmit = (data: DealFormValues) => {
    // Aqui seria implementada a lógica para salvar o negócio
    console.log('Novo negócio:', data);
    
    toast({
      title: "Negócio criado com sucesso!",
      description: `${data.name} foi adicionado ao funil de vendas.`,
    });
    
    setIsDialogOpen(false);
    form.reset();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <div className="border-b space-y-4 pb-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Funil de Vendas</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={viewMode === 'kanban' ? 'bg-muted' : ''}
            onClick={() => onViewModeChange('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className={viewMode === 'table' ? 'bg-muted' : ''}
            onClick={() => onViewModeChange('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Negócio
            </Button>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Negócio</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Negócio</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Implementação CRM para Empresa X" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Selecione ou digite o nome da empresa" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Estimado (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0,00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="expectedCloseDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Fechamento Prevista</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Etapa Inicial</FormLabel>
                        <FormControl>
                          <select 
                            className="w-full border rounded p-2 h-10" 
                            {...field}
                          >
                            <option value="prospecting">Prospecção</option>
                            <option value="qualification">Qualificação</option>
                            <option value="proposal">Proposta</option>
                            <option value="negotiation">Negociação</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      Criar Negócio
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar negócios..."
            className="pl-8"
            onChange={handleSearch}
          />
        </div>
        <Button 
          variant="outline"
          onClick={onShowFilters}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
        </Button>
      </div>
    </div>
  );
};

export default DealHeader;