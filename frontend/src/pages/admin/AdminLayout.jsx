import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import AdminBackground from '../../components/AdminBackground';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  const sidebarWidth = isExpanded ? '260px' : '80px';

  const navItem = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '16px 25px',
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    color: isActive ? '#800000' : '#64748B',
    background: isActive ? '#FFF5F5' : 'transparent',
    borderRight: isActive ? '4px solid #800000' : '4px solid transparent',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <AdminBackground />

      <header style={{
        height: '70px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 30px', borderBottom: '1px solid #E2E8F0', position: 'fixed', 
        top: 0, width: '100%', zIndex: 1100, boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'transparent', color: '#800000', padding: '6px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}><img 
          src="/rgukt-logo.png" 
          alt="RGUKT Logo" 
          style={{ 
            width: '45px', 
            height: '45px', 
            objectFit: 'contain'
          }} 
        /></div>
          <h2 style={{ color: '#1E293B', fontSize: '1.1rem', margin: 0, letterSpacing: '0.5px' }}>CAMPUS <span style={{fontWeight: '400'}}>CONNECT</span></h2>
        </div>
        <button onClick={handleLogout} style={{
          background: '#FFF1F2', border: '1px solid #FECACA', color: '#E11D48', 
          padding: '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.85rem', transition: '0.2s'
        }} onMouseOver={(e) => e.target.style.background = '#FFE4E6'} onMouseOut={(e) => e.target.style.background = '#FFF1F2'}>
          Logout
        </button>
      </header>

      <div style={{ display: 'flex', marginTop: '70px', flex: 1 }}>
        <aside 
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          style={{
            width: sidebarWidth,
            background: 'white',
            borderRight: '1px solid #E2E8F0',
            position: 'fixed',
            left: 0,
            top: '70px',
            bottom: 0,
            zIndex: 1000,
            transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            overflow: 'hidden',
            boxShadow: isExpanded ? '10px 0 30px rgba(0,0,0,0.05)' : 'none'
          }}
        >
          <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column' }}>
            <NavLink to="/admin/dashboard" style={navItem}>
              <span style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>📊</span>
              <span style={{ opacity: isExpanded ? 1 : 0, transition: '0.3s', fontWeight: '700' }}>Dashboard</span>
            </NavLink>
            
            <NavLink to="/admin/inventory" style={navItem}>
              <span style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>📦</span>
              <span style={{ opacity: isExpanded ? 1 : 0, transition: '0.3s', fontWeight: '700' }}>Inventory</span>
            </NavLink>
            
            <NavLink to="/admin/orders" style={navItem}>
              <span style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>🛒</span>
              <span style={{ opacity: isExpanded ? 1 : 0, transition: '0.3s', fontWeight: '700' }}>Live Orders</span>
            </NavLink>

            <NavLink to="/admin/announcements" style={navItem}>
              <span style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>📢</span>
              <span style={{ opacity: isExpanded ? 1 : 0, transition: '0.3s', fontWeight: '700' }}>Announcements</span>
            </NavLink>

            <NavLink to="/admin/complaints" style={navItem}>
              <span style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>🛠️</span>
              <span style={{ opacity: isExpanded ? 1 : 0, transition: '0.3s', fontWeight: '700' }}>Complaints</span>
            </NavLink>

            <NavLink to="/admin/specials" style={navItem}>
              <span style={{ marginRight: '10px' }}>🎨</span>
              Banner Manager
            </NavLink>
          </div>

          <div style={{ position: 'absolute', bottom: '30px', width: '100%', padding: '0 25px', opacity: isExpanded ? 1 : 0, transition: '0.2s' }}>
             <p style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 'bold' }}>SYSTEM v1.0.2</p>
          </div>
        </aside>

        <main style={{ 
          flex: 1, 
          marginLeft: '80px', 
          padding: '40px', 
          boxSizing: 'border-box',
          transition: 'margin-left 0.4s ease' 
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;