import React, { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function AddMedicine() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    manufacturer: "",
    price: "",
    quantity: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    
    if (!form.name || !form.price || !form.quantity || !form.expiryDate) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (parseFloat(form.price) <= 0) {
      setError("Price must be greater than 0");
      setLoading(false);
      return;
    }

    if (parseInt(form.quantity) < 0) {
      setError("Quantity cannot be negative");
      setLoading(false);
      return;
    }

   
    const medicineData = {
      name: form.name.trim(),
      category: form.category.trim() || "General",
      manufacturer: form.manufacturer.trim() || "Unknown",
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      expiryDate: new Date(form.expiryDate).toISOString()
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/inventory`, medicineData);
      
      alert("✅ Medicine added successfully!");
      setForm({
        name: "",
        category: "",
        manufacturer: "",
        price: "",
        quantity: "",
        expiryDate: "",
      });
    } catch (error) {
      console.error("Error adding medicine:", error);
      
      if (error.response) {
        setError(`Server error: ${error.response.data.error || error.response.data.message || 'Unknown error'}`);
      } else if (error.request) {
        setError("Cannot connect to server. Please make sure the backend is running on port 5000.");
      } else {
        setError(`Error: ${error.message}`);
      }
      
      alert("❌ Failed to add medicine. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`✅ Backend connection successful!\n${response.data.message}`);
    } catch (error) {
      alert("❌ Cannot connect to backend server. Please make sure it's running on port 5000.");
    }
  };

  return (
    <div className="page">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ color: "#7C3AED", fontSize: "36px" }}>➕</span> Add Medicine
      </h1>

      {/* Connection Test Button */}
      <div style={{ marginBottom: '1rem' }}>
        <button 
          onClick={testConnection}
          type="button"
          style={{
            padding: '0.5rem 1rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.9rem'
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

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Medicine Name *</label>
          <input
            type="text"
            placeholder="Enter medicine name (e.g., Paracetamol 500mg)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            placeholder="Category (e.g., Tablet, Syrup, Capsule)"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Manufacturer</label>
          <input
            type="text"
            placeholder="Manufacturer (e.g., Cipla Ltd., Sun Pharma)"
            value={form.manufacturer}
            onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Price (₹) *</label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Enter price per unit"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Quantity *</label>
          <input
            type="number"
            min="0"
            placeholder="Enter quantity in stock"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Expiry Date *</label>
          <input
            type="date"
            value={form.expiryDate}
            onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Adding Medicine..." : "Add Medicine"}
        </button>
      </form>
    </div>
  );
}