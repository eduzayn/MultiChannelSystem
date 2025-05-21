import React from 'react';
import { useDeals } from '../hooks/useDeals';
import DealColumn from './DealColumn';
import DealCard from './DealCard';

const KanbanView = () => {
  const { dealGroups, moveDeal, stages } = useDeals();
  
  return (
    <div className="flex-1 overflow-auto">
      <div className="flex gap-4 p-4 h-full overflow-x-auto">
        {stages.map(stage => (
          <DealColumn 
            key={stage.id} 
            stage={stage}
            deals={dealGroups[stage.id] || []}
            onDealDrop={moveDeal}
          >
            {(dealGroups[stage.id] || []).map(deal => (
              <DealCard
                key={deal.id}
                deal={deal}
              />
            ))}
          </DealColumn>
        ))}
      </div>
    </div>
  );
};

export default KanbanView;