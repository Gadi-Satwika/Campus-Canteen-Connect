import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/all');
      setOrders(res.data.filter(o => o.status === 'Pending'));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(fetchOrders, 5000); // Live polling
    return () => clearInterval(timer);
  }, []);

  const handleVerify = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/update/${id}`, { status: 'Completed' });
      fetchOrders();
    } catch (err) { alert("Verification Failed!"); }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: 0 }}>Order Stream</h1>
        <div style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
          ● LIVE UPDATING
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {orders.map(o => (
          <div key={o._id} style={{ 
            padding: '2rem', 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: '24px', 
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0 }}>{o.item?.name}</h3>
              <span style={{ color: '#facc15', fontWeight: '900', fontSize: '1.4rem' }}>{o.otp}</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.85rem' }}>STUDENT: {o.user.split('@')[0].toUpperCase()}</p>
            
            <button 
              onClick={() => handleVerify(o._id)}
              style={{ 
                width: '100%', padding: '12px', marginTop: '1.5rem', borderRadius: '12px',
                background: '#fff', color: '#0f172a', fontWeight: '800', border: 'none', cursor: 'pointer'
              }}
            >
              VALIDATE & DELIVER
            </button>
          </div>
        ))}
      </div>
      {orders.length === 0 && <p style={{color: '#94a3b8', textAlign: 'center', marginTop: '3rem'}}>No active orders in the queue.</p>}
    </div>
  );
};

export default LiveOrders;