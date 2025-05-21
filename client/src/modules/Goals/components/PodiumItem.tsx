import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy } from "lucide-react";
import { TeamMember, SalesTeamMember, SupportTeamMember } from "../types";
import { TrendIndicator } from "./TrendIndicator";

interface PodiumItemProps {
  position: 1 | 2 | 3;
  member?: TeamMember;
  activeTeam: 'sales' | 'support';
  metric: string;
}

export const PodiumItem: React.FC<PodiumItemProps> = ({ 
  position, 
  member, 
  activeTeam,
  metric 
}) => {
  if (!member) return <div className="invisible"></div>;

  // Determine styling based on position
  const positionStyles = {
    1: {
      avatarWrapperClasses: "w-32 h-32 rounded-full bg-gray-100 border-4 border-yellow-500 flex items-center justify-center shadow-lg mb-2",
      avatarClasses: "w-28 h-28",
      badgeClasses: "absolute top-0 right-0 bg-yellow-500 text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow-md",
      nameClasses: "font-bold text-lg text-center mt-1",
      containerClasses: "flex flex-col items-center animate-scale-in",
      showTrophy: true
    },
    2: {
      avatarWrapperClasses: "w-24 h-24 rounded-full bg-gray-100 border-4 border-silver flex items-center justify-center shadow-lg mb-2",
      avatarClasses: "w-20 h-20",
      badgeClasses: "absolute top-0 right-0 bg-silver text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white shadow-md",
      nameClasses: "font-medium text-center mt-1",
      containerClasses: "flex flex-col items-center animate-fade-in",
      showTrophy: false
    },
    3: {
      avatarWrapperClasses: "w-24 h-24 rounded-full bg-gray-100 border-4 border-amber-700 flex items-center justify-center shadow-lg mb-2",
      avatarClasses: "w-20 h-20",
      badgeClasses: "absolute top-0 right-0 bg-amber-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold border-2 border-white shadow-md",
      nameClasses: "font-medium text-center mt-1",
      containerClasses: "flex flex-col items-center animate-fade-in",
      showTrophy: false
    }
  };

  // Get the metric value to display based on team and metric type
  const getMetricValue = () => {
    const salesMember = member as SalesTeamMember;
    const supportMember = member as SupportTeamMember;
    
    if (activeTeam === 'sales') {
      if (metric === 'deals') return `${salesMember.deals} negócios`;
      return `R$ ${salesMember.sales.toLocaleString()}`;
    } else {
      if (metric === 'tickets') return `${supportMember.tickets} tickets`;
      return `${supportMember.satisfaction}% satisfação`;
    }
  };

  const style = positionStyles[position];

  return (
    <div className={style.containerClasses}>
      <div className="relative">
        <div className={style.avatarWrapperClasses}>
          <Avatar className={style.avatarClasses}>
            <AvatarImage src={member.avatar} />
            <AvatarFallback className={position === 1 ? "text-2xl font-bold" : "text-xl font-bold"}>
              {member.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className={style.badgeClasses}>{position}</div>
        {style.showTrophy && <Trophy className="absolute bottom-0 right-0 text-yellow-500 h-8 w-8" />}
      </div>
      <h3 className={style.nameClasses}>{member.name}</h3>
      <p className={position === 1 ? "text-sm font-medium text-center" : "text-sm text-muted-foreground text-center"}>
        {getMetricValue()}
      </p>
      <div className="mt-1">
        <TrendIndicator trend={member.trend} />
      </div>
    </div>
  );
};