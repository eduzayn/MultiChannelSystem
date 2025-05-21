import { useState } from 'react';
import { ViewMode } from './types/deals.types';
import DealHeader from './components/DealHeader';
import KanbanView from './components/KanbanView';
import TableView from './components/TableView';

export default function DealsModule() {
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleShowFilters = () => {
    setShowFilters(true);
  };

  const handleSearchChange = (search: string) => {
    setSearchTerm(search);
  };

  return (
    <div className="flex flex-col h-full">
      <DealHeader 
        viewMode={viewMode} 
        onViewModeChange={handleViewModeChange}
        onSearchChange={handleSearchChange}
        onShowFilters={handleShowFilters}
      />
      
      {viewMode === 'kanban' ? (
        <KanbanView />
      ) : (
        <TableView />
      )}
    </div>
  );
}