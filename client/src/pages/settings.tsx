import React from "react";
import { SettingsModule } from "@/modules/Settings";

export default function SettingsPage() {
  return (
    <SettingsModule>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Configurações Gerais</h2>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao painel de configurações. Utilize os links do menu lateral para navegar entre as diferentes opções.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">Perfil da Empresa</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure as informações básicas da sua empresa, logo e detalhes de contato.
            </p>
            <a href="/settings/company" className="text-primary text-sm font-medium hover:underline">
              Acessar configurações →
            </a>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">Aparência e Branding</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Personalize as cores, temas e elementos visuais do sistema.
            </p>
            <a href="/settings/branding" className="text-primary text-sm font-medium hover:underline">
              Acessar configurações →
            </a>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">Usuários e Equipes</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie os usuários, defina permissões e organize equipes.
            </p>
            <a href="/settings/users" className="text-primary text-sm font-medium hover:underline">
              Acessar configurações →
            </a>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">Canais de Comunicação</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure os canais de comunicação como WhatsApp, Instagram, Email, etc.
            </p>
            <a href="/settings/channels" className="text-primary text-sm font-medium hover:underline">
              Acessar configurações →
            </a>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">IA - Prof. Ana</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure os comportamentos e integrações da sua assistente de IA.
            </p>
            <a href="/settings/ai" className="text-primary text-sm font-medium hover:underline">
              Acessar configurações →
            </a>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-lg border">
            <h3 className="font-medium text-lg mb-2">Integrações</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure integrações com serviços externos como Asaas, OpenAI e outros.
            </p>
            <a href="/settings/integrations" className="text-primary text-sm font-medium hover:underline">
              Acessar configurações →
            </a>
          </div>
        </div>
      </div>
    </SettingsModule>
  );
}