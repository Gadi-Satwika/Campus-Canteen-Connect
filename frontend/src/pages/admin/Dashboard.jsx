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

  const [recentReviews, setRecentReviews] = useState([]);

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
      .custom-scrollbar::-webkit-scrollbar { width: 6px; }
      .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
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
        .filter(o => o.status?.toLowerCase() === 'collected')
        .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

      const specialsCount = todayOrders
        .filter(o => o.status?.toLowerCase() === 'collected') // Only count completed sales
        .reduce((sum, o) => {
            return sum + (o.items?.filter(item => item.isSpecial || item.category === 'Special').length || 0);
        }, 0);
      let allReviews = [];
      if (menuRes.data && Array.isArray(menuRes.data)) {
          menuRes.data.forEach(item => {
              if (item.reviews && item.reviews.length > 0) {
                  item.reviews.forEach(rev => {
                      allReviews.push({ 
                          ...rev, 
                          foodName: item.name,
                          createdAt: rev.createdAt || new Date() 
                      });
                  });
              }
          });
      }


      allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRecentReviews(allReviews.slice(0, 6)); 


      setStats({
        totalRevenue: revenue,
        pendingCount: todayOrders.filter(o => {
            const s = o.status?.toLowerCase();
            return s === 'preparing' || s === 'ready' || s === 'pending';
        }).length,
        collectedToday: todayOrders.filter(o => o.status?.toLowerCase() === 'collected').length,
        menuCount: menuRes.data.length,
        lowStock: menuRes.data.filter(i => i.quantity < 5).length,
        specialSales: specialsCount
      });

    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '40px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
 
      <header style={{ marginBottom: '45px', animation: 'fadeInUp 0.6s ease-out', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0, fontSize: '2.4rem' }}>Morning, Admin!</h1>
                <span style={{ fontSize: '2.4rem' }}>👋</span>
            </div>
            <p style={{ color: '#64748B', marginTop: '8px', fontSize: '1.1rem' }}>The canteen is buzzing. Here is your real-time performance.</p>
        </div>
        <button onClick={fetchDashboardData} style={{ padding: '12px 24px', background: '#800000', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 10px 20px rgba(128,0,0,0.2)' }}>Refresh Feed</button>
      </header>

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


      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        

        <div className="custom-scrollbar" style={{ background: 'white', padding: '35px', borderRadius: '32px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)', animation: 'fadeInUp 0.8s ease-out', maxHeight: '450px', overflowY: 'auto' }}>
            <h3 style={{ marginTop: 0, color: '#1E293B', fontSize: '1.4rem', borderBottom: '2px solid #F1F5F9', paddingBottom: '15px', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>Student Feedback 💬</h3>
            
            {recentReviews.length > 0 ? recentReviews.map((rev, i) => (
                <div key={i} style={{ padding: '15px 0', borderBottom: '1px solid #F8FAFC' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#1E293B' }}>{rev.userName}</span>
                        <span style={{ color: '#F59E0B' }}>{'★'.repeat(rev.rating)}</span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#800000', fontWeight: 'bold', margin: '4px 0' }}>ITEM: {rev.foodName}</div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B', fontStyle: 'italic' }}>"{rev.comment}"</p>
                </div>
            )) : (
                <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '20px' }}>No reviews yet today.</p>
            )}
        </div>

        <div style={{ 
            background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', 
            padding: '35px', borderRadius: '32px', color: 'white',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            animation: 'fadeInUp 1s ease-out', height: 'fit-content'
        }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#94A3B8', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px' }}>System Infrastructure</h4>
            <div style={{ fontSize: '1.1rem', lineHeight: '2.2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div> Backend: Operational</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%' }}></div> Database: Synchronized</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div style={{ width: '8px', height: '8px', background: '#3B82F6', borderRadius: '50%' }}></div> Student App: Connected</div>
            </div>
            
            <hr style={{ border: '0', borderTop: '1px solid #334155', margin: '25px 0' }} />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Menu Status</span>
                <span style={{ fontWeight: 'bold', color: '#10B981' }}>{stats.menuCount} Items Live</span>
            </div>
        </div>

      </div>
    </div>
  );
};


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
    <div style={{ position: 'absolute', right: '-15px', bottom: '-15px', fontSize: '6rem', opacity: 0.04, transform: 'rotate(-10deg)', userSelect: 'none' }}>{icon}</div>
    <div style={{ color: '#94A3B8', fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px' }}>{title}</div>
    <div style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1E293B' }}>{value}</div>
    <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: color, fontWeight: 'bold' }}>
        <span>{icon}</span> Updated Just Now
    </div>
  </div>
);

export default Dashboard;