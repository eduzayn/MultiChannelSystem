import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Rocket, MoreHorizontal, Zap, Activity, Calendar, FileText, Copy, Play, Pause, BarChart2, ArrowDown, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { automations } from "../data/mockAutomations";
import { Automation } from "../types/automation.types";
import { cn } from "@/lib/utils";

interface AutomationsListProps {
  filterStatus: string;
  searchQuery: string;
}

const AutomationsList = ({ filterStatus, searchQuery }: AutomationsListProps) => {
  const [automationList, setAutomationList] = useState<Automation[]>(automations);
  
  // Filter automations based on status and search query
  const filteredAutomations = automationList.filter(automation => {
    // Filter by status
    if (filterStatus !== "all" && automation.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !automation.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Toggle automation status
  const toggleAutomationStatus = (id: string) => {
    setAutomationList(prev => prev.map(automation => {
      if (automation.id === id) {
        const newStatus = automation.status === "active" ? "paused" : "active";
        return { ...automation, status: newStatus };
      }
      return automation;
    }));
  };

  // Status badge variations
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>;
      case "paused":
        return <Badge variant="outline">Pausado</Badge>;
      case "draft":
        return <Badge variant="secondary">Rascunho</Badge>;
      case "error":
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Icon based on trigger type
  const getTriggerIcon = (triggerType: string) => {
    switch (triggerType) {
      case "contact":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "deal":
        return <BarChart2 className="h-4 w-4 text-green-500" />;
      case "time":
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case "event":
        return <Activity className="h-4 w-4 text-orange-500" />;
      default:
        return <Zap className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredAutomations.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <h3 className="text-lg font-medium">Nenhuma automação encontrada</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? "Tente ajustar sua busca ou" : "Comece"} criando uma nova automação.
          </p>
          <Button className="mt-4">Nova Automação</Button>
        </div>
      ) : (
        filteredAutomations.map(automation => (
          <Card key={automation.id} className={cn(
            "transition-all duration-200",
            automation.status === "error" && "border-red-200"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {automation.name}
                  {automation.status === "error" && (
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                      2 erros
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{automation.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(automation.status)}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Editar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      <span>Estatísticas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Activity className="mr-2 h-4 w-4" />
                      <span>Logs de Execução</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Clonar</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Excluir</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center text-sm">
                  <div className="mr-2">{getTriggerIcon(automation.triggerType)}</div>
                  <div><span className="font-medium">Gatilho:</span> {automation.triggerName}</div>
                </div>
                
                <div className="flex justify-between text-sm items-center">
                  <div className="flex gap-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Ativos</div>
                      <div className="font-medium">{automation.activeEntities}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Completados</div>
                      <div className="font-medium">{automation.completedEntities}</div>
                    </div>
                  </div>
                  
                  <Switch
                    checked={automation.status === "active"}
                    onCheckedChange={() => toggleAutomationStatus(automation.id)}
                    disabled={automation.status === "draft" || automation.status === "error"}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">
                Editar
              </Button>
              <Button variant="outline" size="sm">
                Estatísticas
              </Button>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default AutomationsList;