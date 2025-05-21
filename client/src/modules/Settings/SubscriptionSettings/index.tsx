import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Download, 
  File, 
  FileText, 
  ShieldCheck,
  Info,
  Building,
  PieChart
} from "lucide-react";

// Mock de dados para demonstração
const currentPlan = {
  name: "Plano Empresarial",
  status: "active", // active, pending, suspended, trial
  price: 499,
  cycle: "monthly", // monthly, yearly
  nextBillingDate: "2025-06-15",
  startDate: "2023-06-15",
  resources: [
    { name: "Usuários/Agentes", used: 8, total: 10 },
    { name: "Canais de Comunicação", used: 4, total: 5 },
    { name: "Contatos Armazenados no CRM", used: 12500, total: 15000 },
    { name: "Mensagens de Campanha/Mês", used: 25000, total: 50000 },
    { name: "Automações/Workflows Ativos", used: 18, total: 20 }
  ]
};

const invoicesMock = [
  {
    id: "INV-2025-0001",
    issueDate: "2025-05-01",
    dueDate: "2025-05-15",
    description: "Assinatura Plano Empresarial - Maio/2025",
    amount: 499,
    status: "paid", // paid, pending, overdue, canceled
    paymentMethod: "Visa **** 1234"
  },
  {
    id: "INV-2025-0002",
    issueDate: "2025-04-01",
    dueDate: "2025-04-15",
    description: "Assinatura Plano Empresarial - Abril/2025",
    amount: 499,
    status: "paid",
    paymentMethod: "Visa **** 1234"
  },
  {
    id: "INV-2025-0003",
    issueDate: "2025-03-01",
    dueDate: "2025-03-15",
    description: "Assinatura Plano Empresarial - Março/2025",
    amount: 499,
    status: "paid",
    paymentMethod: "Visa **** 1234"
  }
];

const paymentMethodsMock = {
  primary: {
    type: "credit_card",
    brand: "Visa",
    last4: "4321",
    expMonth: 12,
    expYear: 2027
  }
};

const companyBillingInfoMock = {
  companyName: "Empresa Exemplo LTDA",
  taxId: "12.345.678/0001-90",
  address: "Av. Exemplo, 1000",
  complement: "Sala 123",
  district: "Centro",
  city: "São Paulo",
  state: "SP",
  zipCode: "01234-567",
  country: "Brasil",
  email: "financeiro@exemplo.com",
  additionalEmail: "",
  phone: "(11) 98765-4321",
  stateRegistration: ""
};

const plansMock = [
  {
    id: "starter",
    name: "Plano Iniciante",
    price: 199,
    cycle: "monthly",
    features: [
      "5 usuários",
      "3 canais de comunicação",
      "5.000 contatos",
      "10.000 mensagens/mês",
      "10 automações"
    ],
    recommended: false
  },
  {
    id: "professional",
    name: "Plano Profissional",
    price: 349,
    cycle: "monthly",
    features: [
      "7 usuários",
      "4 canais de comunicação",
      "10.000 contatos",
      "25.000 mensagens/mês",
      "15 automações"
    ],
    recommended: false
  },
  {
    id: "enterprise",
    name: "Plano Empresarial",
    price: 499,
    cycle: "monthly",
    features: [
      "10 usuários",
      "5 canais de comunicação",
      "15.000 contatos",
      "50.000 mensagens/mês",
      "20 automações"
    ],
    recommended: true,
    current: true
  },
  {
    id: "custom",
    name: "Plano Personalizado",
    price: null,
    cycle: null,
    features: [
      "Usuários ilimitados",
      "Canais de comunicação ilimitados",
      "Contatos ilimitados",
      "Volume de mensagens personalizado",
      "Automações ilimitadas",
      "Suporte dedicado"
    ],
    recommended: false,
    isCustom: true
  }
];

export const SubscriptionSettings = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const form = useForm({
    defaultValues: companyBillingInfoMock
  });

  // Renderiza o selo de status do plano com cor adequada
  const renderPlanStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500">Ativa</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-yellow-500">Pendente</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspensa</Badge>;
      case "trial":
        return <Badge variant="default" className="bg-blue-500">Trial</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Renderiza o selo de status da fatura com cor adequada
  const renderInvoiceStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="default" className="bg-green-500">Paga</Badge>;
      case "pending":
        return <Badge variant="default" className="bg-yellow-500">Pendente</Badge>;
      case "overdue":
        return <Badge variant="destructive">Vencida</Badge>;
      case "canceled":
        return <Badge variant="outline">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const handleFormSubmit = (data: any) => {
    console.log("Dados de cobrança atualizados:", data);
    toast({
      title: "Sucesso",
      description: "Seus dados de cobrança foram atualizados.",
    });
  };

  const handlePlanChange = (planId: string) => {
    toast({
      title: "Mudança de Plano Iniciada",
      description: "Um especialista entrará em contato para confirmar a mudança para o " + plansMock.find(p => p.id === planId)?.name,
    });
  };

  const handlePaymentMethodUpdate = () => {
    toast({
      title: "Método de Pagamento",
      description: "Funcionalidade em desenvolvimento. Em breve você poderá atualizar seus métodos de pagamento.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conta e Assinatura</CardTitle>
        <CardDescription>
          Gerencie os detalhes do seu plano e pagamentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Visão Geral</span>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Faturas</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span>Pagamento</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger value="usage" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span>Uso</span>
            </TabsTrigger>
            <TabsTrigger value="billing-info" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>Dados de Cobrança</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Visão Geral do Plano */}
          <TabsContent value="overview">
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium">Meu Plano Atual</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{currentPlan.name}</span>
                      {renderPlanStatusBadge(currentPlan.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {formatCurrency(currentPlan.price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        {currentPlan.cycle === "monthly" ? " / mês" : " / ano"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Próxima cobrança: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 mt-6">
                  <p className="font-medium">Resumo dos Principais Recursos:</p>
                  <div className="space-y-3">
                    {currentPlan.resources.map((resource, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{resource.name}</span>
                          <span>
                            {resource.name.includes("Contatos") || resource.name.includes("Mensagens") 
                              ? `${resource.used.toLocaleString()} de ${resource.total.toLocaleString()}`
                              : `${resource.used} de ${resource.total}`}
                          </span>
                        </div>
                        <Progress 
                          value={(resource.used / resource.total) * 100} 
                          className={resource.used / resource.total > 0.9 ? "bg-red-100" : ""}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <Button variant="outline" onClick={() => setActiveTab("plans")}>
                    Ver Detalhes Completos do Plano
                  </Button>
                  <Button variant="default" onClick={() => setActiveTab("plans")}>
                    Alterar Plano
                  </Button>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="destructive">Cancelar Assinatura</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Cancelar Assinatura</SheetTitle>
                        <SheetDescription>
                          Estamos tristes em ver você partir. Antes de cancelar sua assinatura, 
                          gostaríamos de saber como podemos melhorar nossos serviços.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-6">
                        <Textarea
                          className="min-h-[120px]"
                          placeholder="Por favor, conte-nos o motivo do cancelamento..."
                        />
                      </div>
                      <Alert className="mb-4">
                        <AlertDescription>
                          Ao cancelar sua assinatura, você perderá o acesso ao sistema ao final do 
                          período já pago. Seus dados ficarão disponíveis por 30 dias e 
                          depois serão permanentemente removidos.
                        </AlertDescription>
                      </Alert>
                      <SheetFooter>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            toast({
                              title: "Solicitação Enviada",
                              description: "Nossa equipe entrará em contato em breve."
                            });
                          }}
                        >
                          Confirmar Cancelamento
                        </Button>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Histórico de Faturamento */}
          <TabsContent value="invoices">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Histórico de Faturas</h3>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
              
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Número</TableHead>
                      <TableHead>Data de Emissão</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Método de Pagamento</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoicesMock.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.description}</TableCell>
                        <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{renderInvoiceStatusBadge(invoice.status)}</TableCell>
                        <TableCell>{invoice.paymentMethod}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
          
          {/* Métodos de Pagamento */}
          <TabsContent value="payment">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Métodos de Pagamento</h3>
              </div>
              
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {paymentMethodsMock.primary.brand} **** {paymentMethodsMock.primary.last4}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expira em {paymentMethodsMock.primary.expMonth}/{paymentMethodsMock.primary.expYear}
                      </p>
                    </div>
                  </div>
                  <Badge>Principal</Badge>
                </div>
                
                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Button variant="outline" onClick={handlePaymentMethodUpdate}>
                    Atualizar
                  </Button>
                  <Button variant="outline" onClick={handlePaymentMethodUpdate}>
                    Adicionar Novo Método
                  </Button>
                </div>
              </div>
              
              <div className="border rounded-lg p-6">
                <h4 className="font-medium mb-2">Detalhes de Faturamento</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Você será cobrado automaticamente no dia {new Date(currentPlan.nextBillingDate).getDate()} de cada mês.
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Próxima cobrança:</span>
                    <span className="text-sm font-medium">
                      {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Valor:</span>
                    <span className="text-sm font-medium">{formatCurrency(currentPlan.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Método:</span>
                    <span className="text-sm font-medium">
                      {paymentMethodsMock.primary.brand} **** {paymentMethodsMock.primary.last4}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Opções de Planos */}
          <TabsContent value="plans">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Planos Disponíveis</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {plansMock.map((plan) => (
                  <div 
                    key={plan.id} 
                    className={`border rounded-lg p-6 relative ${
                      plan.current ? 'border-primary ring-1 ring-primary' : ''
                    } ${
                      plan.recommended ? 'border-primary' : ''
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
                        <Badge className="bg-primary">Recomendado</Badge>
                      </div>
                    )}
                    
                    {plan.current && (
                      <div className="absolute -top-2.5 left-0 w-full flex justify-center">
                        <Badge variant="outline" className="bg-background border-primary text-primary">
                          Plano Atual
                        </Badge>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h4 className="text-xl font-medium">{plan.name}</h4>
                      {plan.isCustom ? (
                        <p className="text-sm text-muted-foreground">Sob Consulta</p>
                      ) : (
                        <p className="mt-1">
                          <span className="text-2xl font-bold">{formatCurrency(plan.price || 0)}</span>
                          <span className="text-sm text-muted-foreground">
                            {plan.cycle === "monthly" ? " / mês" : " / ano"}
                          </span>
                        </p>
                      )}
                    </div>
                    
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.isCustom ? (
                      <Button 
                        className="w-full" 
                        variant="default"
                        onClick={() => {
                          toast({
                            title: "Solicitação Enviada",
                            description: "Um especialista entrará em contato para elaborar seu plano personalizado."
                          });
                        }}
                      >
                        Falar com Consultor
                      </Button>
                    ) : plan.current ? (
                      <Button className="w-full" variant="outline" disabled>
                        Plano Atual
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        variant={plan.recommended ? "default" : "outline"}
                        onClick={() => handlePlanChange(plan.id)}
                      >
                        Escolher Plano
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Alert>
                <AlertDescription>
                  Todos os planos incluem suporte técnico, atualizações e acesso a novas funcionalidades. 
                  Para mais detalhes sobre cada plano ou ajuda para escolher o melhor para sua empresa, 
                  entre em contato com nossa equipe comercial.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          {/* Uso de Recursos */}
          <TabsContent value="usage">
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Uso de Recursos</h3>
              
              <div className="border rounded-lg p-6 space-y-6">
                <p className="text-sm text-muted-foreground">
                  Acompanhe aqui o uso dos recursos incluídos no seu plano {currentPlan.name}.
                </p>
                
                <div className="space-y-6">
                  {currentPlan.resources.map((resource, index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h4 className="font-medium">{resource.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {resource.name.includes("Contatos") || resource.name.includes("Mensagens") 
                              ? `${resource.used.toLocaleString()} de ${resource.total.toLocaleString()} utilizados`
                              : `${resource.used} de ${resource.total} utilizados`}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((resource.used / resource.total) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(resource.used / resource.total) * 100} 
                        className={resource.used / resource.total > 0.9 ? "bg-red-100" : ""}
                      />
                      
                      {resource.used / resource.total > 0.9 && (
                        <p className="text-xs text-amber-600 mt-1">
                          Você está próximo do limite. Considere fazer um upgrade do seu plano.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveTab("plans")}>
                    Comparar Planos
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Dados de Cobrança */}
          <TabsContent value="billing-info">
            <div className="space-y-6">
              <h3 className="text-lg font-medium mb-4">Dados de Cobrança</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="country"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email para Faturamento</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="additionalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Adicional (opcional)</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="stateRegistration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inscrição Estadual (opcional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                  </div>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};