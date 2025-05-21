import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";

export const ContextRulesTab = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Regras e Contextos</h2>
        <p className="text-muted-foreground">
          Configure como a IA Prof. Ana deve se comportar em diferentes contextos
        </p>
      </div>
      
      <Tabs defaultValue="contexts">
        <TabsList>
          <TabsTrigger value="contexts">Contextos</TabsTrigger>
          <TabsTrigger value="rules">Regras Gerais</TabsTrigger>
          <TabsTrigger value="fallbacks">Respostas de Fallback</TabsTrigger>
        </TabsList>
        
        <TabsContent value="contexts" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Contextos Configurados</h3>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Contexto
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Atendimento de Vendas</CardTitle>
                  <div className="flex items-center h-5">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />
                    <span className="text-xs text-muted-foreground">Ativo</span>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  Aplicado quando: Canal de WhatsApp de Vendas, Chat no site em páginas de produto
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Prioridade:</span> Alta
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Fontes de Conhecimento:</span> Catálogo de Produtos, FAQ de Vendas, Política de Preços
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7">Editar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Suporte Técnico</CardTitle>
                  <div className="flex items-center h-5">
                    <div className="h-2 w-2 rounded-full bg-green-500 mr-1" />
                    <span className="text-xs text-muted-foreground">Ativo</span>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  Aplicado quando: Canal de WhatsApp de Suporte, Chat no site em páginas de ajuda
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Prioridade:</span> Média
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Fontes de Conhecimento:</span> Manual do Produto, FAQ de Suporte, Base de Conhecimento Técnico
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7">Editar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">Prospecção e Marketing</CardTitle>
                  <div className="flex items-center h-5">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-1" />
                    <span className="text-xs text-muted-foreground">Agendado</span>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  Aplicado quando: Instagram DM, Facebook Messenger, Campanhas de Marketing
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Prioridade:</span> Baixa
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Fontes de Conhecimento:</span> Materiais de Marketing, Blog da Empresa, Casos de Sucesso
                  </div>
                  <div className="flex justify-end mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7">Editar</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Criar/Editar Contexto</CardTitle>
              <CardDescription>
                Defina como a IA deve se comportar em contextos específicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contextName">Nome do Contexto</Label>
                <Input id="contextName" placeholder="Ex: Suporte Técnico, Atendimento de Vendas, etc." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contextDescription">Descrição do Contexto</Label>
                <Textarea id="contextDescription" placeholder="Descreva o propósito deste contexto..." />
              </div>
              
              <div className="space-y-2">
                <Label>Quando Aplicar este Contexto</Label>
                <Card className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium">Condições:</Label>
                      <Select defaultValue="all">
                        <SelectTrigger id="conditionType" className="w-32">
                          <SelectValue placeholder="Relação" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas (E)</SelectItem>
                          <SelectItem value="any">Qualquer (OU)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Plus className="h-3 w-3 mr-1" /> Adicionar Condição
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Select defaultValue="channel">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="channel">Canal</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="userType">Tipo de Usuário</SelectItem>
                            <SelectItem value="intent">Intenção Detectada</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select defaultValue="equals">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Operador" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Igual a</SelectItem>
                            <SelectItem value="contains">Contém</SelectItem>
                            <SelectItem value="startsWith">Começa com</SelectItem>
                            <SelectItem value="endsWith">Termina com</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input placeholder="Valor" className="flex-1" />
                        
                        <Button variant="ghost" size="sm" className="px-2">
                          ×
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select defaultValue="intent">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Campo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="channel">Canal</SelectItem>
                            <SelectItem value="url">URL</SelectItem>
                            <SelectItem value="userType">Tipo de Usuário</SelectItem>
                            <SelectItem value="intent">Intenção Detectada</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select defaultValue="contains">
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Operador" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="equals">Igual a</SelectItem>
                            <SelectItem value="contains">Contém</SelectItem>
                            <SelectItem value="startsWith">Começa com</SelectItem>
                            <SelectItem value="endsWith">Termina com</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Input placeholder="Valor" className="flex-1" />
                        
                        <Button variant="ghost" size="sm" className="px-2">
                          ×
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  A prioridade determina qual contexto será usado quando múltiplos contextos se aplicarem
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Fontes de Conhecimento a Utilizar</Label>
                <div className="space-y-2 border p-4 rounded-md">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="source1" />
                    <Label htmlFor="source1" className="text-sm">Catálogo de Produtos</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="source2" />
                    <Label htmlFor="source2" className="text-sm">FAQ de Vendas</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="source3" />
                    <Label htmlFor="source3" className="text-sm">Manual do Produto</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="source4" />
                    <Label htmlFor="source4" className="text-sm">FAQ de Suporte</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="source5" />
                    <Label htmlFor="source5" className="text-sm">Política de Preços</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" /> Salvar Contexto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras Gerais de Comportamento</CardTitle>
              <CardDescription>
                Configure regras que a IA deve seguir em todos os contextos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalRules">Regras Globais</Label>
                <Textarea 
                  id="generalRules" 
                  className="min-h-[200px]"
                  placeholder="Defina regras que a IA deve seguir independente do contexto..."
                  defaultValue={`1. Nunca fornecer informações financeiras sensíveis de clientes.
2. Sempre encaminhar para um atendente humano questões relacionadas a cancelamentos acima de R$ 1.000,00.
3. Responder de forma educada e respeitosa, mesmo quando o usuário não o for.
4. Não fazer promessas de prazos específicos para entregas, apenas informar estimativas.
5. Solicitar confirmação de identidade antes de fornecer informações pessoais de contas.
6. Nunca realizar alterações em pedidos sem verificação em dois fatores.
7. Manter um tom amigável e profissional em todas as interações.`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="escalationRules">Regras de Escalonamento</Label>
                <Textarea 
                  id="escalationRules" 
                  className="min-h-[150px]"
                  placeholder="Defina quando a conversa deve ser transferida para um humano..."
                  defaultValue={`1. Transferir para um atendente humano após 3 tentativas mal sucedidas de resolver o problema.
2. Escalonar imediatamente reclamações que mencionam problemas legais ou ameaças de processo.
3. Encaminhar para supervisor solicitações de desconto acima de 15%.
4. Transferir para especialista técnico quando a IA não conseguir resolver problemas técnicos complexos.`}
                />
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" /> Salvar Regras
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="fallbacks" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Respostas de Fallback</CardTitle>
              <CardDescription>
                Configure as mensagens para quando a IA não souber responder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="generalFallback">Resposta de Fallback Geral</Label>
                <Textarea 
                  id="generalFallback" 
                  defaultValue="Desculpe, não tenho informações suficientes para responder essa pergunta com precisão. Posso ajudá-lo com algo diferente ou conectá-lo a um de nossos especialistas?" 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="technicalFallback">Resposta para Dúvidas Técnicas</Label>
                <Textarea 
                  id="technicalFallback" 
                  defaultValue="Essa é uma questão técnica complexa que precisa ser analisada com mais detalhes. Vou conectá-lo a um de nossos especialistas técnicos para garantir que você receba a assistência adequada. Poderia me informar mais detalhes sobre o problema que está enfrentando?" 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="billingFallback">Resposta para Questões de Faturamento</Label>
                <Textarea 
                  id="billingFallback" 
                  defaultValue="Para questões relacionadas a faturamento e pagamentos, precisamos verificar sua conta em nosso sistema. Por segurança, vou transferir você para nossa equipe financeira que poderá acessar essas informações e ajudá-lo adequadamente." 
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="intentFallback">Quando não entender a intenção</Label>
                <Textarea 
                  id="intentFallback" 
                  defaultValue="Não tenho certeza se entendi corretamente sua solicitação. Poderia reformular ou fornecer mais detalhes sobre o que precisa? Estou aqui para ajudar." 
                  rows={3}
                />
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" /> Salvar Respostas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};