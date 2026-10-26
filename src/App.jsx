import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import AppLayout from '@/components/AppLayout';
import Dashboard from '@/pages/Dashboard';
import FocusTimer from '@/pages/FocusTimer';
import DailyCheckIn from '@/pages/DailyCheckIn';
import Progress from '@/pages/Progress';
import Settings from '@/pages/Settings';
import About from '@/pages/About';

// No accounts: everything the student logs stays on their own device (see lib/db.js).
function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/focus" element={<FocusTimer />} />
            <Route path="/check-in" element={<DailyCheckIn />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<About />} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
