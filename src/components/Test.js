// components/Test.js
import React from 'react';

const Test = () => {
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      background: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      margin: '2rem auto',
      maxWidth: '600px'
    }}>
      <h1 style={{ color: '#27ae60', marginBottom: '1rem' }}>✅ System is Working!</h1>
      <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
        Your Medical Inventory System is running successfully.
      </p>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem',
        marginTop: '2rem'
      }}>
        <div style={{ padding: '1rem', background: '#e8f6f3', borderRadius: '4px' }}>
          <h3>Frontend</h3>
          <p>React App</p>
          <p style={{ color: '#27ae60' }}>✅ Running</p>
        </div>
        <div style={{ padding: '1rem', background: '#e8f6f3', borderRadius: '4px' }}>
          <h3>Backend</h3>
          <p>Node.js Server</p>
          <p style={{ color: '#e74c3c' }}>❌ Check if running on port 5000</p>
        </div>
      </div>
    </div>
  );
};

export default Test;