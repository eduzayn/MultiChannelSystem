import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Check, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const PersonalityTab = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Personalidade e Comportamento</h2>
        <p className="text-muted-foreground">
          Defina como a Prof. Ana irá se comunicar e interagir com os usuários
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Coluna 1: Identidade Básica */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Identidade da Assistente</h3>
                <p className="text-sm text-muted-foreground">
                  Configure como sua assistente irá se apresentar
                </p>
              </div>

              <div className="flex items-start space-x-4">
                <div>
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>IA</AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm" className="mt-2 w-full">
                    <Upload className="h-4 w-4 mr-2" /> Alterar
                  </Button>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="space-y-2">
                    <Label htmlFor="assistantName">Nome da Assistente</Label>
                    <Input id="assistantName" defaultValue="Prof. Ana" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma Principal</Label>
                    <Select defaultValue="pt-BR">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um idioma" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">Inglês (EUA)</SelectItem>
                        <SelectItem value="es">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Mensagens Padrão</h3>
                <p className="text-sm text-muted-foreground">
                  Personalize as mensagens automáticas
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="greetingMessage">Mensagem de Saudação</Label>
                  <Textarea 
                    id="greetingMessage" 
                    defaultValue="Olá! Sou a Prof. Ana, sua assistente virtual. Como posso ajudar você hoje?" 
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fallbackMessage">Mensagem de "Não sei a resposta"</Label>
                  <Textarea 
                    id="fallbackMessage" 
                    defaultValue="Essa é uma ótima pergunta! Infelizmente, não tenho essa informação no momento. Gostaria que eu te conectasse com um de nossos especialistas?" 
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="successMessage">Mensagem de Encerramento</Label>
                  <Textarea 
                    id="successMessage" 
                    defaultValue="Fico feliz em ter ajudado! Se precisar de mais alguma coisa, é só me chamar." 
                    rows={2}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="handoverMessage">Mensagem de Transferência para Humano</Label>
                  <Textarea 
                    id="handoverMessage" 
                    defaultValue="Vou transferir você para um de nossos atendentes humanos que poderá te ajudar melhor com essa questão. Aguarde um momento, por favor." 
                    rows={2}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Coluna 2: Comportamento Avançado */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Estilo de Comunicação</h3>
                <p className="text-sm text-muted-foreground">
                  Configure a personalidade e o tom de voz da assistente
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="systemPrompt">Prompt de Sistema / Instruções de Personalidade</Label>
                  <Textarea 
                    id="systemPrompt" 
                    className="min-h-[200px]"
                    placeholder="Você é Prof. Ana, uma assistente virtual amigável e eficiente da [Nome da Empresa]. Seu principal objetivo é ajudar nossos clientes a encontrarem informações sobre nossos produtos e resolver suas dúvidas.

Características chave da sua personalidade:
- Tom de voz: profissional, mas acessível e paciente
- Nível de formalidade: semiformal
- Uso de emojis: permitido moderadamente
- Como você se apresenta: 'Olá! Sou a Prof. Ana, sua assistente virtual. Como posso ajudar hoje?'
- Como lidar com perguntas que não sabe: 'Essa é uma ótima pergunta! No momento, não tenho essa informação, mas posso direcioná-lo para um de nossos especialistas.'
- O que NUNCA fazer: Nunca fornecer informações financeiras pessoais, nunca fazer promessas que não podem ser cumpridas, evitar opiniões pessoais
- Seu público principal: Clientes e potenciais clientes"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-medium">Configurações de Comportamento</h3>
                <p className="text-sm text-muted-foreground">
                  Ajuste os parâmetros de interação da assistente
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="proactivity">Nível de Proatividade</Label>
                    <span className="text-sm text-muted-foreground">Moderada</span>
                  </div>
                  <Slider
                    id="proactivity"
                    defaultValue={[50]}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Reativa</span>
                    <span>Contextual</span>
                    <span>Proativa</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retryLimit">Limite de Tentativas</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o limite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 tentativas</SelectItem>
                      <SelectItem value="3">3 tentativas</SelectItem>
                      <SelectItem value="4">4 tentativas</SelectItem>
                      <SelectItem value="5">5 tentativas</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Número de tentativas antes de sugerir transferência para um atendente humano
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button className="flex items-center gap-2">
          <Check className="h-4 w-4" /> Salvar Configurações de Personalidade
        </Button>
      </div>
    </div>
  );
};