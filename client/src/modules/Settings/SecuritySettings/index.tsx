import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  FileText, 
  Lock, 
  Shield, 
  AlertTriangle, 
  FileSearch,
  Clock,
  KeyRound,
  UserCheck,
  Download
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export const SecuritySettings = () => {
  const { toast } = useToast();
  const [passwordPolicy, setPasswordPolicy] = useState({
    strongPassword: true,
    minLength: 8,
    specialChars: true,
    upperLower: true,
    numbers: true,
    expiration: false,
    expirationDays: 90,
    lockAccount: true,
    maxAttempts: 5,
    lockDuration: "60"
  });

  const [tfaPolicy, setTfaPolicy] = useState({
    required: "admin",
    methods: {
      app: true,
      sms: false
    }
  });

  const [sessionPolicy, setSessionPolicy] = useState({
    maxSessionTime: 480, // 8 hours
    inactivityTimeout: 30 // 30 minutes
  });

  const [privacySettings, setPrivacySettings] = useState({
    privacyPolicyType: "external",
    privacyPolicyUrl: "https://example.com/privacy",
    privacyPolicyContent: "",
    termsType: "external",
    termsUrl: "https://example.com/terms",
    termsContent: "",
    cookieBanner: true,
    cookieBannerText: "Este site utiliza cookies para melhorar sua experiência. Ao continuar navegando, você concorda com o uso de cookies.",
    acceptButtonText: "Aceitar",
    customizeButtonText: "Personalizar",
    marketingConsentText: "Eu concordo em receber comunicações de marketing por email e WhatsApp",
    dpoEmail: "dpo@empresa.com",
    dataRetentionConversations: "12",
    dataRetentionContacts: "24"
  });

  // Mock data for audit logs
  const auditLogs = [
    { 
      id: 1, 
      timestamp: "2025-05-19 15:30:42", 
      user: "admin@tenant.com", 
      ip: "192.168.1.1", 
      module: "Configurações", 
      action: "CONFIGURACAO_ALTERADA", 
      description: "Alterou política de senhas: comprimento mínimo de 6 para 8 caracteres",
      status: "Sucesso"
    },
    { 
      id: 2, 
      timestamp: "2025-05-19 14:22:15", 
      user: "gerente@tenant.com", 
      ip: "192.168.1.2", 
      module: "Usuários", 
      action: "USUARIO_CRIADO", 
      description: "Criou novo usuário 'agente.novo@tenant.com' com papel 'Agente'",
      status: "Sucesso"
    },
    { 
      id: 3, 
      timestamp: "2025-05-19 10:15:33", 
      user: "agente@tenant.com", 
      ip: "192.168.1.3", 
      module: "Contatos", 
      action: "CONTATO_EDITADO", 
      description: "Atualizou dados do contato 'João Silva' (ID: 12345)",
      status: "Sucesso"
    },
    { 
      id: 4, 
      timestamp: "2025-05-18 16:45:21", 
      user: "admin@tenant.com", 
      ip: "192.168.1.1", 
      module: "Canais", 
      action: "CANAL_WHATSAPP_CONFIGURADO", 
      description: "Configurou canal de WhatsApp 'Atendimento Principal'",
      status: "Sucesso"
    },
    { 
      id: 5, 
      timestamp: "2025-05-18 09:12:07", 
      user: "desconhecido", 
      ip: "203.0.113.45", 
      module: "Autenticação", 
      action: "LOGIN_FALHA", 
      description: "Tentativa de login falha para 'admin@tenant.com'",
      status: "Falha"
    }
  ];

  // Handle changes for password policy
  const handlePasswordPolicyChange = (field: string, value: any) => {
    setPasswordPolicy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle changes for 2FA policy
  const handleTfaPolicyChange = (field: string, value: any) => {
    if (field.startsWith('methods.')) {
      const methodName = field.split('.')[1];
      setTfaPolicy(prev => ({
        ...prev,
        methods: {
          ...prev.methods,
          [methodName]: value
        }
      }));
    } else {
      setTfaPolicy(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle changes for session policy
  const handleSessionPolicyChange = (field: string, value: any) => {
    setSessionPolicy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle changes for privacy settings
  const handlePrivacySettingsChange = (field: string, value: any) => {
    setPrivacySettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAccessPolicies = () => {
    console.log("Salvando políticas de acesso e autenticação", {
      passwordPolicy,
      tfaPolicy,
      sessionPolicy
    });
    
    toast({
      title: "Configurações salvas",
      description: "As políticas de acesso e autenticação foram atualizadas com sucesso.",
    });
  };

  const handleSavePrivacySettings = () => {
    console.log("Salvando configurações de privacidade", privacySettings);
    
    toast({
      title: "Configurações salvas",
      description: "As configurações de privacidade e conformidade foram atualizadas com sucesso.",
    });
  };

  const handleExportAuditLogs = () => {
    console.log("Exportando logs de auditoria");
    
    toast({
      title: "Logs exportados",
      description: "Os logs de auditoria foram exportados com sucesso.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Segurança e Conformidade</CardTitle>
        <CardDescription>
          Configure políticas de segurança, privacidade e conformidade para sua organização
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="access" className="space-y-4">
          <TabsList className="grid grid-cols-3 gap-4 mb-4">
            <TabsTrigger value="access" className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Políticas de Acesso
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Privacidade e Conformidade
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" /> Logs de Auditoria
            </TabsTrigger>
          </TabsList>

          {/* Políticas de Acesso e Autenticação */}
          <TabsContent value="access" className="space-y-6">
            {/* Seção de Política de Senhas */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Política de Senhas</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os requisitos de senha para todos os usuários da sua organização
                  </p>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="strongPassword" 
                    checked={passwordPolicy.strongPassword}
                    onCheckedChange={(checked) => handlePasswordPolicyChange('strongPassword', checked)}
                  />
                  <Label htmlFor="strongPassword" className="font-medium">Exigir senhas fortes</Label>
                </div>

                <div className="ml-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="minLength" className="flex-1">Comprimento mínimo</Label>
                    <Input 
                      id="minLength" 
                      type="number" 
                      className="w-20" 
                      value={passwordPolicy.minLength}
                      onChange={(e) => handlePasswordPolicyChange('minLength', parseInt(e.target.value))}
                      disabled={!passwordPolicy.strongPassword}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="specialChars" 
                      checked={passwordPolicy.specialChars}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('specialChars', checked)}
                      disabled={!passwordPolicy.strongPassword}
                    />
                    <Label htmlFor="specialChars">Exigir caracteres especiais (@, #, $, etc.)</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="upperLower" 
                      checked={passwordPolicy.upperLower}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('upperLower', checked)}
                      disabled={!passwordPolicy.strongPassword}
                    />
                    <Label htmlFor="upperLower">Exigir letras maiúsculas e minúsculas</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="numbers" 
                      checked={passwordPolicy.numbers}
                      onCheckedChange={(checked) => handlePasswordPolicyChange('numbers', checked)}
                      disabled={!passwordPolicy.strongPassword}
                    />
                    <Label htmlFor="numbers">Exigir números</Label>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="expiration" 
                    checked={passwordPolicy.expiration}
                    onCheckedChange={(checked) => handlePasswordPolicyChange('expiration', checked)}
                  />
                  <div className="flex flex-1 items-center justify-between">
                    <Label htmlFor="expiration" className="font-medium">Expiração de senha</Label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">A cada</span>
                      <Input 
                        id="expirationDays" 
                        type="number" 
                        className="w-20" 
                        value={passwordPolicy.expirationDays}
                        onChange={(e) => handlePasswordPolicyChange('expirationDays', parseInt(e.target.value))}
                        disabled={!passwordPolicy.expiration}
                      />
                      <span className="text-sm text-muted-foreground">dias</span>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="lockAccount" 
                    checked={passwordPolicy.lockAccount}
                    onCheckedChange={(checked) => handlePasswordPolicyChange('lockAccount', checked)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="lockAccount" className="font-medium">Bloquear conta após tentativas falhas</Label>
                      <div className="flex items-center space-x-2">
                        <Input 
                          id="maxAttempts" 
                          type="number" 
                          className="w-16" 
                          value={passwordPolicy.maxAttempts}
                          onChange={(e) => handlePasswordPolicyChange('maxAttempts', parseInt(e.target.value))}
                          disabled={!passwordPolicy.lockAccount}
                        />
                        <span className="text-sm text-muted-foreground">tentativas</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <Label htmlFor="lockDuration" className="text-sm text-muted-foreground">Duração do bloqueio</Label>
                      <Select 
                        value={passwordPolicy.lockDuration} 
                        onValueChange={(value) => handlePasswordPolicyChange('lockDuration', value)}
                        disabled={!passwordPolicy.lockAccount}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Selecione a duração" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15 minutos</SelectItem>
                          <SelectItem value="30">30 minutos</SelectItem>
                          <SelectItem value="60">1 hora</SelectItem>
                          <SelectItem value="manual">Até desbloqueio manual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Autenticação de Dois Fatores */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Autenticação de Dois Fatores (2FA)</h3>
                  <p className="text-sm text-muted-foreground">
                    Aumente a segurança das contas exigindo um segundo fator de autenticação
                  </p>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label htmlFor="tfa-required">Exigir 2FA para</Label>
                  <Select 
                    value={tfaPolicy.required} 
                    onValueChange={(value) => handleTfaPolicyChange('required', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione quem deve usar 2FA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Ninguém (opcional)</SelectItem>
                      <SelectItem value="admin">Apenas administradores</SelectItem>
                      <SelectItem value="all">Todos os usuários</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label className="font-medium">Métodos permitidos</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tfa-app" 
                        checked={tfaPolicy.methods.app}
                        onCheckedChange={(checked) => handleTfaPolicyChange('methods.app', checked)}
                      />
                      <Label htmlFor="tfa-app">Aplicativo Autenticador (Google Authenticator, etc.)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="tfa-sms" 
                        checked={tfaPolicy.methods.sms}
                        onCheckedChange={(checked) => handleTfaPolicyChange('methods.sms', checked)}
                      />
                      <Label htmlFor="tfa-sms">SMS (mensagem de texto)</Label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Política de Sessão */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Política de Sessão</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure o comportamento das sessões de usuário no sistema
                  </p>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="max-session-time" className="font-medium">Tempo máximo de sessão</Label>
                    <p className="text-sm text-muted-foreground">
                      Limite total de tempo que um usuário pode permanecer logado
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="max-session-time" 
                      type="number" 
                      className="w-20" 
                      value={sessionPolicy.maxSessionTime}
                      onChange={(e) => handleSessionPolicyChange('maxSessionTime', parseInt(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">minutos</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="inactivity-timeout" className="font-medium">Tempo limite de inatividade</Label>
                    <p className="text-sm text-muted-foreground">
                      Após quanto tempo de inatividade a sessão deve ser encerrada
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="inactivity-timeout" 
                      type="number" 
                      className="w-20" 
                      value={sessionPolicy.inactivityTimeout}
                      onChange={(e) => handleSessionPolicyChange('inactivityTimeout', parseInt(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">minutos</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSaveAccessPolicies}>Salvar Políticas de Acesso</Button>
            </div>
          </TabsContent>

          {/* Privacidade e Conformidade */}
          <TabsContent value="privacy" className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Política de Privacidade e Termos de Uso</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure os documentos legais exibidos aos seus usuários
                  </p>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <div className="space-y-2">
                  <Label htmlFor="privacy-policy-type" className="font-medium">Política de Privacidade</Label>
                  <Select 
                    value={privacySettings.privacyPolicyType} 
                    onValueChange={(value) => handlePrivacySettingsChange('privacyPolicyType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">Link Externo</SelectItem>
                      <SelectItem value="embedded">Documento Embutido</SelectItem>
                      <SelectItem value="none">Não Utilizar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {privacySettings.privacyPolicyType === 'external' && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="privacy-policy-url">URL da Política de Privacidade</Label>
                    <Input 
                      id="privacy-policy-url" 
                      value={privacySettings.privacyPolicyUrl}
                      onChange={(e) => handlePrivacySettingsChange('privacyPolicyUrl', e.target.value)}
                      placeholder="https://exemplo.com/privacidade"
                    />
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="terms-type" className="font-medium">Termos de Uso</Label>
                  <Select 
                    value={privacySettings.termsType} 
                    onValueChange={(value) => handlePrivacySettingsChange('termsType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="external">Link Externo</SelectItem>
                      <SelectItem value="embedded">Documento Embutido</SelectItem>
                      <SelectItem value="none">Não Utilizar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {privacySettings.termsType === 'external' && (
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="terms-url">URL dos Termos de Uso</Label>
                    <Input 
                      id="terms-url" 
                      value={privacySettings.termsUrl}
                      onChange={(e) => handlePrivacySettingsChange('termsUrl', e.target.value)}
                      placeholder="https://exemplo.com/termos"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Conformidade com LGPD</h3>
                  <p className="text-sm text-muted-foreground">
                    Configurações para conformidade com a Lei Geral de Proteção de Dados
                  </p>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="cookie-banner" 
                    checked={privacySettings.cookieBanner}
                    onCheckedChange={(checked) => handlePrivacySettingsChange('cookieBanner', checked)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="cookie-banner" className="font-medium">Exibir Banner de Cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Exibe um banner de consentimento de cookies para novos visitantes
                    </p>
                  </div>
                </div>

                {privacySettings.cookieBanner && (
                  <div className="space-y-2 ml-6 mt-2">
                    <Label htmlFor="cookie-banner-text">Texto do Banner</Label>
                    <Input 
                      id="cookie-banner-text" 
                      value={privacySettings.cookieBannerText}
                      onChange={(e) => handlePrivacySettingsChange('cookieBannerText', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <Label htmlFor="accept-button-text">Texto do botão Aceitar</Label>
                        <Input 
                          id="accept-button-text" 
                          value={privacySettings.acceptButtonText}
                          onChange={(e) => handlePrivacySettingsChange('acceptButtonText', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customize-button-text">Texto do botão Personalizar</Label>
                        <Input 
                          id="customize-button-text" 
                          value={privacySettings.customizeButtonText}
                          onChange={(e) => handlePrivacySettingsChange('customizeButtonText', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="marketing-consent-text" className="font-medium">Texto de Consentimento de Marketing</Label>
                  <Input 
                    id="marketing-consent-text" 
                    value={privacySettings.marketingConsentText}
                    onChange={(e) => handlePrivacySettingsChange('marketingConsentText', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Este texto será exibido ao lado de checkboxes de consentimento para comunicações de marketing
                  </p>
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <Label htmlFor="dpo-email" className="font-medium">Email do Encarregado de Dados (DPO)</Label>
                  <Input 
                    id="dpo-email" 
                    type="email"
                    value={privacySettings.dpoEmail}
                    onChange={(e) => handlePrivacySettingsChange('dpoEmail', e.target.value)}
                    placeholder="dpo@suaempresa.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    O Encarregado de Dados é a pessoa responsável por garantir a conformidade com a LGPD
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Retenção de Dados</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure por quanto tempo os dados são mantidos no sistema
                  </p>
                </div>
              </div>

              <div className="space-y-4 border rounded-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="data-retention-conversations" className="font-medium">Conversas</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="data-retention-conversations" 
                        type="number"
                        className="w-20"
                        value={privacySettings.dataRetentionConversations}
                        onChange={(e) => handlePrivacySettingsChange('dataRetentionConversations', e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">meses</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tempo que as conversas e mensagens são mantidas
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="data-retention-contacts" className="font-medium">Contatos inativos</Label>
                    <div className="flex items-center space-x-2">
                      <Input 
                        id="data-retention-contacts" 
                        type="number"
                        className="w-20"
                        value={privacySettings.dataRetentionContacts}
                        onChange={(e) => handlePrivacySettingsChange('dataRetentionContacts', e.target.value)}
                      />
                      <span className="text-sm text-muted-foreground">meses</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Tempo que contatos sem atividade são mantidos
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSavePrivacySettings}>Salvar Configurações de Privacidade</Button>
            </div>
          </TabsContent>

          {/* Logs de Auditoria */}
          <TabsContent value="audit" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Logs de Auditoria</h3>
                <p className="text-sm text-muted-foreground">
                  Visualize e exporte registros de atividades e alterações no sistema
                </p>
              </div>
              <Button variant="outline" onClick={handleExportAuditLogs}>
                <Download className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
            </div>

            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data e Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Endereço IP</TableHead>
                    <TableHead>Módulo</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.timestamp}</TableCell>
                      <TableCell>{log.user}</TableCell>
                      <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                      <TableCell>{log.module}</TableCell>
                      <TableCell className="font-mono text-xs">{log.action}</TableCell>
                      <TableCell className="max-w-md whitespace-normal break-words">
                        {log.description}
                      </TableCell>
                      <TableCell>
                        {log.status === 'Sucesso' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <UserCheck className="h-3 w-3 mr-1" />
                            Sucesso
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Falha
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-center">
              <Button variant="outline" size="sm">Carregar Mais</Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};