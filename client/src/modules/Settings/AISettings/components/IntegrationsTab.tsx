import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Check, CircleCheck, Key, Play, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

export const IntegrationsTab = () => {
  const [llmProvider, setLlmProvider] = useState("openai");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">Integrações de Modelos</h2>
        <p className="text-muted-foreground">
          Configure as conexões com serviços de IA que potencializam a Prof. Ana
        </p>
      </div>
      
      <Tabs defaultValue="llm" className="space-y-4">
        <TabsList>
          <TabsTrigger value="llm">Modelo de Linguagem (LLM)</TabsTrigger>
          <TabsTrigger value="voice">Síntese de Voz</TabsTrigger>
        </TabsList>
        
        <TabsContent value="llm" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="llmProvider">Provedor de LLM</Label>
                  <Select value={llmProvider} onValueChange={setLlmProvider}>
                    <SelectTrigger id="llmProvider">
                      <SelectValue placeholder="Selecione o provedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="perplexity">Perplexity</SelectItem>
                      <SelectItem value="custom">Outro (API Genérica)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {llmProvider === "openai" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="openaiApiKey">Chave de API OpenAI</Label>
                        <Button variant="outline" size="sm" className="text-xs">
                          <CircleCheck className="mr-2 h-3 w-3" /> Validar Chave
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Input id="openaiApiKey" type="password" placeholder="sk-..." />
                        <Button variant="ghost" size="icon">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Sua chave de API será armazenada de forma segura e criptografada.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gptModel">Modelo GPT para Geração de Respostas</Label>
                      <Select defaultValue="gpt-4o">
                        <SelectTrigger id="gptModel">
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o">gpt-4o (Recomendado)</SelectItem>
                          <SelectItem value="gpt-4-turbo">gpt-4-turbo</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo (Econômico)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="embeddingModel">Modelo de Embedding para Indexação/Busca</Label>
                      <Select defaultValue="text-embedding-3-small">
                        <SelectTrigger id="embeddingModel">
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text-embedding-3-small">text-embedding-3-small (Recomendado)</SelectItem>
                          <SelectItem value="text-embedding-3-large">text-embedding-3-large (Maior precisão)</SelectItem>
                          <SelectItem value="text-embedding-ada-002">text-embedding-ada-002 (Legacy)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4 pt-2 border-t">
                      <h4 className="text-sm font-medium">Configurações Avançadas</h4>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="temperature">Temperatura</Label>
                          <span className="text-sm text-muted-foreground">0.7</span>
                        </div>
                        <Slider
                          id="temperature"
                          defaultValue={[0.7]}
                          max={1}
                          step={0.1}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          Valores mais baixos geram respostas mais previsíveis, valores mais altos geram respostas mais criativas.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="maxTokens">Máximo de Tokens na Resposta</Label>
                        <Select defaultValue="800">
                          <SelectTrigger id="maxTokens">
                            <SelectValue placeholder="Selecione o limite" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="400">400 tokens (Respostas curtas)</SelectItem>
                            <SelectItem value="800">800 tokens (Recomendado)</SelectItem>
                            <SelectItem value="1200">1200 tokens (Respostas longas)</SelectItem>
                            <SelectItem value="2000">2000 tokens (Respostas muito longas)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
                
                {llmProvider === "perplexity" && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="perplexityApiKey">Chave de API Perplexity</Label>
                        <Button variant="outline" size="sm" className="text-xs">
                          <CircleCheck className="mr-2 h-3 w-3" /> Validar Chave
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Input id="perplexityApiKey" type="password" placeholder="pplx-..." />
                        <Button variant="ghost" size="icon">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="perplexityModel">Modelo Perplexity</Label>
                      <Select defaultValue="llama-3.1-sonar-small-128k-online">
                        <SelectTrigger id="perplexityModel">
                          <SelectValue placeholder="Selecione o modelo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="llama-3.1-sonar-small-128k-online">llama-3.1-sonar-small-128k (Recomendado)</SelectItem>
                          <SelectItem value="llama-3.1-sonar-large-128k-online">llama-3.1-sonar-large-128k (Alta capacidade)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  <p>
                    <strong>Aviso sobre Custos:</strong> O uso destes modelos de IA externos incorrerá em custos diretamente 
                    com o provedor (OpenAI, Perplexity), de acordo com seu uso e suas tabelas de preço. Certifique-se de 
                    entender a estrutura de preços de cada provedor.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Switch 
                    id="enableVoice" 
                    checked={voiceEnabled}
                    onCheckedChange={setVoiceEnabled}
                  />
                  <Label htmlFor="enableVoice" className="text-base font-medium">
                    Habilitar Respostas por Voz para Prof. Ana
                  </Label>
                </div>
                
                {voiceEnabled && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="voiceProvider">Provedor de Síntese de Voz</Label>
                      <Select defaultValue="elevenlabs">
                        <SelectTrigger id="voiceProvider">
                          <SelectValue placeholder="Selecione o provedor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="elevenlabsApiKey">Chave de API ElevenLabs</Label>
                        <Button variant="outline" size="sm" className="text-xs">
                          <CircleCheck className="mr-2 h-3 w-3" /> Validar Chave
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Input id="elevenlabsApiKey" type="password" />
                        <Button variant="ghost" size="icon">
                          <Key className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="voiceModel">Voz da Assistente</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2 border p-2 rounded-md bg-muted/30">
                          <input type="radio" id="voice1" name="voiceModel" className="form-radio h-4 w-4" defaultChecked />
                          <div className="flex-1">
                            <Label htmlFor="voice1" className="text-sm font-medium">Maria (Portuguesa BR)</Label>
                            <p className="text-xs text-muted-foreground">Voz feminina, tom natural</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 border p-2 rounded-md">
                          <input type="radio" id="voice2" name="voiceModel" className="form-radio h-4 w-4" />
                          <div className="flex-1">
                            <Label htmlFor="voice2" className="text-sm font-medium">Ana (Portuguesa EU)</Label>
                            <p className="text-xs text-muted-foreground">Voz feminina, tom profissional</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 border p-2 rounded-md">
                          <input type="radio" id="voice3" name="voiceModel" className="form-radio h-4 w-4" />
                          <div className="flex-1">
                            <Label htmlFor="voice3" className="text-sm font-medium">João (Português BR)</Label>
                            <p className="text-xs text-muted-foreground">Voz masculina, tom natural</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center space-x-2 border p-2 rounded-md">
                          <input type="radio" id="voice4" name="voiceModel" className="form-radio h-4 w-4" />
                          <div className="flex-1">
                            <Label htmlFor="voice4" className="text-sm font-medium">Personalizada</Label>
                            <p className="text-xs text-muted-foreground">Clonada/Treinada</p>
                          </div>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <VolumeX className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Label htmlFor="voiceSettings">Configurações de Voz</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Velocidade</span>
                            <span className="text-sm text-muted-foreground">Normal</span>
                          </div>
                          <Slider
                            defaultValue={[50]}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Estabilidade</span>
                            <span className="text-sm text-muted-foreground">Alta</span>
                          </div>
                          <Slider
                            defaultValue={[75]}
                            max={100}
                            step={1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {voiceEnabled && (
            <div className="flex justify-end">
              <Button variant="outline" className="mr-2">Testar Voz</Button>
              <Button>
                <Check className="h-4 w-4 mr-2" /> Salvar Configurações
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button>
          <Check className="h-4 w-4 mr-2" /> Salvar Configurações de Integração
        </Button>
      </div>
    </div>
  );
};