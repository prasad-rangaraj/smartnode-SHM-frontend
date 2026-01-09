import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MaintenanceWorker from "./pages/MaintenanceWorker";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { useAppStore } from "./store/useAppStore";

const queryClient = new QueryClient();

const App = () => {
  const { connectToServer, token } = useAppStore();

  useEffect(() => {
    if (token) {
      connectToServer();
    }
  }, [connectToServer, token]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner 
          duration={2000} 
          closeButton 
          position="top-center" 
        />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/worker" element={<MaintenanceWorker />} />
            <Route path="/" element={token ? <Index /> : <Navigate to="/login" replace />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
