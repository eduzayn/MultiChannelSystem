import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, HelpCircle, RefreshCw, Zap } from "lucide-react";

export const OverviewTab = () => {
  // Em um componente real, isso viria de um hook useQuery ou similar
  const aiStatus = "active"; // Pode ser 'active', 'training', 'inactive', ou 'error'
  
  const getStatusBadge = () => {
    if (aiStatus === "active") {
      return <Badge className="bg-green-100 text-green-800 border-green-200">🟢 Ativo</Badge>;
    } else if (aiStatus === "training") {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">🟡 Em Treinamento</Badge>;
    } else if (aiStatus === "inactive") {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">⚪ Inativo</Badge>;
    } else if (aiStatus === "error") {
      return <Badge className="bg-red-100 text-red-800 border-red-200">🔴 Erro</Badge>;
    }
    return <Badge>Status Desconhecido</Badge>;
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Visão Geral da IA</h2>
        <p className="text-muted-foreground">
          Confira o status e desempenho da sua IA Prof. Ana
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status da IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center">
                <span>Estado Atual:</span>
                {getStatusBadge()}
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Disponibilidade:</span>
                <span className="font-medium">99.8%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tempo no Ar:</span>
                <span className="font-medium">43 dias</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Última Atualização:</span>
                <span className="font-medium">18/05/2025</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" /> Verificar Status
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Base de Conhecimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Total de Fontes:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Fontes Atualizadas:</span>
                <span className="font-medium">10</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tamanho Total:</span>
                <span className="font-medium">345 chunks</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Qualidade dos Dados:</span>
                <div className="flex items-center">
                  <span className="font-medium mr-1">94%</span>
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Check className="mr-2 h-4 w-4" /> Verificar Integridade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Desempenho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span>Taxa de Acerto:</span>
                <span className="font-medium">87%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Tempo de Resposta:</span>
                <span className="font-medium">1.2s (média)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Feedback Positivo:</span>
                <span className="font-medium">78%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Taxa de Escalonamento:</span>
                <span className="font-medium">18%</span>
              </div>
              <div className="pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Zap className="mr-2 h-4 w-4" /> Otimizar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Utilização</CardTitle>
          <CardDescription>
            Métricas dos últimos 30 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total de Interações</span>
                <span className="font-medium">3,542</span>
              </div>
              <Progress value={70} />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>+18% em relação ao mês anterior</span>
                <span>Meta: 5,000</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Canais Ativos</span>
                <span className="font-medium">4 / 6</span>
              </div>
              <Progress value={67} />
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <Badge variant="outline" className="mr-1 font-normal">WhatsApp</Badge>
                  <Badge variant="outline" className="mr-1 font-normal">Chat Web</Badge>
                </div>
                <div className="text-right text-muted-foreground">
                  Pendentes: Instagram, Telegram
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uso por Contexto</span>
                <span></span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Vendas</span>
                  <span>42%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Suporte</span>
                  <span>36%</span>
                </div>
                <Progress value={36} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Marketing</span>
                  <span>22%</span>
                </div>
                <Progress value={22} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ações Recomendadas</CardTitle>
            <CardDescription>
              Sugestões para melhorar o desempenho da IA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 pb-2 border-b">
                <div className="h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-amber-600 text-xs">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Atualizar fonte de conhecimento "FAQ do Site"</p>
                  <p className="text-xs text-muted-foreground">Última atualização há 45 dias</p>
                </div>
              </li>
              <li className="flex items-start gap-2 pb-2 border-b">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Revisar respostas com feedback negativo</p>
                  <p className="text-xs text-muted-foreground">8 respostas marcadas como "não útil" esta semana</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-xs">i</span>
                </div>
                <div>
                  <p className="text-sm font-medium">Considerar adicionar integração com Instagram</p>
                  <p className="text-xs text-muted-foreground">Alto volume de interações nesse canal</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Perguntas Sem Resposta</CardTitle>
            <CardDescription>
              Perguntas que a IA não conseguiu responder adequadamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 pb-2 border-b">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-600 text-xs">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium">"Como configurar integração com ERP?"</p>
                  <p className="text-xs text-muted-foreground">3 ocorrências esta semana</p>
                </div>
              </li>
              <li className="flex items-start gap-2 pb-2 border-b">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-600 text-xs">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium">"Qual o prazo para devolução em compras internacionais?"</p>
                  <p className="text-xs text-muted-foreground">2 ocorrências esta semana</p>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gray-600 text-xs">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium">"Preciso cadastrar cartão para fazer teste gratuito?"</p>
                  <p className="text-xs text-muted-foreground">2 ocorrências esta semana</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};