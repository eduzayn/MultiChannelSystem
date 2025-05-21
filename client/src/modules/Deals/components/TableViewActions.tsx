import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface TableViewActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
}

const TableViewActions = ({ selectedCount, onClearSelection }: TableViewActionsProps) => {
  return (
    <div className="bg-muted/50 p-2 rounded mb-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="font-medium">{selectedCount} negócios selecionados</span>
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">Ações em Lote</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            Atribuir Proprietário...
          </DropdownMenuItem>
          <DropdownMenuItem>
            Mudar Etapa do Funil...
          </DropdownMenuItem>
          <DropdownMenuItem>
            Mudar Status do Negócio...
          </DropdownMenuItem>
          <DropdownMenuItem>
            Adicionar Tags...
          </DropdownMenuItem>
          <DropdownMenuItem>
            Remover Tags...
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            Exportar Selecionados (CSV)
          </DropdownMenuItem>
          <DropdownMenuItem>
            Arquivar Selecionados
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            Excluir Selecionados
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TableViewActions;