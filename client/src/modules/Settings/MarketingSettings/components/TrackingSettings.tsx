import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CopyPlus, FileCode } from "lucide-react";

// Schema para validação do formulário
const formSchema = z.object({
  trackingApiKey: z.string().optional(),
  utmSourceMapping: z.string().default("leadSource"),
  utmCampaignMapping: z.string().default("campaignName"),
  utmMediumMapping: z.string().default("channelType"),
  utmContentMapping: z.string().default("contentVariant"),
  utmTermMapping: z.string().optional(),
  attributionModel: z.string().default("last-touch"),
  clickAttributionWindow: z.string().default("30"),
  viewAttributionWindow: z.string().default("1"),
});

export const TrackingSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trackingApiKey: "trk_aBcDeFgH1234567890",
      utmSourceMapping: "leadSource", 
      utmCampaignMapping: "campaignName",
      utmMediumMapping: "channelType",
      utmContentMapping: "contentVariant",
      attributionModel: "last-touch",
      clickAttributionWindow: "30",
      viewAttributionWindow: "1",
    },
  });

  // Função para salvar as configurações
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Configurações de rastreamento salvas:", values);
    // Aqui seria feita a chamada à API para salvar
  }

  const handleCopyScript = () => {
    const scriptContent = `<script>
  // OmniChannel Tracking Script
  (function(w,d,s,o,f,js,fjs){
    w['OmniChannel']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','omni','https://cdn.omnichannel.com.br/tracking.js'));
  
  omni('init', '${form.watch('trackingApiKey')}');
</script>`;
    
    navigator.clipboard.writeText(scriptContent)
      .then(() => {
        console.log("Script copiado para a área de transferência!");
        // Aqui você poderia adicionar uma notificação de sucesso
      })
      .catch(err => {
        console.error('Erro ao copiar: ', err);
        // Aqui você poderia adicionar uma notificação de erro
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurações de Tracking e Atribuição</h3>
        <p className="text-muted-foreground">
          Configure como o sistema rastreia a origem dos leads/negócios e atribui o sucesso às atividades de marketing.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Script de Rastreamento para Website</CardTitle>
              <CardDescription>
                Configure o rastreamento de visitantes em seu site para vinculá-los a contatos no CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="trackingApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chave de API de Rastreamento</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificador único para seu tenant no sistema de rastreamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-2">
                <Label>Script de Rastreamento</Label>
                <div className="relative mt-1.5">
                  <div className="font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto border">
                    <pre className="text-xs">
{`<script>
  // OmniChannel Tracking Script
  (function(w,d,s,o,f,js,fjs){
    w['OmniChannel']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','omni','https://cdn.omnichannel.com.br/tracking.js'));
  
  omni('init', '${form.watch('trackingApiKey')}');
</script>`}
                    </pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2"
                    onClick={handleCopyScript}
                    title="Copiar script"
                  >
                    <CopyPlus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Adicione este script em todas as páginas do seu site, antes do fechamento da tag &lt;/head&gt;.
                </p>
              </div>

              <div className="pt-2">
                <Label>Exemplo de Integração em Formulário Web</Label>
                <div className="relative mt-1.5">
                  <div className="font-mono text-sm bg-muted p-4 rounded-md overflow-x-auto border">
                    <pre className="text-xs">
{`<form onsubmit="omni('trackForm', this, 'lead'); return false;">
  <input type="email" name="email" placeholder="Seu email">
  <button type="submit">Inscrever-se</button>
</form>`}
                    </pre>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2"
                    title="Copiar exemplo"
                  >
                    <CopyPlus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Como integrar o rastreamento em seus formulários de captura de leads.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mapeamento de Parâmetros UTM</CardTitle>
              <CardDescription>
                Configure como os parâmetros UTM são mapeados para os campos do CRM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="md:col-span-2 mb-2">
                <p className="text-sm text-muted-foreground">
                  Defina quais campos do CRM serão populados com os valores dos parâmetros UTM.
                </p>
              </div>

              <FormField
                control={form.control}
                name="utmSourceMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campo para UTM Source</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="leadSource">Origem do Lead</SelectItem>
                        <SelectItem value="utmSource">UTM Source (personalizado)</SelectItem>
                        <SelectItem value="none">Não mapear</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Campo para armazenar a origem do tráfego (ex: google, facebook).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utmCampaignMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campo para UTM Campaign</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="campaignName">Nome da Campanha</SelectItem>
                        <SelectItem value="utmCampaign">UTM Campaign (personalizado)</SelectItem>
                        <SelectItem value="none">Não mapear</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Campo para armazenar o nome da campanha.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utmMediumMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campo para UTM Medium</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="channelType">Tipo de Canal</SelectItem>
                        <SelectItem value="utmMedium">UTM Medium (personalizado)</SelectItem>
                        <SelectItem value="none">Não mapear</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Campo para armazenar o meio (ex: email, cpc, social).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utmContentMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campo para UTM Content</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="contentVariant">Variante de Conteúdo</SelectItem>
                        <SelectItem value="utmContent">UTM Content (personalizado)</SelectItem>
                        <SelectItem value="none">Não mapear</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Campo para armazenar a variante de conteúdo.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="utmTermMapping"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campo para UTM Term</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um campo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="keywordsTerm">Termos/Keywords</SelectItem>
                        <SelectItem value="utmTerm">UTM Term (personalizado)</SelectItem>
                        <SelectItem value="none">Não mapear</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Campo para armazenar termos e palavras-chave.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Modelo de Atribuição</CardTitle>
              <CardDescription>
                Defina como o crédito por conversões é atribuído aos diferentes pontos de contato de marketing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="attributionModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo de Atribuição</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um modelo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="first-touch">
                          Primeiro Contato (First Touch)
                        </SelectItem>
                        <SelectItem value="last-touch">
                          Último Contato (Last Touch)
                        </SelectItem>
                        <SelectItem value="linear">
                          Linear (Crédito Distribuído)
                        </SelectItem>
                        <SelectItem value="position-based">
                          Baseado em Posição (40/20/40)
                        </SelectItem>
                        <SelectItem value="time-decay">
                          Decadência Temporal
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Determina como atribuir crédito para conversões com múltiplos pontos de contato.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="clickAttributionWindow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Janela de Atribuição de Cliques (dias)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="90"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Por quantos dias após um clique a conversão será atribuída a ele.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="viewAttributionWindow"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Janela de Atribuição de Visualizações (dias)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="90"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Por quantos dias após uma visualização a conversão será atribuída a ela.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit">Salvar Configurações</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};