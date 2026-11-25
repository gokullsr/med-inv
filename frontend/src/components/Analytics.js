import React, { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";

const Analytics = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/inventory`),
          axios.get(`${API_BASE_URL}/sales`)
        ]);
        setInventory(invRes.data);
        setSales(salesRes.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="page"><h3>📊 Loading Analytics...</h3></div>;

  // Category-wise analysis
  const categoryStats = {};
  inventory.forEach(item => {
    const category = item.category || "Uncategorized";
    if (!categoryStats[category]) {
      categoryStats[category] = { count: 0, value: 0, quantity: 0 };
    }
    categoryStats[category].count += 1;
    categoryStats[category].value += item.price * item.quantity;
    categoryStats[category].quantity += item.quantity;
  });

  // Top selling medicines
  const medicineSales = {};
  sales.forEach(sale => {
    const medicineName = sale.medicineName || "Unknown";
    if (!medicineSales[medicineName]) {
      medicineSales[medicineName] = { quantity: 0, revenue: 0 };
    }
    medicineSales[medicineName].quantity += sale.quantity || 1;
    medicineSales[medicineName].revenue += sale.totalPrice || 0;
  });

  const topMedicines = Object.entries(medicineSales)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  // Monthly trends
  const monthlySales = {};
  sales.forEach(sale => {
    const date = new Date(sale.saleDate || new Date());
    const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!monthlySales[month]) {
      monthlySales[month] = { count: 0, revenue: 0 };
    }
    monthlySales[month].count += 1;
    monthlySales[month].revenue += sale.totalPrice || 0;
  });

  return (
    <div className="page">
      <h1><span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>📊</span> Analytics & Reports</h1>

      {/* Category Analysis */}
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>📂 Medicine Categories</h3>
          <div className="category-list">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="category-item">
                <div className="category-header">
                  <strong>{category}</strong>
                  <span className="badge">{stats.count}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${(stats.quantity / inventory.reduce((sum, i) => sum + i.quantity, 0)) * 100}%` }}
                  ></div>
                </div>
                <div className="category-stats">
                  <span>Qty: {stats.quantity}</span>
                  <span>₹{stats.value.toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Medicines */}
        <div className="analytics-card">
          <h3>🏆 Top Selling Medicines</h3>
          <div className="top-medicines">
            {topMedicines.map((med, idx) => (
              <div key={idx} className="medicine-rank">
                <div className="rank-badge">{idx + 1}</div>
                <div className="medicine-details">
                  <strong>{med[0]}</strong>
                  <p>{med[1].quantity} units | ₹{med[1].revenue.toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="analytics-card">
          <h3>📈 Key Metrics</h3>
          <div className="quick-stats">
            <div className="stat-item">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{inventory.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Transactions</span>
              <span className="stat-value">{sales.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">₹{sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0).toFixed(0)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Inventory Value</span>
              <span className="stat-value">₹{inventory.reduce((sum, i) => sum + (i.price * i.quantity), 0).toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Monthly Trends */}
        <div className="analytics-card">
          <h3>📅 Monthly Activity</h3>
          <div className="monthly-list">
            {Object.entries(monthlySales).map(([month, data]) => (
              <div key={month} className="monthly-item">
                <span className="month-name">{month}</span>
                <span className="month-data">{data.count} sales | ₹{data.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
