import React from "react";
import { TeamData } from "../types";
import { PodiumItem } from "./PodiumItem";

interface PodiumProps {
  salesData: TeamData;
  supportData: TeamData;
  activeTeam: 'sales' | 'support';
  metric: string;
}

export const Podium: React.FC<PodiumProps> = ({
  salesData,
  supportData,
  activeTeam,
  metric
}) => {
  const data = activeTeam === 'sales' ? salesData : supportData;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Segundo lugar */}
      <PodiumItem 
        position={2} 
        member={data.length > 1 ? data[1] : undefined} 
        activeTeam={activeTeam}
        metric={metric}
      />
      
      {/* Primeiro lugar */}
      <PodiumItem 
        position={1} 
        member={data.length > 0 ? data[0] : undefined} 
        activeTeam={activeTeam}
        metric={metric}
      />
      
      {/* Terceiro lugar */}
      <PodiumItem 
        position={3} 
        member={data.length > 2 ? data[2] : undefined} 
        activeTeam={activeTeam}
        metric={metric}
      />
    </div>
  );
};