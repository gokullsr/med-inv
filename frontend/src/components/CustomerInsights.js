import React, { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import API_BASE_URL from "../config/api";

const CustomerInsights = () => {
  const [sales, setSales] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [purchasePatterns, setPurchasePatterns] = useState([]);
  const [customerMetrics, setCustomerMetrics] = useState({
    totalCustomers: 0,
    avgOrderValue: 0,
    repeatingCustomers: 0,
    customerRetention: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/sales`);
        setSales(res.data);
        analyzeCustomerData(res.data);
      } catch (err) {
        console.error("Error fetching sales:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const analyzeCustomerData = (salesData) => {
    // Aggregate sales by customer
    const customerAgg = {};
    const customerDates = {};

    salesData.forEach(sale => {
      const customer = sale.customer || sale.customerName || "Walk-in";
      if (!customerAgg[customer]) {
        customerAgg[customer] = {
          name: customer,
          totalSpent: 0,
          totalOrders: 0,
          medicines: []
        };
        customerDates[customer] = [];
      }
      customerAgg[customer].totalSpent += sale.totalPrice || 0;
      customerAgg[customer].totalOrders += 1;
      customerAgg[customer].medicines.push(sale.medicineName || sale.medicine);
      customerDates[customer].push(new Date(sale.saleDate || sale.date));
    });

    // Calculate metrics
    const totalCustomers = Object.keys(customerAgg).length;
    const avgOrderValue = salesData.length > 0 ? salesData.reduce((sum, s) => sum + (s.totalPrice || 0), 0) / totalCustomers : 0;
    const repeatingCustomers = Object.values(customerAgg).filter(c => c.totalOrders > 1).length;
    const customerRetention = totalCustomers > 0 ? (repeatingCustomers / totalCustomers * 100).toFixed(1) : 0;

    setCustomerMetrics({
      totalCustomers,
      avgOrderValue: avgOrderValue.toFixed(2),
      repeatingCustomers,
      customerRetention
    });

    // Top customers by spending
    const topCusts = Object.values(customerAgg)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10);
    setTopCustomers(topCusts);

    // Purchase frequency by day of week
    const dayOfWeekData = {};
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    salesData.forEach(sale => {
      const date = new Date(sale.saleDate || sale.date);
      const dayName = daysOfWeek[date.getDay()];
      if (!dayOfWeekData[dayName]) {
        dayOfWeekData[dayName] = { day: dayName, purchases: 0, revenue: 0 };
      }
      dayOfWeekData[dayName].purchases += 1;
      dayOfWeekData[dayName].revenue += sale.totalPrice || 0;
    });

    const patterns = daysOfWeek.map(day => dayOfWeekData[day] || { day, purchases: 0, revenue: 0 });
    setPurchasePatterns(patterns);

    setCustomerData(topCusts.map(c => ({
      name: c.name,
      spent: c.totalSpent,
      orders: c.totalOrders
    })));
  };

  return (
    <div className="page">
      <h1><span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>👥</span> Customer Insights</h1>

      {/* Customer Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #457B9D 0%, #6BA3D0 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>Total Customers</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.8rem' }}>
            {customerMetrics.totalCustomers}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #52B788 0%, #74C69D 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>Avg Order Value</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.8rem' }}>
            ₹{customerMetrics.avgOrderValue}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>Returning Customers</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.8rem' }}>
            {customerMetrics.repeatingCustomers}
          </div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB703 100%)',
          padding: '1.5rem',
          borderRadius: '12px',
          color: 'white',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, fontWeight: 500 }}>Retention Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.8rem' }}>
            {customerMetrics.customerRetention}%
          </div>
        </div>
      </div>

      {/* Top Customers */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--neutral-border)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>🏆 Top Customers</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={customerData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis type="number" stroke="var(--text-tertiary)" />
            <YAxis dataKey="name" type="category" width={100} stroke="var(--text-tertiary)" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
            <Legend />
            <Bar dataKey="spent" fill="#2a5298" name="Amount (₹)" radius={[0, 8, 8, 0]} />
            <Bar dataKey="orders" fill="#34a853" name="Orders" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Purchase Patterns */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--neutral-border)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📅 Weekly Purchase Patterns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={purchasePatterns}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
            <XAxis dataKey="month" stroke="var(--text-tertiary)" />
            <YAxis yAxisId="left" stroke="var(--text-tertiary)" />
            <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#FFFFFF', color: '#2D3436' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="purchases" stroke="#6BA3D0" strokeWidth={2} name="Purchases" dot={{ fill: '#6BA3D0' }} />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#52B788" strokeWidth={2} name="Revenue (₹)" dot={{ fill: '#52B788' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Customer Details Table */}
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--neutral-border)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📊 Customer Details</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#F8FAFB', borderBottom: '2px solid var(--neutral-border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Rank</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Customer Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Orders</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Total Spent</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>Avg Order</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--neutral-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold', color: '#6BA3D0' }}>#{idx + 1}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                    <strong>{customer.name}</strong>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.totalOrders}</td>
                  <td style={{ padding: '1rem', color: '#52B788', fontWeight: '600' }}>
                    ₹{customer.totalSpent.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    ₹{(customer.totalSpent / customer.totalOrders).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerInsights;
