import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BadgeCheck, Trophy } from "lucide-react";
import { SalesTeamMember, SupportTeamMember, TeamData } from "../types";
import { TrendIndicator } from "./TrendIndicator";

interface TeamRankingTableProps {
  teamData: TeamData;
  activeTeam: 'sales' | 'support';
  period: string;
}

export const TeamRankingTable: React.FC<TeamRankingTableProps> = ({ 
  teamData, 
  activeTeam, 
  period 
}) => {
  const periodLabel = activeTeam === 'sales' ? 'Q2 2025' : 'Junho 2025';
  const title = activeTeam === 'sales' ? 'Ranking de Vendedores' : 'Ranking de Atendimento';
  const description = `Desempenho dos ${activeTeam === 'sales' ? 'vendedores' : 'atendentes'} em relação às metas do período atual`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
              {title}
            </CardTitle>
            <CardDescription>
              {description}
            </CardDescription>
          </div>
          <div className="rounded-md bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {periodLabel}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {teamData.map((member, index) => (
            <div key={member.id} className="flex items-center">
              <div className="mr-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {index + 1}
              </div>
              <Avatar className="h-10 w-10 border-2 border-background">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1 flex-1">
                <div className="flex justify-between">
                  <p className="text-sm font-medium leading-none flex items-center">
                    {member.name}
                    {member.awards.length > 0 && (
                      <BadgeCheck className="ml-1 h-4 w-4 text-primary" />
                    )}
                    {member.trend !== 'same' && (
                      <span className={`ml-2 text-xs ${member.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {member.trend === 'up' ? '↑' : '↓'}
                      </span>
                    )}
                  </p>
                  <div className="text-sm text-muted-foreground">
                    {activeTeam === 'sales' 
                      ? `R$ ${(member as SalesTeamMember).sales.toLocaleString()}`
                      : `${(member as SupportTeamMember).satisfaction}% satisfação`
                    }
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">{member.role}</div>
                  <div className="text-xs text-muted-foreground">
                    {activeTeam === 'sales'
                      ? `${(member as SalesTeamMember).deals} negócios`
                      : `${(member as SupportTeamMember).tickets} tickets • ${(member as SupportTeamMember).resolution}% resolução`
                    }
                  </div>
                </div>
                <div className="flex items-center pt-2">
                  <Progress value={member.completion} className="h-2" />
                  <span className="ml-2 text-xs text-muted-foreground">
                    {member.completion}% da meta
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};