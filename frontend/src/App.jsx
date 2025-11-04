import './css/App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './assets/LandingPage/LandingPage.jsx';
import DashboardAdmin from './components/Dashboards/Admin/DashboardAdmin.jsx';
import DashboardRepresentante from './components/Dashboards/Representante/DashboardRepresentante.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin" element={<DashboardAdmin />} />
        <Route path="/representante" element={<DashboardRepresentante />} />
      </Routes>
    </Router>
  );
}

export default App;
