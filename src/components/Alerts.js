import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import './Alerts.css';

const Alerts = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [criticalStockItems, setCriticalStockItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/alerts/check-low-stock`);
      setLowStockItems(response.data.lowStock);
      setCriticalStockItems(response.data.criticalStock);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendManualAlert = async () => {
    try {
      await axios.post(`${API_BASE_URL}/alerts/send-manual-alert`, {
        message: 'Manual stock check requested by admin'
      });
      alert('Alert sent to admin successfully!');
    } catch (error) {
      alert('Failed to send alert');
    }
  };

  useEffect(() => {
    fetchAlerts();
    // Check every 30 minutes
    const interval = setInterval(fetchAlerts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page">
      <div className="alerts-header">
        <h1>🚨 Stock Alerts</h1>
        <button 
          className="btn-modern warning" 
          onClick={sendManualAlert}
          disabled={loading}
        >
          📱 Send Immediate Alert
        </button>
      </div>

      {/* Critical Stock Section */}
      {criticalStockItems.length > 0 && (
        <div className="alert-section critical">
          <h2>❌ Critical Stock - Out of Stock</h2>
          <div className="alerts-grid">
            {criticalStockItems.map(item => (
              <div key={item._id} className="alert-card critical">
                <h3>{item.name}</h3>
                <div className="alert-details">
                  <p><strong>Quantity:</strong> <span className="stock-critical">{item.quantity} units</span></p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Manufacturer:</strong> {item.manufacturer}</p>
                </div>
                <div className="alert-actions">
                  <button className="btn-modern error">Urgent Restock Needed</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low Stock Section */}
      {lowStockItems.length > 0 && (
        <div className="alert-section warning">
          <h2>⚠️ Low Stock Alert</h2>
          <div className="alerts-grid">
            {lowStockItems.map(item => (
              <div key={item._id} className="alert-card warning">
                <h3>{item.name}</h3>
                <div className="alert-details">
                  <p><strong>Quantity:</strong> <span className="stock-warning">{item.quantity} units</span></p>
                  <p><strong>Category:</strong> {item.category}</p>
                  <p><strong>Price:</strong> ₹{item.price}</p>
                  <p><strong>Expiry:</strong> {new Date(item.expiryDate).toLocaleDateString()}</p>
                </div>
                <div className="alert-actions">
                  <button className="btn-modern warning">Reorder Soon</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Alerts */}
      {lowStockItems.length === 0 && criticalStockItems.length === 0 && (
        <div className="no-alerts">
          <div className="success-message">
            <h3>✅ All Stock Levels Normal</h3>
            <p>No low stock items found. Inventory levels are healthy.</p>
          </div>
        </div>
      )}

      {/* Alert Statistics */}
      <div className="alert-stats">
        <div className="stat-card">
          <h4>Critical Items</h4>
          <p className="stat-number critical">{criticalStockItems.length}</p>
        </div>
        <div className="stat-card">
          <h4>Low Stock Items</h4>
          <p className="stat-number warning">{lowStockItems.length}</p>
        </div>
        <div className="stat-card">
          <h4>Last Check</h4>
          <p className="stat-number">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Alerts;