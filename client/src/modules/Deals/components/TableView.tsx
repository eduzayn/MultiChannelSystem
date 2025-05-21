import { useState } from 'react';
import { useDeals } from '../hooks/useDeals';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import TableViewFilters from './TableViewFilters';
import TableViewActions from './TableViewActions';
import { Deal } from '../types/deals.types';

type SortField = keyof Deal | null;
type SortDirection = 'asc' | 'desc';

const TableView = () => {
  const { deals } = useDeals();
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeals(deals.map(deal => deal.id));
    } else {
      setSelectedDeals([]);
    }
  };

  const handleSelectDeal = (dealId: string, checked: boolean) => {
    if (checked) {
      setSelectedDeals([...selectedDeals, dealId]);
    } else {
      setSelectedDeals(selectedDeals.filter(id => id !== dealId));
    }
  };

  // Calcular totais para o resumo
  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const averageValue = deals.length > 0 ? totalValue / deals.length : 0;

  // Paginação
  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, deals.length);
  const currentDeals = deals.slice(startIndex, endIndex);

  // Funções de navegação
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {selectedDeals.length > 0 && (
        <TableViewActions 
          selectedCount={selectedDeals.length} 
          onClearSelection={() => setSelectedDeals([])} 
        />
      )}
      
      {showFilters && (
        <TableViewFilters onClose={() => setShowFilters(false)} />
      )}
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableCaption className="caption-top pb-2">
            <div className="flex justify-between items-center">
              <span>
                Mostrando {startIndex + 1}-{endIndex} de {deals.length} negócios
              </span>
              <div className="text-sm flex items-center gap-4">
                <span>Valor Total: {formatCurrency(totalValue)}</span>
                <span>Valor Médio: {formatCurrency(averageValue)}</span>
              </div>
            </div>
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox 
                  checked={selectedDeals.length === deals.length && deals.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Nome
                {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('company')}
              >
                Empresa
                {sortField === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('value')}
              >
                Valor
                {sortField === 'value' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('stage')}
              >
                Etapa
                {sortField === 'stage' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('probability')}
              >
                Probabilidade
                {sortField === 'probability' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('closeDate')}
              >
                Data Prev. Fechamento
                {sortField === 'closeDate' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => handleSort('owner')}
              >
                Proprietário
                {sortField === 'owner' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentDeals.map(deal => (
              <TableRow key={deal.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedDeals.includes(deal.id)} 
                    onCheckedChange={(checked) => handleSelectDeal(deal.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <a href="#" className="text-primary hover:underline">
                    {deal.name}
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={deal.companyLogo} alt={deal.company} />
                      <AvatarFallback>{deal.company.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{deal.company}</span>
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(deal.value)}</TableCell>
                <TableCell>
                  <Badge variant="outline" style={{ backgroundColor: deal.stageColor + '20', borderColor: deal.stageColor }}>
                    {deal.stage}
                  </Badge>
                </TableCell>
                <TableCell>{deal.probability}%</TableCell>
                <TableCell>{new Date(deal.closeDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={deal.ownerAvatar} alt={deal.owner} />
                      <AvatarFallback>{deal.owner.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{deal.owner}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {deal.tags.map(tag => (
                      <Badge key={tag.id} variant="secondary" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Paginação */}
      <div className="border-t py-4 flex justify-between items-center px-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{endIndex} de {deals.length} negócios
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm mx-2">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <select
            className="border rounded px-2 py-1 text-sm"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
            <option value={100}>100 por página</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TableView;