import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

export default function SalesCustomers() {
  const [sales, setSales] = useState([]);
  const [patients, setPatients] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("sales");

  // Sales form state
  const [salesForm, setSalesForm] = useState({
    medicine: "",
    quantity: "",
    customer: "",
    condition: "" // Added condition field
  });

  // Patient form state
  const [patientForm, setPatientForm] = useState({
    name: "",
    age: "",
    condition: "",
  });

  const [priceDetails, setPriceDetails] = useState({
    unitPrice: 0,
    totalPrice: 0,
    calculated: false
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      setError("");
      const [salesRes, patientsRes, inventoryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/sales`),
        axios.get(`${API_BASE_URL}/patients`),
        axios.get(`${API_BASE_URL}/inventory`)
      ]);
      setSales(salesRes.data);
      setPatients(patientsRes.data);
      setInventory(inventoryRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load data. Please check if backend server is running.");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate price when medicine or quantity changes
  useEffect(() => {
    if (salesForm.medicine && salesForm.quantity) {
      const selectedMedicine = inventory.find(item => item.name === salesForm.medicine);
      if (selectedMedicine) {
        const unitPrice = selectedMedicine.price;
        const totalPrice = unitPrice * parseInt(salesForm.quantity);
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
  }, [salesForm.medicine, salesForm.quantity, inventory]);

  // Handle Sales Submission
  const handleSalesSubmit = async (e) => {
    e.preventDefault();

    if (!salesForm.medicine || !salesForm.quantity || !salesForm.customer || !salesForm.condition) {
      alert("Please fill all fields for sales");
      return;
    }

    if (parseInt(salesForm.quantity) <= 0) {
      alert("Please enter a valid quantity");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/sales`, salesForm);
      alert(`✅ Sale recorded successfully!\nTotal Amount: ₹${response.data.priceDetails.totalPrice}`);
      setSalesForm({ medicine: "", quantity: "", customer: "", condition: "" });
      setPriceDetails({ unitPrice: 0, totalPrice: 0, calculated: false });
      await fetchData();
    } catch (err) {
      console.error("Sale failed:", err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message.includes("Network Error")) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError("Failed to record sale. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Patient Submission
  const handlePatientSubmit = async (e) => {
    e.preventDefault();

    if (!patientForm.name || !patientForm.age || !patientForm.condition) {
      alert("Please fill all fields for patient");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/patients`, patientForm);
      alert("✅ Patient added successfully!");
      setPatientForm({ name: "", age: "", condition: "" });
      await fetchData();
    } catch (err) {
      console.error("Patient add failed:", err);
      if (err.response && err.response.data.error) {
        setError(err.response.data.error);
      } else if (err.message.includes("Network Error")) {
        setError("Cannot connect to server. Please make sure the backend is running.");
      } else {
        setError("Failed to add patient. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedMedicine = inventory.find(item => item.name === salesForm.medicine);
  const availableQuantity = selectedMedicine ? selectedMedicine.quantity : 0;

  // Common medical conditions for dropdown
  const commonConditions = [
    "Fever",
    "Headache",
    "Cold & Cough",
    "Body Pain",
    "Allergy",
    "Infection",
    "Stomach Pain",
    "Diabetes",
    "Blood Pressure",
    "Arthritis",
    "Asthma",
    "Skin Issue",
    "Eye Problem",
    "Dental Issue",
    "Other"
  ];

  const testConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/test`);
      alert(`✅ Backend connection successful!\n${response.data.message}`);
    } catch (error) {
      alert("❌ Cannot connect to backend server.");
    }
  };

  // Calculate statistics
  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  const totalPatients = patients.length;
  const totalSales = sales.length;

  return (
    <div className="page">
      <h1><span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>💰</span> Transactions & Customers</h1>

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
            background: '#10b981',
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

      {/* Quick Stats */}
      <div className="cards-container">
        <div className="card success">
          <h3>Total Revenue</h3>
          <p>₹{totalRevenue.toFixed(2)}</p>
          <small>All transactions</small>
        </div>
        <div className="card primary">
          <h3>Total Sales</h3>
          <p>{totalSales}</p>
          <small>Completed transactions</small>
        </div>
        <div className="card info">
          <h3>Total Customers</h3>
          <p>{totalPatients}</p>
          <small>Registered patients</small>
        </div>
        <div className="card warning">
          <h3>Available Medicines</h3>
          <p>{inventory.filter(item => item.quantity > 0).length}</p>
          <small>In stock items</small>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-section">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab("sales")}
            style={{
              padding: '1rem 2rem',
              background: activeTab === "sales" ? '#3b82f6' : 'transparent',
              color: activeTab === "sales" ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === "sales" ? '3px solid #3b82f6' : 'none'
            }}
          >
            💰 Record Sales
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            style={{
              padding: '1rem 2rem',
              background: activeTab === "customers" ? '#10b981' : 'transparent',
              color: activeTab === "customers" ? 'white' : '#64748b',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontWeight: '600',
              borderBottom: activeTab === "customers" ? '3px solid #10b981' : 'none'
            }}
          >
            👥 Manage Customers
          </button>
        </div>

        {/* Sales Tab */}
        {activeTab === "sales" && (
          <div>
            <h2>🛒 Record New Sale</h2>
            <form className="form" onSubmit={handleSalesSubmit}>
              <div className="form-group">
                <label>Select Medicine</label>
                <select
                  value={salesForm.medicine}
                  onChange={(e) => setSalesForm({ ...salesForm, medicine: e.target.value, quantity: "" })}
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
                    <div><strong>Medicine:</strong> {selectedMedicine.name}</div>
                    <div><strong>Available:</strong> {selectedMedicine.quantity} units</div>
                    <div><strong>Price:</strong> ₹{selectedMedicine.price}/unit</div>
                    <div><strong>Expiry:</strong> {new Date(selectedMedicine.expiryDate).toLocaleDateString()}</div>
                  </div>
                </div>
              )}

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  placeholder="Enter quantity to sell"
                  value={salesForm.quantity}
                  onChange={(e) => setSalesForm({ ...salesForm, quantity: e.target.value })}
                  min="1"
                  max={availableQuantity}
                  required
                  disabled={!salesForm.medicine}
                />
                {salesForm.medicine && (
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
                    <div><strong>Unit Price:</strong> ₹{priceDetails.unitPrice}</div>
                    <div><strong>Quantity:</strong> {salesForm.quantity}</div>
                    <div>
                      <strong>Total Amount:</strong>
                      <span style={{
                        fontSize: '1.4rem',
                        fontWeight: 'bold',
                        color: '#166534',
                        marginLeft: '0.5rem'
                      }}>
                        ₹{priceDetails.totalPrice.toFixed(2)}
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
                  value={salesForm.customer}
                  onChange={(e) => setSalesForm({ ...salesForm, customer: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Medical Condition</label>
                <select
                  value={salesForm.condition}
                  onChange={(e) => setSalesForm({ ...salesForm, condition: e.target.value })}
                  required
                >
                  <option value="">-- Select Medical Condition --</option>
                  {commonConditions.map((condition, index) => (
                    <option key={index} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
                <small>Select the medical condition this medicine is for</small>
              </div>

              <button
                type="submit"
                disabled={loading || !salesForm.medicine || availableQuantity === 0 || parseInt(salesForm.quantity) <= 0}
                className={loading ? 'loading' : ''}
                style={{
                  background: priceDetails.calculated ?
                    'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' :
                    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                }}
              >
                {loading ? "Processing Sale..." : `Record Sale ${priceDetails.calculated ? `- ₹${priceDetails.totalPrice.toFixed(2)}` : ''}`}
              </button>
            </form>

            {/* Sales History */}
            <div style={{ marginTop: '3rem' }}>
              <h3>📊 Sales History</h3>
              {sales.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                  No sales recorded yet.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Medicine</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total Amount</th>
                      <th>Customer</th>
                      <th>Condition</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale._id}>
                        <td><strong>{sale.medicine}</strong></td>
                        <td>{sale.quantity} units</td>
                        <td>₹{sale.unitPrice}</td>
                        <td style={{ color: 'var(--accent-success)', fontWeight: '600' }}>
                          ₹{sale.totalPrice.toFixed(2)}
                        </td>
                        <td>{sale.customer}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {sale.condition || 'Not specified'}
                          </span>
                        </td>
                        <td>{new Date(sale.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Sales by Condition Summary */}
            {sales.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3>🏥 Sales by Medical Condition</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {Object.entries(
                    sales.reduce((acc, sale) => {
                      const condition = sale.condition || 'Not specified';
                      acc[condition] = (acc[condition] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([condition, count]) => (
                    <div key={condition} style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '0.5rem' }}>
                        {condition}
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#3b82f6' }}>
                        {count}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        sales
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === "customers" && (
          <div>
            <h2>👥 Add New Customer</h2>
            <form className="form" onSubmit={handlePatientSubmit}>
              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={patientForm.name}
                  onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  placeholder="Enter age"
                  value={patientForm.age}
                  onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                  min="1"
                  max="120"
                  required
                />
              </div>

              <div className="form-group">
                <label>Medical Condition</label>
                <select
                  value={patientForm.condition}
                  onChange={(e) => setPatientForm({ ...patientForm, condition: e.target.value })}
                  required
                >
                  <option value="">-- Select Medical Condition --</option>
                  {commonConditions.map((condition, index) => (
                    <option key={index} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={loading ? 'loading' : ''}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                }}
              >
                {loading ? "Adding Customer..." : "Add Customer"}
              </button>
            </form>

            {/* Customers List */}
            <div style={{ marginTop: '3rem' }}>
              <h3>📋 Customer List</h3>
              {patients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-tertiary)' }}>
                  No customers registered yet.
                </div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Age</th>
                      <th>Medical Condition</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((patient) => (
                      <tr key={patient._id}>
                        <td><strong>{patient.name}</strong></td>
                        <td>{patient.age} years</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: '500'
                          }}>
                            {patient.condition}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Customers by Condition Summary */}
            {patients.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <h3>📈 Customers by Medical Condition</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '1rem',
                  marginTop: '1rem'
                }}>
                  {Object.entries(
                    patients.reduce((acc, patient) => {
                      const condition = patient.condition;
                      acc[condition] = (acc[condition] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([condition, count]) => (
                    <div key={condition} style={{
                      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                      padding: '1.5rem',
                      borderRadius: '8px',
                      border: '1px solid #a7f3d0',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '0.9rem', color: '#065f46', marginBottom: '0.5rem' }}>
                        {condition}
                      </div>
                      <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#059669' }}>
                        {count}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#047857' }}>
                        customers
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}