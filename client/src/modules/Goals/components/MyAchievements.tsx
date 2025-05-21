import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, BarChart3, CheckCircle2, Medal, Star, Target, Trophy } from "lucide-react";

// Dados do usuário atual
const currentUser = {
  name: "João da Silva",
  avatar: "",
  role: "Vendedor Sênior",
  department: "Vendas",
};

// Metas do usuário
const userGoals = [
  {
    id: 1,
    title: "Meta de Vendas Q2 2025",
    target: "R$ 180.000,00",
    current: "R$ 132.600,00",
    percentage: 74,
    deadline: "30 de junho, 2025",
    status: "in-progress", // in-progress, at-risk, completed
    icon: Target,
  },
  {
    id: 2,
    title: "Quantidade de Negócios Fechados",
    target: "24 negócios",
    current: "18 negócios",
    percentage: 75,
    deadline: "30 de junho, 2025",
    status: "in-progress",
    icon: CheckCircle2,
  },
  {
    id: 3,
    title: "Taxa de Conversão de Propostas",
    target: "35%",
    current: "29%",
    percentage: 83,
    deadline: "30 de junho, 2025",
    status: "in-progress",
    icon: BarChart3,
  },
];

// Conquistas do usuário
const userAchievements = [
  {
    id: 1,
    title: "Top Seller Q1",
    description: "Melhor vendedor do primeiro trimestre de 2025",
    date: "31 de março, 2025",
    icon: Trophy,
    color: "text-yellow-500",
  },
  {
    id: 2,
    title: "Clube dos 100",
    description: "Alcançou R$ 100.000 em vendas em um único mês",
    date: "28 de fevereiro, 2025",
    icon: Award,
    color: "text-blue-500",
  },
  {
    id: 3,
    title: "Mestre das Propostas",
    description: "10 propostas aceitas consecutivas",
    date: "15 de janeiro, 2025",
    icon: Star,
    color: "text-purple-500",
  },
  {
    id: 4,
    title: "Primeiro Milhão",
    description: "Alcançou R$ 1.000.000 em vendas na carreira",
    date: "20 de dezembro, 2024",
    icon: Medal,
    color: "text-emerald-500",
  },
];

export const MyAchievements = () => {
  return (
    <div className="space-y-8">
      {/* Seção de perfil do usuário */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-4 border-background">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-lg">{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-xl font-bold">{currentUser.name}</h3>
              <p className="text-muted-foreground">{currentUser.role} - {currentUser.department}</p>
              <div className="flex space-x-2 mt-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">Nível 12</Badge>
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">4 Troféus</Badge>
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500">8 Medalhas</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção de metas atuais */}
      <div>
        <h3 className="text-xl font-medium mb-4">Minhas Metas Atuais</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {userGoals.map((goal) => (
            <Card key={goal.id} className={
              goal.status === "at-risk" ? "border-orange-500/20" :
              goal.status === "completed" ? "border-emerald-500/20" : ""
            }>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base font-medium flex items-center">
                    <goal.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    {goal.title}
                  </CardTitle>
                  {goal.status === "completed" && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <CardDescription>Meta: {goal.target}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Atual: {goal.current}</span>
                    <span className={
                      goal.percentage >= 75 ? "text-emerald-500" :
                      goal.percentage >= 50 ? "text-amber-500" :
                      "text-red-500"
                    }>{goal.percentage}%</span>
                  </div>
                  <Progress value={goal.percentage} className={
                    goal.percentage >= 75 ? "text-emerald-500" :
                    goal.percentage >= 50 ? "text-amber-500" :
                    "text-red-500"
                  } />
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-muted-foreground">Prazo: {goal.deadline}</p>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Seção de conquistas */}
      <div>
        <h3 className="text-xl font-medium mb-4">Minhas Conquistas</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {userAchievements.map((achievement) => (
            <Card key={achievement.id}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center ${achievement.color}`}>
                    <achievement.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">Conquistado em: {achievement.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Seção de próximos desafios */}
      <div>
        <h3 className="text-xl font-medium mb-4">Próximos Desafios</h3>
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Star className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Vendedor do Semestre</h4>
                  <p className="text-sm text-muted-foreground">Complete 100% da meta semestral até 30 de junho</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-primary/10 text-primary">500 pontos</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Especialista em Grandes Contas</h4>
                  <p className="text-sm text-muted-foreground">Feche 3 negócios acima de R$ 50.000</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-primary/10 text-primary">350 pontos</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Medal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-medium">Taxa de Conversão Elite</h4>
                  <p className="text-sm text-muted-foreground">Mantenha taxa de conversão acima de 35% por 30 dias</p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline" className="bg-primary/10 text-primary">300 pontos</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};