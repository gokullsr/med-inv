import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AddMedicine from './components/AddMedicine';
import InventoryList from './components/InventoryList';
import SalesCustomers from './components/SalesCustomers';
import AuditLogs from './components/AuditLogs';
import Alerts from './components/Alerts';
import Analytics from './components/Analytics';
import RealTimeDashboard from './components/RealTimeDashboard';
import StockForecast from './components/StockForecast';
import CustomerInsights from './components/CustomerInsights';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const loggedIn = localStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminName');
    setIsLoggedIn(false);
  };

  // If not logged in, show Login page
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              <span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>💊</span> JYO Medical Centre
            </Link>
            <div className="navbar-nav">
              <Link className="nav-link" to="/">
                📊 Dashboard
              </Link>
              <Link className="nav-link" to="/realtime">
                🚀 Real-Time
              </Link>
              <Link className="nav-link" to="/inventory">
                📦 Inventory
              </Link>
              <Link className="nav-link" to="/add-medicine">
                ➕ Add Medicine
              </Link>
              <Link className="nav-link" to="/sales-customers">
                💰 Sales & Customers
              </Link>
              <Link className="nav-link" to="/forecast">
                🔮 Forecast
              </Link>
              <Link className="nav-link" to="/customer-insights">
                👥 Customer Insights
              </Link>
              <Link className="nav-link" to="/analytics">
                📈 Analytics
              </Link>
              <Link className="nav-link" to="/audit-logs">
                📋 Audit Logs
              </Link>
              <button className="nav-link logout-btn" onClick={handleLogout}>
                🚪 Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/realtime" element={<RealTimeDashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/add-medicine" element={<AddMedicine />} />
            <Route path="/sales-customers" element={<SalesCustomers />} />
            <Route path="/forecast" element={<StockForecast />} />
            <Route path="/customer-insights" element={<CustomerInsights />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            {/* Add Alerts route to your navigation */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;