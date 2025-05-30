import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/SocketContext";
import { useAuthInit } from "@/hooks/useAuthInit";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense, lazy, useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
// Importar o sistema de tratamento de erros
import '@/lib/errorHandling';

// Lazy loading para componentes de rota para melhorar a performance e evitar problemas de renderização
const Layout = lazy(() => import("@/pages/layout"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Chat = lazy(() => import("@/pages/chat"));
const Inbox = lazy(() => import("@/pages/inbox"));
const Contacts = lazy(() => import("@/pages/contacts"));
const Companies = lazy(() => import("@/pages/companies"));
const Deals = lazy(() => import("@/pages/deals"));
const ProfAna = lazy(() => import("@/pages/profana"));
const Goals = lazy(() => import("@/pages/goals"));
const Campaigns = lazy(() => import("@/pages/campaigns"));
const Automations = lazy(() => import("@/pages/automations"));
const Reports = lazy(() => import("@/pages/reports"));
const AISettings = lazy(() => import("@/pages/settings-ai"));
const ChannelsSettings = lazy(() => import("@/pages/settings-channels"));
const CRMSettings = lazy(() => import("@/pages/settings-crm"));
const IntegrationsSettings = lazy(() => import("@/pages/settings-integrations"));
const MarketingSettings = lazy(() => import("@/pages/settings-marketing"));
const UsersSettings = lazy(() => import("@/pages/settings-users"));
const BrandingSettings = lazy(() => import("@/pages/settings-branding"));
const CompanySettings = lazy(() => import("@/pages/settings-company"));
const GoalsSettings = lazy(() => import("@/pages/settings-goals"));
const LocalizationSettings = lazy(() => import("@/pages/settings-localization"));
const NotificationsSettings = lazy(() => import("@/pages/settings-notifications"));
const SecuritySettings = lazy(() => import("@/pages/settings-security"));
const SubscriptionSettings = lazy(() => import("@/pages/settings-subscription"));
const Settings = lazy(() => import("@/pages/settings"));
const ZapiTestPage = lazy(() => import("@/pages/ZapiTestPage"));

// Componente de loading para o Suspense
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="text-gray-600">Carregando...</span>
    </div>
  </div>
);

function Router() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/:rest*">
            <Layout>
              <Suspense fallback={<Loading />}>
                <Switch>
                  <Route path="/" component={Dashboard} />
                  <Route path="/chat" component={Chat} />
                  <Route path="/inbox" component={Inbox} />
                  <Route path="/contacts" component={Contacts} />
                  <Route path="/companies" component={Companies} />
                  <Route path="/deals" component={Deals} />
                  <Route path="/profana" component={ProfAna} />
                  <Route path="/goals" component={Goals} />
                  <Route path="/campaigns" component={Campaigns} />
                  <Route path="/campaigns/new" component={Campaigns} />
                  <Route path="/automations" component={Automations} />
                  <Route path="/reports" component={Reports} />
                  <Route path="/settings" component={Settings} />
                  <Route path="/settings/ai" component={AISettings} />
                  <Route path="/settings/channels" component={ChannelsSettings} />
                  <Route path="/settings/crm" component={CRMSettings} />
                  <Route path="/settings/integrations" component={IntegrationsSettings} />
                  <Route path="/settings/marketing" component={MarketingSettings} />
                  <Route path="/settings/users" component={UsersSettings} />
                  <Route path="/settings/branding" component={BrandingSettings} />
                  <Route path="/settings/company" component={CompanySettings} />
                  <Route path="/settings/goals" component={GoalsSettings} />
                  <Route path="/settings/localization" component={LocalizationSettings} />
                  <Route path="/settings/notifications" component={NotificationsSettings} />
                  <Route path="/settings/security" component={SecuritySettings} />
                  <Route path="/settings/subscription" component={SubscriptionSettings} />
                  <Route component={NotFound} />
                </Switch>
              </Suspense>
            </Layout>
          </Route>
        </Switch>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  
  // Use o hook de autenticação
  useAuthInit();
  
  // Garante que o app só renderiza após a primeira verificação de autenticação
  useEffect(() => {
    // Breve delay para permitir que outras inicializações ocorram primeiro
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!isAppReady) {
    return <Loading />;
  }
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SocketProvider>
            <Toaster />
            <Router />
          </SocketProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
