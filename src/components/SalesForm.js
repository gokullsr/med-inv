import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function SalesForm() {
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    medicine: "",
    quantity: "",
    customer: "",
  });
  const [priceDetails, setPriceDetails] = useState({
    unitPrice: 0,
    totalPrice: 0,
    calculated: false
  });

  const fetchSales = async () => {
    try {
      setError("");
      const res = await axios.get(`${API_BASE_URL}/sales`);
      setSales(res.data);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("Failed to load sales history. Please check if backend server is running.");
    }
  };

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/inventory`);
      setInventory(res.data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory. Please check if backend server is running.");
    }
  };

  useEffect(() => {
    fetchSales();
    fetchInventory();
  }, []);

  // Calculate price when medicine or quantity changes
  useEffect(() => {
    if (form.medicine && form.quantity) {
      const selectedMedicine = inventory.find(item => item.name === form.medicine);
      if (selectedMedicine) {
        const unitPrice = selectedMedicine.price;
        const totalPrice = unitPrice * parseInt(form.quantity);
        setPriceDetails({
          unitPrice,
          totalPrice,
          calculated: true
        });
      }
    } else {
      setPriceDetails({
        unitPrice: 0,
        totalPrice: 0,
        calculated: false
      });
    }
  }, [form.medicine, form.quantity, inventory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.medicine || !form.quantity || !form.customer) {
      alert("Please fill all fields");
      return;
    }

    if (parseInt(form.quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${API_BASE_URL}/sales`, form);
      alert(`✅ Sale recorded successfully!\nTotal Amount: ₹${response.data.priceDetails.totalPrice}`);
      setForm({ medicine: "", quantity: "", customer: "" });
      setPriceDetails({ unitPrice: 0, totalPrice: 0, calculated: false });
      await Promise.all([fetchSales(), fetchInventory()]);
    } catch (err) {
      console.error("Sale failed:", err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message.includes("Network Error")) {
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError("Failed to record sale. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedMedicine = inventory.find(item => item.name === form.medicine);
  const availableQuantity = selectedMedicine ? selectedMedicine.quantity : 0;

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`Backend connection successful: ${response.data.message}`);
    } catch (err) {
      alert("Backend connection failed. Please make sure the backend server is running.");
    }
  };

  return (
    <div className="page">
      <h1>💰 Sales Management</h1>
      
      {/* Connection Test Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testBackendConnection}
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

      {/* Sales Form */}
      <div className="dashboard-section">
        <h2>🛒 Record New Sale</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Select Medicine</label>
            <select
              value={form.medicine}
              onChange={(e) => setForm({ ...form, medicine: e.target.value, quantity: "" })}
              required
            >
              <option value="">-- Select Medicine --</option>
              {inventory
                .filter(item => item.quantity > 0)
                .map((item) => (
                  <option key={item._id} value={item.name}>
                    {item.name} • Stock: {item.quantity} • ₹{item.price}/unit
                  </option>
                ))}
            </select>
          </div>

          {selectedMedicine && (
            <div className="medicine-info">
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem',
                alignItems: 'center'
              }}>
                <div>
                  <strong>Medicine:</strong> {selectedMedicine.name}
                </div>
                <div>
                  <strong>Available Stock:</strong> {selectedMedicine.quantity} units
                </div>
                <div>
                  <strong>Unit Price:</strong> ₹{selectedMedicine.price}
                </div>
                <div>
                  <strong>Expiry:</strong> {new Date(selectedMedicine.expiryDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              placeholder="Enter quantity to sell"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              min="1"
              max={availableQuantity}
              required
              disabled={!form.medicine}
            />
            {form.medicine && (
              <small>Maximum available: {availableQuantity} units</small>
            )}
          </div>

          {/* Price Calculation Display */}
          {priceDetails.calculated && (
            <div style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: '2px solid #22c55e',
              borderRadius: '8px',
              padding: '1.5rem',
              margin: '1rem 0',
              borderLeft: '4px solid #22c55e'
            }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💰 Price Calculation
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                fontSize: '1.1rem'
              }}>
                <div>
                  <strong>Unit Price:</strong> ₹{priceDetails.unitPrice}
                </div>
                <div>
                  <strong>Quantity:</strong> {form.quantity}
                </div>
                <div>
                  <strong>Total Amount:</strong> 
                  <span style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: 'bold', 
                    color: '#166534',
                    marginLeft: '0.5rem'
                  }}>
                    ₹{priceDetails.totalPrice}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div className="form-group">
            <label>Customer Name</label>
            <input
              type="text"
              placeholder="Enter customer name"
              value={form.customer}
              onChange={(e) => setForm({ ...form, customer: e.target.value })}
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !form.medicine || availableQuantity === 0 || parseInt(form.quantity) <= 0}
            className={loading ? 'loading' : ''}
            style={{
              background: priceDetails.calculated ? 
                'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 
                'linear-gradient(135deg, var(--secondary-main) 0%, var(--secondary-dark) 100%)'
            }}
          >
            {loading ? "Processing Sale..." : `Record Sale ${priceDetails.calculated ? `- ₹${priceDetails.totalPrice}` : ''}`}
          </button>
        </form>
      </div>

      {/* Current Inventory Status */}
      <div className="dashboard-section">
        <h2>📦 Available Medicines</h2>
        {inventory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
            No medicines available in inventory. Please add medicines first.
          </div>
        ) : (
          <div className="inventory-grid">
            {inventory.map((item) => (
              <div key={item._id} className={`inventory-card ${item.quantity < 5 ? 'critical' : item.quantity < 10 ? 'low-stock' : ''}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h4>{item.name}</h4>
                  <span className={`status-indicator ${item.quantity === 0 ? 'status-neutral' : item.quantity < 5 ? 'status-critical' : item.quantity < 10 ? 'status-warning' : 'status-good'}`}>
                    {item.quantity === 0 ? 'Out of Stock' : item.quantity < 5 ? 'Critical' : item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Stock</div>
                    <div className="quantity">{item.quantity} units</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', marginBottom: '0.25rem' }}>Price</div>
                    <div className="price">₹{item.price}/unit</div>
                  </div>
                </div>
                
                <small>Expires: {new Date(item.expiryDate).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sales History */}
      <div className="dashboard-section">
        <h2>📊 Sales History</h2>
        {sales.length > 0 && (
  <div style={{
    marginTop: '2rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    borderRadius: '8px',
    border: '1px solid var(--neutral-border)'
  }}>
    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--primary-dark)' }}>Sales Summary</h4>
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      textAlign: 'center'
    }}>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Total Sales</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-main)' }}>
          {sales.length}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Total Quantity Sold</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-info)' }}>
          {sales.reduce((sum, sale) => sum + sale.quantity, 0)} units
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Total Revenue</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-success)' }}>
          ₹{sales.reduce((sum, sale) => sum + sale.totalPrice, 0)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Average Sale</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-warning)' }}>
          ₹{sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.totalPrice, 0) / sales.length).toFixed(2) : '0'}
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}