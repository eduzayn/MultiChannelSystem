import React, { useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

interface ImportWhatsAppContactsProps {
  onImportComplete?: () => void;
}

export function ImportWhatsAppContacts({ onImportComplete }: ImportWhatsAppContactsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      instanceId: '',
      token: '',
      clientToken: ''
    }
  });

  const handleImportContacts = async (values: any) => {
    setIsLoading(true);
    
    try {
      // Primeiro verificar se o WhatsApp está conectado
      const connectionResponse = await axios.post('/api/zapi/test-connection', {
        instanceId: values.instanceId,
        token: values.token,
        clientToken: values.clientToken || undefined
      });
      
      // Se não estiver conectado, mostrar mensagem de erro
      if (!connectionResponse.data.success || connectionResponse.data.status !== "connected") {
        toast({
          title: "WhatsApp não conectado",
          description: "Você precisa conectar o WhatsApp usando o QR code na tela de configurações de canais antes de importar contatos.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Se estiver conectado, prosseguir com a importação
      const response = await axios.post('/api/zapi/get-contacts', {
        instanceId: values.instanceId,
        token: values.token,
        clientToken: values.clientToken || undefined
      });
      
      if (response.data.success) {
        // Atualizar a lista de contatos
        await queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
        
        const contactCount = response.data.contacts?.length || 0;
        const importedCount = response.data.stats?.imported || 0;
        const updatedCount = response.data.stats?.updated || 0;
        
        toast({
          title: "Contatos importados com sucesso!",
          description: `${contactCount} contato(s) do WhatsApp encontrados. ${importedCount} novos e ${updatedCount} atualizados.`,
          variant: "default",
        });
        
        // Fechar o diálogo e notificar conclusão
        setIsDialogOpen(false);
        
        if (onImportComplete) {
          onImportComplete();
        }
      } else {
        // Tratamento específico para mensagens de erro comuns da Z-API
        let errorTitle = "Erro ao importar contatos";
        let errorMessage = response.data.message || "Não foi possível importar os contatos do WhatsApp.";
        
        // Personalizar mensagens de erro para melhorar a experiência do usuário
        if (errorMessage.includes("Instance not found")) {
          errorTitle = "Instância não encontrada";
          errorMessage = "O ID da instância fornecido não existe na Z-API. Verifique se o ID está correto.";
        } 
        else if (errorMessage.includes("need to be connected") || errorMessage.includes("not connected")) {
          errorTitle = "WhatsApp não conectado";
          errorMessage = "Você precisa primeiro conectar o WhatsApp usando o QR code na tela de configurações de canais antes de importar contatos.";
        }
        else if (errorMessage.includes("token")) {
          errorTitle = "Token inválido";
          errorMessage = "O token fornecido não é válido para esta instância Z-API.";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao importar contatos",
        description: error.response?.data?.message || error.message || "Ocorreu um erro ao tentar importar os contatos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-4 w-4 mr-1" />
        Importar do WhatsApp
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Importar Contatos do WhatsApp</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>Sincronize seus contatos do WhatsApp com o sistema. Forneça as credenciais da sua instância Z-API.</p>
              <div className="flex items-center gap-2 p-3 text-sm bg-amber-50 border border-amber-200 rounded-md text-amber-800">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <div>
                  <p><strong>Importante:</strong> Para importar contatos, você precisa primeiro conectar o WhatsApp na página de Configurações de Canais.</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleImportContacts)} className="space-y-4">
              <FormField
                control={form.control}
                name="instanceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instance ID</FormLabel>
                    <FormControl>
                      <Input placeholder="ID da sua instância Z-API" {...field} />
                    </FormControl>
                    <FormDescription>
                      ID da sua instância na Z-API.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="token"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <FormControl>
                      <Input placeholder="Token da sua instância Z-API" {...field} />
                    </FormControl>
                    <FormDescription>
                      Token de autenticação da sua instância Z-API.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Token (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Client Token da Z-API (opcional)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Token de segurança adicional da sua conta Z-API (opcional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    'Importar Contatos'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}