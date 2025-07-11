import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { autoConfigService } from "@/services/AutoConfigService";

const queryClient = new QueryClient();

const App = () => {
  // Auto-initialize system configurations on app startup
  useEffect(() => {
    const initializeSystem = async () => {
      try {
        await autoConfigService.initializeSystemConfigurations();
        
        // Log system status for debugging
        const status = autoConfigService.getSystemStatus();
        console.log('🚀 Application started with auto-configuration:', status);
      } catch (error) {
        console.error('⚠️ Failed to initialize system configurations:', error);
      }
    };

    initializeSystem();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
