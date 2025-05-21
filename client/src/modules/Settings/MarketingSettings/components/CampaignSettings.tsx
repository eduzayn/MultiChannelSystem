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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Schema para validação do formulário
const formSchema = z.object({
  senderName: z.string().min(1, {
    message: "O nome do remetente é obrigatório.",
  }),
  senderEmail: z.string().email({
    message: "Informe um email válido.",
  }),
  replyToEmail: z.string().email({
    message: "Informe um email válido.",
  }),
  emailFooter: z.string(),
  includeUnsubscribeLink: z.boolean().default(true),
  includePreferencesLink: z.boolean().default(false),
  trackOpens: z.boolean().default(true),
  trackClicks: z.boolean().default(true),
  utmSource: z.string().default("omnichannel_platform"),
  utmMedium: z.string().default("email"),
  autoAddUtm: z.boolean().default(true),
  maxEmailsPerWeek: z.string().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  requireDoubleOptIn: z.boolean().default(false),
  doubleOptInTemplateId: z.string().optional(),
});

export const CampaignSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      senderName: "Equipe OmniChannel",
      senderEmail: "marketing@empresa.com.br",
      replyToEmail: "contato@empresa.com.br",
      emailFooter: "© 2024 Empresa | Rua Exemplo, 123 - São Paulo, SP | contato@empresa.com.br | +55 11 9999-9999",
      includeUnsubscribeLink: true,
      includePreferencesLink: false,
      trackOpens: true,
      trackClicks: true,
      utmSource: "omnichannel_platform",
      utmMedium: "email",
      autoAddUtm: true,
      requireDoubleOptIn: false,
    },
  });

  // Função para salvar as configurações
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Configurações de campanhas salvas:", values);
    // Aqui seria feita a chamada à API para salvar
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Configurações Globais de Campanhas</h3>
        <p className="text-muted-foreground">
          Defina padrões e configurações que se aplicam a todas ou à maioria das suas campanhas de marketing.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Remetente Padrão (Email)</CardTitle>
              <CardDescription>
                Defina como seus emails de campanha aparecerão para os destinatários.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="senderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Remetente Padrão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Equipe de Marketing da Empresa" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o nome que aparecerá como remetente nos emails de campanha.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="senderEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email do Remetente Padrão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: marketing@empresa.com.br" {...field} />
                    </FormControl>
                    <FormDescription>
                      Deve ser um email verificado e configurado na seção de Canais.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="replyToEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Resposta Padrão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: contato@empresa.com.br" {...field} />
                    </FormControl>
                    <FormDescription>
                      Email para onde as respostas dos clientes serão direcionadas.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Rodapé Padrão de Email Marketing</CardTitle>
              <CardDescription>
                Defina um rodapé padrão que será adicionado automaticamente a todos os emails de campanha.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="emailFooter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Rodapé</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: © 2024 Empresa | Endereço | Contato" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Pode incluir informações da empresa, links para redes sociais e motivo do recebimento do email.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-2">
                <FormField
                  control={form.control}
                  name="includeUnsubscribeLink"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Incluir link de "Cancelar Inscrição" automaticamente no rodapé
                        </FormLabel>
                        <FormDescription>
                          Este link é obrigatório por lei para emails de marketing (LGPD/CAN-SPAM).
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="includePreferencesLink"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Incluir link para "Gerenciar Preferências de Email" automaticamente
                        </FormLabel>
                        <FormDescription>
                          Permite que o destinatário escolha quais tipos de emails deseja receber.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configurações de Rastreamento Padrão</CardTitle>
              <CardDescription>
                Defina como campanhas rastreiam aberturas, cliques e origens de tráfego.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <FormField
                  control={form.control}
                  name="trackOpens"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Habilitar rastreamento de aberturas por padrão
                        </FormLabel>
                        <FormDescription>
                          Rastreia quando os destinatários abrem seus emails.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="trackClicks"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Habilitar rastreamento de cliques por padrão
                        </FormLabel>
                        <FormDescription>
                          Rastreia quando os destinatários clicam em links no seu email.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <div className="pt-2 pb-1">
                <h4 className="text-sm font-medium">Parâmetros UTM Padrão</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Defina valores padrão para parâmetros UTM em links de campanha.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="utmSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTM Source Padrão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: omnichannel_platform" {...field} />
                      </FormControl>
                      <FormDescription>
                        Identifica a origem do tráfego.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="utmMedium"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UTM Medium Padrão</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: email, whatsapp, sms" {...field} />
                      </FormControl>
                      <FormDescription>
                        Identifica o canal de marketing.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="autoAddUtm"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-1">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Adicionar parâmetros UTM automaticamente a todos os links
                      </FormLabel>
                      <FormDescription>
                        O sistema adicionará os parâmetros UTM automaticamente aos links em emails e mensagens.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Limitações e Restrições de Envio</CardTitle>
              <CardDescription>
                Configure limites de frequência e horários para envio de mensagens.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="maxEmailsPerWeek"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Máximo de Emails por Semana</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Ex: 3" 
                        min="0" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Limite o número de emails enviados para o mesmo contato em uma semana.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="md:col-span-1">
                <FormLabel>Período de Silêncio (Horários de Não-Envio)</FormLabel>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <FormField
                    control={form.control}
                    name="quietHoursStart"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="time" 
                            placeholder="Início" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quietHoursEnd"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input 
                            type="time" 
                            placeholder="Fim" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormDescription className="mt-1.5">
                  Defina horários em que mensagens não serão enviadas automaticamente.
                </FormDescription>
              </div>

              <FormField
                control={form.control}
                name="requireDoubleOptIn"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 md:col-span-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Exigir confirmação dupla (Double Opt-in) para novas assinaturas
                      </FormLabel>
                      <FormDescription>
                        Envia um email de confirmação quando um novo contato se inscreve em sua lista.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="doubleOptInTemplateId"
                render={({ field }) => (
                  <FormItem className={`md:col-span-2 ${!form.watch("requireDoubleOptIn") ? "hidden" : ""}`}>
                    <FormLabel>Modelo de Email para Confirmação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: template_confirmacao_123" {...field} />
                    </FormControl>
                    <FormDescription>
                      ID do modelo de email a ser usado para confirmação dupla.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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