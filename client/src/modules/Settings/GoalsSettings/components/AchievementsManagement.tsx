import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Award, Edit, PlusCircle, Trash, Trophy } from "lucide-react";

// Mock de conquistas configuradas
const achievementsMock = [
  {
    id: 1,
    name: "Super Vendedor",
    description: "Atinja mais de 150% da meta de vendas em um trimestre",
    type: "performance",
    icon: "trophy",
    badgeColor: "gold",
    points: 1000,
    status: "active",
  },
  {
    id: 2,
    name: "Campeão de Negócios",
    description: "Feche mais de 10 negócios em um único mês",
    type: "performance",
    icon: "award",
    badgeColor: "blue",
    points: 800,
    status: "active",
  },
  {
    id: 3,
    name: "Especialista em Produtos",
    description: "Complete todos os treinamentos de produtos",
    type: "learning",
    icon: "education",
    badgeColor: "green",
    points: 500,
    status: "active",
  },
  {
    id: 4,
    name: "Engajador Social",
    description: "Obtenha mais de 100 interações em publicações da empresa",
    type: "engagement",
    icon: "social",
    badgeColor: "purple",
    points: 300,
    status: "inactive",
  },
];

export const AchievementsManagement = () => {
  const [achievements, setAchievements] = useState(achievementsMock);
  const [openDialog, setOpenDialog] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Conquistas</h2>
          <p className="text-muted-foreground">
            Crie e gerencie insígnias e conquistas para seus usuários
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nova Conquista
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Conquista</DialogTitle>
              <DialogDescription>
                Defina os detalhes e condições para a nova conquista.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="achievement-name">Nome da Conquista</Label>
                <Input id="achievement-name" placeholder="Ex: Super Vendedor" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="achievement-description">Descrição</Label>
                <Textarea 
                  id="achievement-description" 
                  placeholder="Descreva como os usuários podem conquistar esta insígnia..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="achievement-type">Tipo</Label>
                  <Select>
                    <SelectTrigger id="achievement-type">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="learning">Aprendizado</SelectItem>
                      <SelectItem value="engagement">Engajamento</SelectItem>
                      <SelectItem value="contribution">Contribuição</SelectItem>
                      <SelectItem value="special">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="achievement-icon">Ícone</Label>
                  <Select>
                    <SelectTrigger id="achievement-icon">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trophy">Troféu</SelectItem>
                      <SelectItem value="award">Medalha</SelectItem>
                      <SelectItem value="education">Educação</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="star">Estrela</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="badge-color">Cor do Emblema</Label>
                  <Select>
                    <SelectTrigger id="badge-color">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gold">Dourado</SelectItem>
                      <SelectItem value="silver">Prata</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="red">Vermelho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="points">Pontos</Label>
                  <Input 
                    id="points" 
                    type="number" 
                    placeholder="Ex: 500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="achievement-condition">Condição para Conquista</Label>
                <Textarea 
                  id="achievement-condition" 
                  placeholder="Descreva a condição técnica para conquistar esta insígnia..."
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Exemplo: "sales_goal_completion maior que 1.5 E period igual quarterly"
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={() => setOpenDialog(false)}>Salvar Conquista</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {achievement.icon === "trophy" && <Trophy className="h-5 w-5 text-amber-500" />}
                  {achievement.icon === "award" && <Award className="h-5 w-5 text-blue-500" />}
                  <CardTitle className="text-base">{achievement.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>{achievement.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 items-center text-sm">
                <Badge 
                  variant="outline" 
                  className={
                    achievement.badgeColor === "gold" ? "bg-amber-100 text-amber-800 border-amber-300" :
                    achievement.badgeColor === "blue" ? "bg-blue-100 text-blue-800 border-blue-300" :
                    achievement.badgeColor === "green" ? "bg-green-100 text-green-800 border-green-300" :
                    achievement.badgeColor === "purple" ? "bg-purple-100 text-purple-800 border-purple-300" : ""
                  }
                >
                  {achievement.points} pontos
                </Badge>
                
                <Badge variant="secondary">
                  {achievement.type === "performance" && "Performance"}
                  {achievement.type === "learning" && "Aprendizado"}
                  {achievement.type === "engagement" && "Engajamento"}
                </Badge>
                
                {achievement.status === "inactive" && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Inativa
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="flex justify-end">
        <Button>Salvar Alterações</Button>
      </div>
    </div>
  );
};