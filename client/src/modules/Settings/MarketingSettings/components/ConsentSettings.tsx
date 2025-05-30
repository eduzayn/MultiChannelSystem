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
import { CheckCircle, FileCog, Shield, FileCheck } from "lucide-react";
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
  defaultOptInText: z.string().min(10, {
    message: "O texto de opt-in deve ter pelo menos 10 caracteres.",
  }),
  preferencesPageHeader: z.string(),
  preferencesPageFooter: z.string(),
  unsubscribeConfirmationTitle: z.string(),
  unsubscribeConfirmationMessage: z.string(),
  unsubscribeAlternativeOption: z.string().optional(),
});

export const ConsentSettings = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      defaultOptInText: "Sim, desejo receber emails com novidades e promoções da Empresa.",
      preferencesPageHeader: "Gerencie suas preferências de comunicação",
      preferencesPageFooter: "Você pode alterar suas preferências a qualquer momento.",
      unsubscribeConfirmationTitle: "Cancelamento de inscrição confirmado",
      unsubscribeConfirmationMessage: "Sentiremos sua falta! Sua inscrição foi cancelada com sucesso.",
      unsubscribeAlternativeOption: "Prefere receber menos emails? Você pode optar por receber apenas conteúdo mensal ou trimestral.",
    },
  });

  // Função para salvar as configurações
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Configurações de consentimento salvas:", values);
    // Aqui seria feita a chamada à API para salvar
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Preferências de Consentimento de Marketing</h3>
        <p className="text-muted-foreground">
          Defina padrões e textos relacionados à coleta e gerenciamento de consentimento para comunicações de marketing.
        </p>
      </div>

      <Card className="border-blue-100 bg-blue-50/10 mb-2">
        <CardContent className="p-4 flex items-start space-x-4">
          <Shield className="h-6 w-6 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-700">Importante: Conformidade Legal</h4>
            <p className="text-sm text-blue-600">
              Certifique-se de que seus textos e práticas de consentimento estejam em conformidade com a LGPD (Lei Geral de Proteção de Dados) 
              e outras regulamentações aplicáveis. Para configurações avançadas de privacidade, visite a seção "Segurança e Conformidade".
            </p>
          </div>
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuração de Opt-in</CardTitle>
              <CardDescription>
                Defina o texto padrão para solicitação de consentimento em formulários.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="defaultOptInText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto Padrão para Checkbox de Opt-in</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Sim, desejo receber emails com novidades..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Este texto será usado como padrão em formulários web e outras interfaces de captura de leads.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/20 p-4 rounded-md space-y-2">
                <h4 className="text-sm font-medium">Exemplo de Implementação</h4>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="example-checkbox" className="rounded border-gray-300" />
                  <label htmlFor="example-checkbox" className="text-sm">
                    {form.watch("defaultOptInText")}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Página de "Gerenciar Preferências de Email"</CardTitle>
              <CardDescription>
                Personalize a página onde os contatos podem gerenciar suas preferências de comunicação.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-2 bg-muted/20 p-2 rounded-md">
                <FileCog className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Esta é uma página hospedada pelo sistema que os contatos podem acessar via link nos emails.
                </p>
              </div>

              <FormField
                control={form.control}
                name="preferencesPageHeader"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cabeçalho da Página de Preferências</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Gerencie suas preferências de comunicação" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Título principal exibido na página de preferências.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="preferencesPageFooter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rodapé da Página de Preferências</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Você pode alterar suas preferências a qualquer momento."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Texto explicativo exibido no fim da página de preferências.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/20 p-4 rounded-md border">
                <h4 className="text-sm font-medium mb-4">Visualização da Página de Preferências</h4>
                <div className="bg-white p-4 rounded-md border shadow-sm">
                  <h2 className="text-lg font-bold mb-4 text-center">{form.watch("preferencesPageHeader")}</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pref-1" className="rounded border-gray-300" checked />
                      <label htmlFor="pref-1" className="text-sm">Newsletters e Atualizações</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pref-2" className="rounded border-gray-300" checked />
                      <label htmlFor="pref-2" className="text-sm">Promoções e Ofertas</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pref-3" className="rounded border-gray-300" />
                      <label htmlFor="pref-3" className="text-sm">Pesquisas de Satisfação</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="pref-4" className="rounded border-gray-300" />
                      <label htmlFor="pref-4" className="text-sm">Eventos e Webinars</label>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <button className="bg-primary text-white px-4 py-1 rounded text-sm">
                      Salvar Preferências
                    </button>
                  </div>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    {form.watch("preferencesPageFooter")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Página de "Cancelamento de Inscrição"</CardTitle>
              <CardDescription>
                Personalize a mensagem exibida quando um contato cancela a inscrição.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 mb-2 bg-muted/20 p-2 rounded-md">
                <FileCheck className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Esta é a confirmação que os contatos veem após clicar em "Cancelar Inscrição".
                </p>
              </div>

              <FormField
                control={form.control}
                name="unsubscribeConfirmationTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da Página de Cancelamento</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Cancelamento de inscrição confirmado" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Título principal exibido na página de confirmação de cancelamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unsubscribeConfirmationMessage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Confirmação</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Sua inscrição foi cancelada com sucesso."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Mensagem exibida para confirmar o cancelamento da inscrição.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unsubscribeAlternativeOption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opção Alternativa (Opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Ex: Prefere receber menos emails? Você pode optar por..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Ofereça uma alternativa ao cancelamento total (ex: frequência reduzida).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="bg-muted/20 p-4 rounded-md border">
                <h4 className="text-sm font-medium mb-4">Visualização da Página de Cancelamento</h4>
                <div className="bg-white p-4 rounded-md border shadow-sm">
                  <div className="text-center mb-2">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  </div>
                  <h2 className="text-xl font-bold mb-2 text-center">{form.watch("unsubscribeConfirmationTitle")}</h2>
                  <p className="text-center mb-6">
                    {form.watch("unsubscribeConfirmationMessage")}
                  </p>
                  
                  {form.watch("unsubscribeAlternativeOption") && (
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-center">
                        {form.watch("unsubscribeAlternativeOption")}
                      </p>
                      <div className="flex justify-center mt-3">
                        <button className="bg-muted text-primary bg-primary/10 px-4 py-1 rounded text-sm">
                          Ajustar Preferências
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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