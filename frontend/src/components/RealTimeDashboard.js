import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import API_BASE_URL from "../config/api";

const RealTimeDashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    dailyRevenue: 0,
    totalSales: 0,
    outOfStock: 0,
    lowStock: 0
  });
  const [chartData, setChartData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [stockDistribution, setStockDistribution] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Fetch data and update in real-time
  const fetchRealTimeData = async () => {
    try {
      const [invRes, salesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/inventory`),
        axios.get(`${API_BASE_URL}/sales`)
      ]);

      const inventoryData = invRes.data;
      const salesData = salesRes.data;

      setInventory(inventoryData);
      setSales(salesData);
      setLastUpdate(new Date());

      // Calculate metrics
      const totalRev = salesData.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      const todaySales = salesData.filter(s => {
        const saleDate = new Date(s.saleDate || s.date);
        const today = new Date();
        return saleDate.toDateString() === today.toDateString();
      });
      const dailyRev = todaySales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      const outOfStockCount = inventoryData.filter(i => i.quantity === 0).length;
      const lowStockCount = inventoryData.filter(i => i.quantity > 0 && i.quantity < 10).length;

      setMetrics({
        totalRevenue: totalRev,
        dailyRevenue: dailyRev,
        totalSales: salesData.length,
        outOfStock: outOfStockCount,
        lowStock: lowStockCount
      });

      // Generate alerts
      const newAlerts = [];
      if (outOfStockCount > 0) {
        newAlerts.push({ type: 'critical', message: `${outOfStockCount} medicines out of stock`, icon: '🔴' });
      }
      if (lowStockCount > 0) {
        newAlerts.push({ type: 'warning', message: `${lowStockCount} medicines have low stock`, icon: '⚠️' });
      }
      if (dailyRev > totalRev * 0.1) {
        newAlerts.push({ type: 'success', message: `Today's sales exceeding target! ₹${dailyRev.toFixed(0)}`, icon: '✅' });
      }
      setAlerts(newAlerts);

      // Generate chart data - last 7 days of sales
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString();
        const daySales = salesData.filter(s => {
          const saleDate = new Date(s.saleDate || s.date);
          return saleDate.toDateString() === date.toDateString();
        });
        last7Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue: daySales.reduce((sum, s) => sum + (s.totalPrice || 0), 0),
          sales: daySales.length,
          fullDate: dateStr
        });
      }
      setChartData(last7Days);

      // Generate revenue data by category
      const categoryRevenue = {};
      salesData.forEach(sale => {
        const cat = sale.category || 'Others';
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (sale.totalPrice || 0);
      });
      const revData = Object.entries(categoryRevenue).map(([name, value]) => ({ name, value: Math.round(value) }));
      setRevenueData(revData.slice(0, 5));

      // Stock distribution
      const inStock = inventoryData.filter(i => i.quantity >= 10).length;
      const critical = inventoryData.filter(i => i.quantity > 0 && i.quantity < 5).length;
      const stockDist = [
        { name: 'In Stock', value: inStock, color: '#52B788' },
        { name: 'Low Stock', value: lowStockCount - critical, color: '#FFB703' },
        { name: 'Critical', value: critical, color: '#E63946' },
        { name: 'Out of Stock', value: outOfStockCount, color: '#909BAB' }
      ];
      setStockDistribution(stockDist);

    } catch (err) {
      console.error("Error fetching real-time data:", err);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
    // Auto-refresh every 10 seconds for real-time updates
    const interval = setInterval(fetchRealTimeData, 10000);
    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#52B788', '#8B5CF6', '#FFB703', '#E63946'];

  return (
    <div className="page realtime-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1><span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>🚀</span> Real-Time Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.9rem', color: '#909BAB' }}>
            Last updated: {lastUpdate.toLocaleTimeString()}
          </span>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#52B788',
            animation: 'pulse 2s infinite'
          }}></div>
        </div>
      </div>

      {/* Live Alerts */}
      {alerts.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {alerts.map((alert, idx) => (
            <div key={idx} style={{
              padding: '1rem',
              borderRadius: '8px',
              background: alert.type === 'critical' ? '#FFE5E5' : alert.type === 'warning' ? '#FFF4E5' : '#E5F5F0',
              border: `2px solid ${alert.type === 'critical' ? '#E63946' : alert.type === 'warning' ? '#FFB703' : '#52B788'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>{alert.icon}</span>
              <span style={{ color: alert.type === 'critical' ? '#8B2C2C' : alert.type === 'warning' ? '#7A5D1F' : '#1B4D3A' }}>
                {alert.message}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="kpi-card" style={{ background: 'linear-gradient(135deg, #457B9D 0%, #6BA3D0 100%)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>Total Revenue</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: '0.8rem' }}>₹{metrics.totalRevenue.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>All-time sales</div>
          </div>
        </div>

        <div className="kpi-card" style={{ background: 'linear-gradient(135deg, #52B788 0%, #74C69D 100%)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>Today's Sales</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: '0.8rem' }}>₹{metrics.dailyRevenue.toFixed(2)}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Current day</div>
          </div>
        </div>

        <div className="kpi-card" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>Transactions</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: '0.8rem' }}>{metrics.totalSales}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Total orders</div>
          </div>
        </div>

        <div className="kpi-card" style={{ background: 'linear-gradient(135deg, #FF6B9D 0%, #FFB703 100%)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>Low Stock</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 'bold', marginTop: '0.8rem' }}>{metrics.lowStock}</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>Items alert</div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        {/* Sales Trend Chart */}
        <div style={{
          background: '#FFFFFF',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--neutral-border)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📈 7-Day Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6BA3D0" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#6BA3D0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#FFFFFF', color: '#2D3436' }} />
              <Area type="monotone" dataKey="revenue" stroke="#6BA3D0" fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Distribution Pie Chart */}
        <div style={{
          background: '#FFFFFF',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--neutral-border)'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📊 Stock Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stockDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#52B788"
                dataKey="value"
              >
                {stockDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Category */}
      {revenueData.length > 0 && (
        <div style={{
          background: '#FFFFFF',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--neutral-border)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>💰 Revenue Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="name" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#FFFFFF', color: '#2D3436' }} />
              <Bar dataKey="value" fill="#6BA3D0" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Sales Count Chart */}
      <div style={{
        background: '#FFFFFF',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--neutral-border)'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📊 Daily Sales Count</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
            <XAxis dataKey="date" stroke="var(--text-tertiary)" />
            <YAxis stroke="var(--text-tertiary)" />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#FFFFFF', color: '#2D3436' }} />
            <Bar dataKey="sales" fill="#52B788" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .realtime-dashboard .kpi-card {
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .realtime-dashboard .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }
      `}</style>
    </div>
  );
};

export default RealTimeDashboard;
