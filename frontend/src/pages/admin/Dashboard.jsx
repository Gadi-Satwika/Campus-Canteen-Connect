import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ items: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const resItems = await axios.get('http://localhost:5000/api/food/menu');
        const resOrders = await axios.get('http://localhost:5000/api/orders/all');
        
        setStats({
          items: resItems.data.length,
          orders: resOrders.data.filter(o => o.status === 'Pending').length,
          lowStock: resItems.data.filter(i => i.quantity < 5).length
        });
      } catch (err) { console.error("Stats Fetch Error:", err); }
    };
    fetchDashboardStats();
  }, []);

  const cardStyle = { 
    background: 'rgba(255, 255, 255, 0.03)', 
    padding: '2.5rem', 
    borderRadius: '24px', 
    border: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center'
  };

  const labelStyle = { color: '#94a3b8', fontWeight: '600', marginBottom: '10px' };
  const valueStyle = { fontSize: '3rem', fontWeight: '900', margin: 0, background: 'linear-gradient(to right, #facc15, #eab308)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' };

  return (
    <div>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>Executive Insights</h1>
        <p style={{ color: '#94a3b8' }}>Real-time overview of RGUKT Canteen operations</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
        <div style={cardStyle}>
          <p style={labelStyle}>MENU REPOSITORY</p>
          <h2 style={valueStyle}>{stats.items}</h2>
          <p style={{fontSize: '0.8rem', color: '#10b981'}}>Active Items</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>LIVE TRAFFIC</p>
          <h2 style={{...valueStyle, background: 'linear-gradient(to right, #ff4d4d, #800000)', WebkitBackgroundClip: 'text'}}>{stats.orders}</h2>
          <p style={{fontSize: '0.8rem', color: '#ff4d4d'}}>Pending Orders</p>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>INVENTORY ALERTS</p>
          <h2 style={{...valueStyle, background: 'linear-gradient(to right, #fbbf24, #d97706)', WebkitBackgroundClip: 'text'}}>{stats.lowStock}</h2>
          <p style={{fontSize: '0.8rem', color: '#fbbf24'}}>Critical Items</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;