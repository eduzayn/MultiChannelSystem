import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/pages/layout";
import Dashboard from "@/pages/dashboard";
import Chat from "@/pages/chat";
import Inbox from "@/pages/inbox";
import Contacts from "@/pages/contacts";
import Companies from "@/pages/companies";
import Deals from "@/pages/deals";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/chat" component={Chat} />
        <Route path="/inbox" component={Inbox} />
        <Route path="/contacts" component={Contacts} />
        <Route path="/companies" component={Companies} />
        <Route path="/deals" component={Deals} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
