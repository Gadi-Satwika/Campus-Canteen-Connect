import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingCount: 0,
    collectedToday: 0,
    menuCount: 0,
    lowStock: 0,
    specialSales: 0
  });

  // --- 🎨 INJECTING DYNAMIC ANIMATIONS ---
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes pulseGlow {
        0% { box-shadow: 0 0 0 0 rgba(128, 0, 0, 0.2); }
        70% { box-shadow: 0 0 0 15px rgba(128, 0, 0, 0); }
        100% { box-shadow: 0 0 0 0 rgba(128, 0, 0, 0); }
      }
      .stat-card-hover {
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
      }
      .stat-card-hover:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 20px 40px rgba(0,0,0,0.1) !important;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [ordersRes, menuRes] = await Promise.all([
        axios.get('http://localhost:5000/api/orders/all'),
        axios.get('http://localhost:5000/api/food/menu')
      ]);

      const today = new Date().toDateString();
      const todayOrders = ordersRes.data.filter(o => new Date(o.createdAt).toDateString() === today);

      const revenue = todayOrders
        .filter(o => o.status === 'Collected')
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      const specialsCount = todayOrders.reduce((sum, o) => {
          return sum + (o.items?.filter(item => item.isSpecial).length || 0);
      }, 0);

      setStats({
        totalRevenue: revenue,
        pendingCount: todayOrders.filter(o => o.status === 'Preparing' || o.status === 'Ready').length,
        collectedToday: todayOrders.filter(o => o.status === 'Collected').length,
        menuCount: menuRes.data.length,
        lowStock: menuRes.data.filter(i => i.quantity < 5).length,
        specialSales: specialsCount
      });
    } catch (err) {
      console.error("Dashboard Sync Error", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '40px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* HEADER SECTION */}
      <header style={{ marginBottom: '45px', animation: 'fadeInUp 0.6s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0, fontSize: '2.4rem' }}>Morning, Admin!</h1>
            <span style={{ fontSize: '2.4rem' }}>👋</span>
        </div>
        <p style={{ color: '#64748B', marginTop: '8px', fontSize: '1.1rem' }}>The canteen is buzzing. Here is your real-time performance.</p>
      </header>

      {/* --- STAT CARDS GRID --- */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '30px',
        marginBottom: '50px'
      }}>
        
        <StatCard title="Revenue (Today)" value={`₹${stats.totalRevenue}`} color="#800000" icon="💰" delay="0.1s" />
        <StatCard title="Orders in Kitchen" value={stats.pendingCount} color="#F59E0B" icon="🍳" delay="0.2s" isLive={stats.pendingCount > 0} />
        <StatCard title="Special Item Sales" value={stats.specialSales} color="#3B82F6" icon="🚀" delay="0.3s" />
        <StatCard title="Low Stock Items" value={stats.lowStock} color={stats.lowStock > 0 ? "#EF4444" : "#10B981"} icon="⚠️" delay="0.4s" />

      </div>

      {/* --- LOWER SECTION --- */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* INSIGHTS PANEL */}
        <div style={{ background: 'white', padding: '35px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', animation: 'fadeInUp 0.8s ease-out' }}>
            <h3 style={{ marginTop: 0, color: '#1E293B', fontSize: '1.4rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '15px' }}>Quick Insights</h3>
            
            <InsightRow label="Active Menu Items" value={`${stats.menuCount} Live`} color="#1E293B" />
            <InsightRow label="Successful Deliveries" value={`${stats.collectedToday} Orders`} color="#10B981" />
            <InsightRow label="Inventory Health" value={stats.lowStock > 0 ? "Action Needed" : "All Good"} color={stats.lowStock > 0 ? "#EF4444" : "#10B981"} />
        </div>

        {/* SYSTEM STATUS PANEL */}
        <div style={{ 
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
            padding: '35px', borderRadius: '32px', color: 'white',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            animation: 'fadeInUp 1s ease-out'
        }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#94A3B8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px' }}>System Infrastructure</h4>
            <div style={{ fontSize: '1.1rem', lineHeight: '2.2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div> Backend: Operational</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div> Database: Synchronized</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Student App: Connected</div>
            </div>
        </div>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StatCard = ({ title, value, color, icon, delay, isLive }) => (
  <div 
    className="stat-card-hover"
    style={{ 
      background: 'white', 
      padding: '30px', 
      borderRadius: '28px', 
      boxShadow: '0 5px 15px rgba(0,0,0,0.02)',
      borderTop: `8px solid ${color}`,
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      animation: `fadeInUp 0.6s ease-out ${delay} backwards`,
      ...(isLive && { animation: `fadeInUp 0.6s ease-out ${delay} backwards, pulseGlow 2s infinite` })
    }}
  >
    {/* Background Watermark Icon */}
    <div style={{ 
        position: 'absolute', right: '-15px', bottom: '-15px', 
        fontSize: '6rem', opacity: 0.04, transform: 'rotate(-10deg)',
        userSelect: 'none'
    }}>
      {icon}
    </div>

    <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px' }}>
        {title}
    </div>
    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1E293B' }}>
        {value}
    </div>
    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: color, fontWeight: 'bold' }}>
        <span>{icon}</span> Updated Just Now
    </div>
  </div>
);

const InsightRow = ({ label, value, color }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '20px 0', borderBottom: '1px solid #F8FAFC' }}>
        <span style={{ color: '#64748B', fontWeight: '500' }}>{label}</span>
        <span style={{ fontWeight: '800', color: color }}>{value}</span>
    </div>
);

export default Dashboard;