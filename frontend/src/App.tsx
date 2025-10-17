import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/Homepage";
import OpportunityDetail from "./pages/OpportunityDetail";
import EUFinancingDetail from "./pages/EUFinancingDetail";
import GrantDetail from "./pages/GrantDetail";
import Sources from "./pages/Sources";
import Contact from "./pages/Contact";
import StarredGrants from "./pages/StarredGrants";
import NotFound from "./pages/NotFound";
import Footer from "./components/layout/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/opportunity/:id" element={<OpportunityDetail />} />
              <Route path="/eu-financing/:id" element={<EUFinancingDetail />} />
              <Route path="/grant/:id" element={<GrantDetail />} />
              <Route path="/sources" element={<Sources />} />
              <Route path="/starred" element={<StarredGrants />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
