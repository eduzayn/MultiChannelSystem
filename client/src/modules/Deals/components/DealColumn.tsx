import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Stage } from '../types/deals.types';

interface DealColumnProps {
  stage: Stage;
  deals: any[];
  children: React.ReactNode;
  onDealDrop: (dealId: string, stageId: string) => void;
}

const DealColumn = ({ stage, deals, children, onDealDrop }: DealColumnProps) => {
  // Props para drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    if (dealId) {
      console.log(`Dropping deal ${dealId} into stage ${stage.id}`);
      onDealDrop(dealId, stage.id);
    }
  };

  return (
    <Card className="w-80 flex-shrink-0 bg-muted/30 h-full">
      <CardHeader className="p-4" style={{ borderBottom: `2px solid ${stage.color}` }}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{stage.name}</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-normal text-muted-foreground">{deals.length}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent 
        className="p-3 flex flex-col gap-2 max-h-[calc(100vh-230px)] overflow-y-auto"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {children}
      </CardContent>
    </Card>
  );
};

export default DealColumn;