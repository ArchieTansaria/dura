import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';
import Settings from './pages/Settings';
import SystemStatus from './pages/SystemStatus';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/api/dashboard" element={<Dashboard />} />
        <Route path="/repo/:owner/:name" element={<RepoDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/account" element={<Settings />} />
        <Route path="/status" element={<SystemStatus />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
