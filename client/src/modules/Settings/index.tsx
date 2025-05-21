import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

interface SettingsModuleProps {
  children: React.ReactNode;
}

export const SettingsModule = ({ children }: SettingsModuleProps) => {
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configurações do Tenant</h1>
        <p className="text-muted-foreground">
          Configure as informações e preferências da sua organização
        </p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-card border rounded-md p-4 sticky top-6">
            <div className="space-y-1 mb-4">
              <Input placeholder="Buscar configurações..." className="text-sm" />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-sm font-medium mb-2">Configurações Gerais</p>
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/company">
                      <span className="mr-2">👤</span> Perfil da Empresa
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/branding">
                      <span className="mr-2">🎨</span> Aparência e Branding
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/localization">
                      <span className="mr-2">🌍</span> Localização e Idioma
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/users">
                      <span className="mr-2">👥</span> Usuários e Equipes
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/channels">
                      <span className="mr-2">📱</span> Canais de Comunicação
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/notifications">
                      <span className="mr-2">🔔</span> Notificações
                    </Link>
                  </Button>
                </nav>
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium mb-2">Módulos & Ferramentas</p>
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/users">
                      <span className="mr-2">👥</span> Usuários e Equipes
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/crm">
                      <span className="mr-2">💼</span> CRM
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/marketing">
                      <span className="mr-2">📣</span> Marketing
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/goals">
                      <span className="mr-2">🎯</span> Metas e Gamificação
                    </Link>
                  </Button>
                  <Button variant="default" className="w-full justify-start text-sm bg-primary text-primary-foreground" asChild>
                    <Link href="/settings/ai">
                      <span className="mr-2">🤖</span> IA - Prof. Ana
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/integrations">
                      <span className="mr-2">🔌</span> Integrações
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/security">
                      <span className="mr-2">🔒</span> Segurança
                    </Link>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm" asChild>
                    <Link href="/settings/subscription">
                      <span className="mr-2">💳</span> Assinatura
                    </Link>
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="bg-card border rounded-md p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};