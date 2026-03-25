import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ items: 0, orders: 0, lowStock: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const resItems = await axios.get('http://localhost:5000/api/food/menu');
        const resOrders = await axios.get('http://localhost:5000/api/orders/all');
        setStats({
          items: resItems.data.length,
          orders: resOrders.data.filter(o => o.status === 'Pending').length,
          lowStock: resItems.data.filter(i => i.quantity < 5).length
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  const cardStyle = { 
    background: '#FFFFFF', padding: '2rem', borderRadius: '20px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9'
  };

  return (
    <div>
      <h1 style={{ color: '#1E293B', fontSize: '2rem', marginBottom: '2rem' }}>Morning, Admin!</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>TOTAL MENU ITEMS</span>
          <h2 style={{ fontSize: '2.5rem', color: '#1E293B', margin: '10px 0' }}>{stats.items}</h2>
          <div style={{ height: '4px', background: '#800000', width: '40px', borderRadius: '2px' }}></div>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>PENDING ORDERS</span>
          <h2 style={{ fontSize: '2.5rem', color: '#800000', margin: '10px 0' }}>{stats.orders}</h2>
          <div style={{ height: '4px', background: '#FBBF24', width: '40px', borderRadius: '2px' }}></div>
        </div>

        <div style={cardStyle}>
          <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: '700' }}>STOCK ALERTS</span>
          <h2 style={{ fontSize: '2.5rem', color: stats.lowStock > 0 ? '#EF4444' : '#10B981', margin: '10px 0' }}>{stats.lowStock}</h2>
          <div style={{ height: '4px', background: stats.lowStock > 0 ? '#EF4444' : '#10B981', width: '40px', borderRadius: '2px' }}></div>
        </div>
      </div>

      <div style={{ ...cardStyle, marginTop: '2rem', background: '#FFFDF5' }}>
        <h3 style={{ margin: 0, color: '#800000' }}>System Status</h3>
        <p style={{ color: '#64748B', fontSize: '0.9rem' }}>All backend services are operational. Inventory is synced with student app.</p>
      </div>
    </div>
  );
};

export default Dashboard;