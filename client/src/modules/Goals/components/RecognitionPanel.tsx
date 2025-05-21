import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Award, BadgeCheck, Gift, Medal, Star, ThumbsUp, Trophy, Bell, Volume2, VolumeX } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Tipos para os reconhecimentos
interface Recognition {
  id: number;
  type: "achievement" | "badge" | "milestone" | "recognition";
  title: string;
  description: string;
  date: string;
  user: {
    name: string;
    avatar: string;
    department: string;
  };
  icon: React.ElementType;
  color: string;
  likes: number;
  isLiked?: boolean;
  sound?: string;
}

// Dados de reconhecimentos
const recognitions: Recognition[] = [
  {
    id: 1,
    type: "achievement",
    title: "Top Vendedor do Trimestre",
    description: "Parabéns a Ana Silva por alcançar 156% da meta trimestral!",
    date: "10 de junho, 2025",
    user: {
      name: "Ana Silva",
      avatar: "",
      department: "Vendas",
    },
    icon: Trophy,
    color: "text-yellow-500",
    likes: 24,
    sound: "/sounds/achievement.mp3"
  },
  {
    id: 2,
    type: "badge",
    title: "Herói do Atendimento",
    description: "Marcos Santos recebeu 15 avaliações 5 estrelas consecutivas dos clientes!",
    date: "7 de junho, 2025",
    user: {
      name: "Marcos Santos",
      avatar: "",
      department: "Atendimento",
    },
    icon: Star,
    color: "text-blue-500",
    likes: 18,
  },
  {
    id: 3,
    type: "milestone",
    title: "1 Ano de Empresa",
    description: "Fernanda Lima completa 1 ano conosco! Agradecemos seu comprometimento e dedicação.",
    date: "5 de junho, 2025",
    user: {
      name: "Fernanda Lima",
      avatar: "",
      department: "Vendas",
    },
    icon: Gift,
    color: "text-purple-500",
    likes: 31,
  },
  {
    id: 4,
    type: "achievement",
    title: "Meta de Satisfação Batida",
    description: "A equipe de atendimento ultrapassou a meta de 95% de satisfação neste mês!",
    date: "3 de junho, 2025",
    user: {
      name: "Equipe de Atendimento",
      avatar: "",
      department: "Atendimento",
    },
    icon: Award,
    color: "text-emerald-500",
    likes: 27,
    sound: "/sounds/team-achievement.mp3"
  },
  {
    id: 5,
    type: "recognition",
    title: "Espírito de Equipe",
    description: "Carlos Oliveira reconhecido pelo gestor por sua colaboração excepcional com novos membros da equipe.",
    date: "1 de junho, 2025",
    user: {
      name: "Carlos Oliveira",
      avatar: "",
      department: "Vendas",
    },
    icon: Medal,
    color: "text-orange-500",
    likes: 22,
  },
];

// Novas conquistas simulando chegada em tempo real
const newRecognitions: Recognition[] = [
  {
    id: 6,
    type: "achievement",
    title: "Venda Recorde do Mês",
    description: "Ricardo Almeida acaba de fechar uma venda de R$ 250.000! Novo recorde mensal!",
    date: "Agora mesmo",
    user: {
      name: "Ricardo Almeida",
      avatar: "",
      department: "Vendas",
    },
    icon: Trophy,
    color: "text-yellow-500",
    likes: 0,
    sound: "/sounds/big-achievement.mp3"
  },
  {
    id: 7,
    type: "badge",
    title: "Atendimento Perfeito",
    description: "Camila Duarte atingiu 100% de satisfação nos últimos 20 atendimentos!",
    date: "Agora mesmo",
    user: {
      name: "Camila Duarte",
      avatar: "",
      department: "Atendimento",
    },
    icon: Star,
    color: "text-blue-500",
    likes: 0,
  },
];

export const RecognitionPanel = () => {
  const { toast } = useToast();
  const [feedItems, setFeedItems] = useState<Recognition[]>(recognitions);
  const [typeFilter, setTypeFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Função para filtrar os reconhecimentos
  const getFilteredRecognitions = () => {
    return feedItems.filter(item => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const matchesDepartment = departmentFilter === "all" || item.user.department.toLowerCase() === departmentFilter;
      return matchesType && matchesDepartment;
    });
  };
  
  // Função para curtir um reconhecimento
  const handleLike = (id: number) => {
    setFeedItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, likes: item.isLiked ? item.likes - 1 : item.likes + 1, isLiked: !item.isLiked } 
          : item
      )
    );
  };
  
  // Efeito para simular entrada de novos reconhecimentos
  useEffect(() => {
    // Simulação para fins de demonstração - não implementaremos completamente a funcionalidade de som
    const addNewRecognition = (index: number) => {
      setTimeout(() => {
        const newItem = newRecognitions[index];
        setFeedItems(prev => [newItem, ...prev]);
        
        // Exibir toast de notificação
        toast({
          title: `🎉 ${newItem.title}`,
          description: newItem.description,
        });
        
      }, (index + 1) * 10000); // Adicionar a cada 10 segundos
    };
    
    // Agendar adição dos novos reconhecimentos
    newRecognitions.forEach((_, index) => {
      addNewRecognition(index);
    });
    
    // Limpar timeouts quando o componente desmontar
    return () => {
      // Cleanup não é necessário pois os timeouts são de execução única
    };
  }, [soundEnabled, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium">Painel de Reconhecimento Público</h3>
        <div className="flex space-x-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Tipo de reconhecimento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os reconhecimentos</SelectItem>
              <SelectItem value="achievement">Conquistas</SelectItem>
              <SelectItem value="badge">Medalhas</SelectItem>
              <SelectItem value="milestone">Marcos</SelectItem>
              <SelectItem value="recognition">Reconhecimentos</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os departamentos</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="atendimento">Atendimento</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            title={soundEnabled ? "Desativar sons" : "Ativar sons"}
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Contador de celebrações */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="h-5 w-5 mr-2 text-primary" />
            <span className="font-medium">Hoje já celebramos:</span>
          </div>
          <div className="flex space-x-4">
            <div className="flex items-center">
              <Trophy className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-sm">{feedItems.filter(item => item.type === "achievement").length} Conquistas</span>
            </div>
            <div className="flex items-center">
              <Star className="h-4 w-4 mr-1 text-blue-500" />
              <span className="text-sm">{feedItems.filter(item => item.type === "badge").length} Medalhas</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-4 w-4 mr-1 text-purple-500" />
              <span className="text-sm">{feedItems.filter(item => item.type === "milestone").length} Marcos</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Lista de reconhecimentos */}
      <div className="space-y-4">
        {getFilteredRecognitions().map(item => (
          <Card key={item.id} className="overflow-hidden">
            <div className="flex items-start p-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.color} bg-opacity-10 mr-4`}>
                <item.icon className="h-5 w-5" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h4 className="font-medium">{item.title}</h4>
                  <span className="text-xs text-muted-foreground ml-auto">{item.date}</span>
                </div>
                <p className="text-sm mb-3">{item.description}</p>
                
                <div className="flex items-center">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.user.avatar} />
                    <AvatarFallback>{item.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs ml-2">{item.user.name}</span>
                  <Badge variant="outline" className="text-xs ml-2 text-muted-foreground">{item.user.department}</Badge>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="ml-auto" 
                    onClick={() => handleLike(item.id)}
                  >
                    <ThumbsUp className={`h-4 w-4 mr-1 ${item.isLiked ? 'fill-current text-primary' : ''}`} />
                    <span className="text-xs">{item.likes}</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};