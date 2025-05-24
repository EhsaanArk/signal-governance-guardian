
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import RuleSetsPage from "./pages/RuleSetsPage";
import RuleSetDetailPage from "./pages/RuleSetDetailPage";
import CreateRuleSetPage from "./pages/CreateRuleSetPage";
import EditRuleSetPage from "./pages/EditRuleSetPage";
import BreachLogPage from "./pages/BreachLogPage";
import CoolDownsPage from "./pages/CoolDownsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/old-index" element={<Index />} />
          
          <Route path="/admin/rulesets" element={<RuleSetsPage />} />
          <Route path="/admin/rulesets/:id" element={<RuleSetDetailPage />} />
          <Route path="/admin/rulesets/create" element={<CreateRuleSetPage />} />
          <Route path="/admin/rulesets/:id/edit" element={<EditRuleSetPage />} />
          <Route path="/admin/breaches" element={<BreachLogPage />} />
          <Route path="/admin/cooldowns" element={<CoolDownsPage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
