import React, { useEffect, useState } from "react";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Bar } from "recharts";
import API_BASE_URL from "../config/api";

const StockForecast = () => {
  const [inventory, setInventory] = useState([]);
  const [sales, setSales] = useState([]);
  const [forecast, setForecast] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/inventory`),
          axios.get(`${API_BASE_URL}/sales`)
        ]);

        setInventory(invRes.data);
        setSales(salesRes.data);
        generateForecast(invRes.data, salesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const generateForecast = (invData, salesData) => {
    // Calculate average daily sales for each medicine
    const medicineSales = {};
    salesData.forEach(sale => {
      const med = sale.medicineName || sale.medicine;
      if (!medicineSales[med]) {
        medicineSales[med] = [];
      }
      medicineSales[med].push(sale.quantity || 1);
    });

    // Calculate average daily consumption
    const avgConsumption = {};
    Object.keys(medicineSales).forEach(med => {
      const quantities = medicineSales[med];
      const avg = quantities.reduce((a, b) => a + b, 0) / Math.max(quantities.length, 1);
      avgConsumption[med] = avg;
    });

    // Generate 30-day forecast
    const forecastData = [];
    const newAlerts = [];

    invData.forEach(item => {
      const dailyUsage = avgConsumption[item.name] || 0;
      let currentStock = item.quantity;

      for (let day = 0; day <= 30; day++) {
        const forecastDate = new Date();
        forecastDate.setDate(forecastDate.getDate() + day);

        if (day === 0) {
          forecastData.push({
            date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            [item.name]: currentStock,
            actual: true
          });
        } else {
          currentStock = Math.max(0, currentStock - dailyUsage);
          forecastData.push({
            date: forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            [item.name]: Math.round(currentStock * 100) / 100
          });
        }

        // Alert if will run out within 7 days
        if (day === 7 && currentStock <= 0) {
          newAlerts.push({
            medicine: item.name,
            daysLeft: 'Within 7 days',
            action: '⚠️ Reorder immediately',
            priority: 'high',
            icon: '🔴'
          });
        } else if (day === 14 && currentStock <= item.quantity * 0.3) {
          newAlerts.push({
            medicine: item.name,
            daysLeft: 'Within 14 days',
            action: '📌 Plan reorder',
            priority: 'medium',
            icon: '🟡'
          });
        }
      }
    });

    setForecast(forecastData);
    setAlerts(newAlerts);
  };

  return (
    <div className="page">
      <h1><span style={{ WebkitTextFillColor: "initial", marginRight: "8px" }}>🔮</span> Stock Forecast</h1>

      {/* Forecast Alerts */}
      {alerts.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--neutral-border)'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📢 Reorder Alerts</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {alerts.map((alert, idx) => (
              <div key={idx} style={{
                padding: '1rem',
                border: `2px solid ${alert.priority === 'high' ? '#E63946' : '#FFB703'}`,
                borderRadius: '8px',
                background: alert.priority === 'high' ? '#FFE5E5' : '#FFF4E5'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>{alert.icon}</span>
                  <strong style={{ color: alert.priority === 'high' ? '#8B2C2C' : '#C4750C' }}>
                    {alert.medicine}
                  </strong>
                </div>
                <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  {alert.daysLeft}
                </p>
                <span style={{
                  display: 'inline-block',
                  padding: '0.3rem 0.8rem',
                  background: alert.priority === 'high' ? '#F87171' : '#FBA040',
                  color: alert.priority === 'high' ? '#8B2C2C' : '#C4750C',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: '600'
                }}>
                  {alert.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forecast Chart */}
      {forecast.length > 0 && (
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--neutral-border)',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>📈 30-Day Stock Forecast</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={forecast.slice(0, 15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8EAED" />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" />
              <YAxis stroke="var(--text-tertiary)" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#FFFFFF', color: '#2D3436' }} />
              <Legend />
              {inventory.slice(0, 3).map((item, idx) => (
                <Line
                  key={idx}
                  type="monotone"
                  dataKey={item.name}
                  stroke={['#6BA3D0', '#52B788', '#8B5CF6'][idx % 3]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={true}
                />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Info Section */}
      <div style={{
        background: '#E5F5F0',
        border: '2px solid #52B788',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <h4 style={{ color: '#1B4D3A', marginBottom: '0.5rem' }}>💡 Forecast Information</h4>
        <ul style={{ color: '#2D5447', margin: 0, paddingLeft: '1.5rem', lineHeight: '1.8', fontSize: '0.9rem' }}>
          <li>Based on average daily consumption patterns</li>
          <li>Consider seasonal variations for better accuracy</li>
          <li>Factor in reorder lead time for procurement</li>
          <li>Review forecasts weekly for optimization</li>
        </ul>
      </div>
    </div>
  );
};

export default StockForecast;
