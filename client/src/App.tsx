import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SocketProvider } from "@/contexts/SocketContext";
import { useAuthInit } from "@/hooks/useAuthInit";
import NotFound from "@/pages/not-found";
import Layout from "@/pages/layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Inbox from "@/pages/inbox";
import Contacts from "@/pages/contacts";
import Companies from "@/pages/companies";
import Deals from "@/pages/deals";
import ProfAna from "@/pages/profana";
import Goals from "@/pages/goals";
import Campaigns from "@/pages/campaigns";
import Automations from "@/pages/automations";
import Reports from "@/pages/reports";
import AISettings from "@/pages/settings-ai";
import ChannelsSettings from "@/pages/settings-channels";
import CRMSettings from "@/pages/settings-crm";
import IntegrationsSettings from "@/pages/settings-integrations";
import MarketingSettings from "@/pages/settings-marketing";
import UsersSettings from "@/pages/settings-users";
import BrandingSettings from "@/pages/settings-branding";
import CompanySettings from "@/pages/settings-company";
import GoalsSettings from "@/pages/settings-goals";
import LocalizationSettings from "@/pages/settings-localization";
import NotificationsSettings from "@/pages/settings-notifications";
import SecuritySettings from "@/pages/settings-security";
import SubscriptionSettings from "@/pages/settings-subscription";
import Settings from "@/pages/settings";
import ZapiTestPage from "@/pages/ZapiTestPage";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/:rest*">
        <Layout>
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
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  useAuthInit();
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SocketProvider>
          <Toaster />
          <Router />
        </SocketProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
