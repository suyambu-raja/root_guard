// src/App.tsx
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Index } from './pages/Index';
import { Irrigation } from './pages/Irrigation';
import { Alerts } from './pages/Alerts';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { BottomTabNavigation } from '@/components/BottomTabNavigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import './i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router>
          {/* Main Content */}
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/irrigation" element={<Irrigation />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>

          {/* Bottom Tab Navigation */}
          <BottomTabNavigation />

          <Toaster />
          <PWAInstallPrompt />
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;