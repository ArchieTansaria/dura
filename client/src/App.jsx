import { Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/api/dashboard" element={<Dashboard />} />
      <Route path="/repo/:id" element={<RepoDetail />} />
    </Routes>
  );
}

export default App;
