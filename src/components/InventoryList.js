import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

function InventoryList() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error("Error loading inventory:", err);
      setError("Failed to load inventory. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`✅ Backend connection successful!\n${response.data.message}`);
      fetchInventory();
    } catch (error) {
      alert("❌ Cannot connect to backend server.");
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
          <h3>Loading Inventory...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>📦 Inventory List</h1>

      {/* Connection Test Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testConnection}
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Test Backend Connection
        </button>
        <button 
          onClick={fetchInventory}
          style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginLeft: '0.5rem'
          }}
        >
          Refresh
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #ef4444',
          color: '#dc2626',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {inventory.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '3rem',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '2px dashed #cbd5e1'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
          <h2 style={{ color: '#64748b', marginBottom: '0.5rem' }}>No Medicines in Inventory</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>
            Your inventory is empty. Add some medicines to get started.
          </p>
          <button 
            onClick={() => window.location.href = '/add-medicine'}
            style={{
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: '600'
            }}
          >
            ➕ Add First Medicine
          </button>
        </div>
      ) : (
        <>
          <div style={{ 
            marginBottom: '1rem', 
            padding: '1rem', 
            background: '#f0fdf9', 
            borderRadius: '8px',
            border: '1px solid #a7f3d0'
          }}>
            <strong>Total Items:</strong> {inventory.length} medicines in inventory
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Medicine Name</th>
                <th>Category</th>
                <th>Manufacturer</th>
                <th>Price (₹)</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item._id}>
                  <td>
                    <strong>{item.name}</strong>
                    {item.quantity < 10 && (
                      <span style={{ 
                        marginLeft: '0.5rem',
                        padding: '0.2rem 0.5rem',
                        background: item.quantity < 5 ? '#fee2e2' : '#fef3c7',
                        color: item.quantity < 5 ? '#dc2626' : '#92400e',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: '600'
                      }}>
                        {item.quantity < 5 ? 'LOW' : 'LOW STOCK'}
                      </span>
                    )}
                  </td>
                  <td>{item.category || 'General'}</td>
                  <td>{item.manufacturer || 'Unknown'}</td>
                  <td>₹{item.price}</td>
                  <td>
                    <span style={{ 
                      color: item.quantity === 0 ? '#ef4444' : 
                             item.quantity < 5 ? '#f59e0b' : 
                             item.quantity < 10 ? '#f59e0b' : '#10b981',
                      fontWeight: '600'
                    }}>
                      {item.quantity} units
                    </span>
                  </td>
                  <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// ✅ ONLY ONE EXPORT DEFAULT STATEMENT
export default InventoryList;