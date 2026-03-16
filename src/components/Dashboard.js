import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      
      const [inventoryRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/inventory`),
        axios.get(`${API_BASE_URL}/sales`)
      ]);

      setInventory(inventoryRes.data);
      setSales(salesRes.data);

    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);


  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalSalesCount = sales.length;
  const totalInventoryItems = inventory.length;
  
  
  const outOfStock = inventory.filter(item => item.quantity === 0).length;
  const lowStock = inventory.filter(item => item.quantity > 0 && item.quantity < 10).length;
  const inStock = inventory.filter(item => item.quantity >= 10).length;
  
  
  const totalInventoryValue = inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const lowStockAlerts = inventory.filter(item => item.quantity < 10);
  
  
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  const expiringSoon = inventory.filter(item => {
    const expiryDate = new Date(item.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate > today;
  });

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`✅ Backend connection successful!\n${response.data.message}`);
      fetchData();
    } catch (error) {
      alert("❌ Cannot connect to backend server. Please make sure it's running on port 5000.");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h3>Loading Dashboard...</h3>
          <p>Please wait while we load your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>🏥 Medical Inventory Dashboard</h1>

      {/* Connection Test Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testConnection}
          style={{
            padding: '0.5rem 1rem',
            background: '#507A88',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginRight: '0.5rem'
          }}
        >
          Test Backend Connection
        </button>
        <button 
          onClick={fetchData}
          style={{
            padding: '0.5rem 1rem',
            background: '#52B788',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Refresh Data
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#FFE5E5',
          border: '1px solid #E63946',
          color: '#8B2C2C',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="cards-container">
        <div className="card success">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue.toFixed(2)}</p>
          <small>All-time earnings</small>
        </div>
        <div className="card primary">
          <h3>Total Sales</h3>
          <p>{totalSalesCount}</p>
          <small>Transactions</small>
        </div>
        <div className="card info">
          <h3>Inventory Items</h3>
          <p>{totalInventoryItems}</p>
          <small>Medicines in stock</small>
        </div>
        <div className="card teal">
          <h3>Stock Value</h3>
          <p>₹{totalInventoryValue.toFixed(2)}</p>
          <small>Current inventory value</small>
        </div>
      </div>

      {/* Current Inventory */}
      <div className="dashboard-section">
        <h2>📦 Current Inventory ({inventory.length} items)</h2>
        {inventory.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            background: '#f8fafc',
            borderRadius: '8px',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <h3 style={{ color: '#909BAB', marginBottom: '0.5rem' }}>No Medicines in Inventory</h3>
            <p style={{ color: '#636E7F' }}>Add medicines to get started with inventory management.</p>
            <button 
              onClick={() => window.location.href = '/add-medicine'}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#507A88',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                marginTop: '1rem'
              }}
            >
              ➕ Add First Medicine
            </button>
          </div>
        ) : (
          <div className="inventory-grid">
            {inventory.map((item) => {
              const getStockStatus = () => {
                if (item.quantity === 0) return { status: 'Out of Stock', color: 'error', class: 'out-of-stock' };
                if (item.quantity < 5) return { status: 'Critical', color: 'error', class: 'critical' };
                if (item.quantity < 10) return { status: 'Low Stock', color: 'warning', class: 'low-stock' };
                return { status: 'In Stock', color: 'success', class: '' };
              };

              const stockInfo = getStockStatus();
              const itemValue = item.price * item.quantity;

              return (
                <div key={item._id} className={`inventory-card ${stockInfo.class}`}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
                      <h4 style={{ flex: 1, margin: 0 }}>{item.name}</h4>
                      <span className={`badge badge-${stockInfo.color}`} style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}>
                        {stockInfo.status}
                      </span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: '600' }}>Stock</div>
                        <div className="quantity">{item.quantity} units</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem', fontWeight: '600' }}>Price</div>
                        <div className="price">₹{item.price}</div>
                      </div>
                    </div>

                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--accent-info)', 
                      fontWeight: '600',
                      margin: '0.5rem 0'
                    }}>
                      Value: ₹{itemValue.toFixed(2)}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--neutral-border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                    <small style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>Category: {item.category || 'General'}</small>
                    <small style={{ display: 'block', color: 'var(--text-secondary)' }}>
                      Expires: {new Date(item.expiryDate).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alerts Section */}
      {(lowStockAlerts.length > 0 || expiringSoon.length > 0) && (
        <div className="dashboard-section">
          <h2>⚠️ System Alerts</h2>
          
          {/* Low Stock Alerts */}
          {lowStockAlerts.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h4 style={{ color: '#8B2C2C', marginBottom: '1rem' }}>🔴 Low Stock Alerts ({lowStockAlerts.length})</h4>
              <div className="alerts-list">
                {lowStockAlerts.map((alert) => (
                  <div key={alert._id} className="alert-item">
                    <strong>{alert.name}</strong> • 
                    Current Stock: <span style={{ color: '#E63946', fontWeight: '600' }}>
                      {alert.quantity} units
                    </span> • 
                    Price: ₹{alert.price} •
                    Category: {alert.category || 'General'}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Soon Alerts */}
          {expiringSoon.length > 0 && (
            <div>
              <h4 style={{ color: '#C4750C', marginBottom: '1rem' }}>🟡 Expiring Soon ({expiringSoon.length})</h4>
              <div className="alerts-list">
                {expiringSoon.map((medicine) => (
                  <div key={medicine._id} className="alert-item" style={{ borderColor: '#FFB703', background: '#FFF9E5' }}>
                    <strong>{medicine.name}</strong> • 
                    Expiry: <span style={{ color: '#C4750C', fontWeight: '600' }}>
                      {new Date(medicine.expiryDate).toLocaleDateString()}
                    </span> • 
                    Stock: {medicine.quantity} units •
                    Price: ₹{medicine.price}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="dashboard-section">
          <h2>💰 Recent Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Total Amount</th>
                <th>Customer</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {sales.slice(0, 5).map((sale) => (
                <tr key={sale._id}>
                  <td><strong>{sale.medicine}</strong></td>
                  <td>{sale.quantity} units</td>
                  <td style={{ color: 'var(--accent-success)', fontWeight: '600' }}>
                    ₹{sale.totalPrice}
                  </td>
                  <td>{sale.customer}</td>
                  <td>{new Date(sale.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;