import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Import components
import Dashboard from './components/Dashboard';
import AddMedicine from './components/AddMedicine';
import InventoryList from './components/InventoryList';
import SalesCustomers from './components/SalesCustomers';
import AuditLogs from './components/AuditLogs';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar navbar-expand-lg navbar-dark">
          <div className="container">
            <Link className="navbar-brand" to="/">
              💊 JYO Medical Centre
            </Link>
            <div className="navbar-nav">
              <Link className="nav-link" to="/">
                📊 Dashboard
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
              <Link className="nav-link" to="/audit-logs">
                📋 Audit Logs
              </Link>
            </div>
          </div>
        </nav>

        <main className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/add-medicine" element={<AddMedicine />} />
            <Route path="/sales-customers" element={<SalesCustomers />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            // Add Alerts route to your navigation
            <Route path="/alerts" element={<Alerts />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;