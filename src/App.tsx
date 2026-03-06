import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/hooks/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Creatives from "./pages/Creatives";
import AdsRoas from "./pages/AdsRoas";
import WhatsAppGroups from "./pages/WhatsAppGroups";
import ZoomSessions from "./pages/ZoomSessions";
import Automations from "./pages/Automations";
import Revenue from "./pages/Revenue";
import CoachPanel from "./pages/CoachPanel";
import SettingsPage from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const ProtectedAppLayout = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/creatives" element={<Creatives />} />
          <Route path="/ads" element={<AdsRoas />} />
          <Route path="/whatsapp" element={<WhatsAppGroups />} />
          <Route path="/zoom" element={<ZoomSessions />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/coach/:id" element={<CoachPanel />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected app */}
          <Route path="/*" element={<ProtectedAppLayout />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;