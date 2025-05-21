import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  connectionName: z.string().min(1, "Nome da conexão é obrigatório"),
  apiKey: z.string().min(1, "Chave de API é obrigatória"),
  preferredModel: z.string().min(1, "Selecione um modelo")
});

interface PerplexityIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerplexityIntegrationModal: React.FC<PerplexityIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      connectionName: "Perplexity AI",
      apiKey: "",
      preferredModel: "sonar-medium-online"
    }
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    // Simulação de envio - em produção, faria uma chamada à API
    setTimeout(() => {
      setIsSubmitting(false);
      
      toast({
        title: "Integração configurada com sucesso",
        description: "A Perplexity AI foi integrada ao seu sistema.",
      });
      
      onClose();
    }, 1000);
  };

  const handleTestConnection = async () => {
    const apiKey = form.getValues("apiKey");
    if (!apiKey) {
      form.setError("apiKey", {
        message: "Insira uma chave de API para testar a conexão"
      });
      return;
    }

    setIsTesting(true);
    
    // Simulação de teste de conexão
    setTimeout(() => {
      setIsTesting(false);
      toast({
        title: "Teste de conexão bem-sucedido",
        description: "Sua chave de API da Perplexity AI é válida.",
      });
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Conectar com Perplexity AI</DialogTitle>
          <DialogDescription>
            Conecte sua conta Perplexity AI para obter respostas inteligentes com acesso à internet em tempo real.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="connectionName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conexão</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Um nome para identificar esta conexão com a Perplexity AI.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave de API (API Key)</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Sua chave de API da Perplexity AI. Você pode encontrá-la em{" "}
                    <a 
                      href="https://www.perplexity.ai/settings/api" 
                      target="_blank" 
                      rel="noreferrer" 
                      className="underline text-primary"
                    >
                      perplexity.ai/settings/api
                    </a>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredModel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo Preferido</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modelo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sonar-medium-online">sonar-medium-online (Recomendado)</SelectItem>
                      <SelectItem value="sonar-small-online">sonar-small-online (Mais rápido)</SelectItem>
                      <SelectItem value="pplx-70b-chat">pplx-70b-chat (Mais potente)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Escolha o modelo da Perplexity AI que melhor se adapta às suas necessidades.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleTestConnection} 
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando...
                  </>
                ) : (
                  "Testar Conexão"
                )}
              </Button>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar e Ativar Integração"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};