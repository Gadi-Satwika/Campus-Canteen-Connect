import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminLayout = () => {
  const sidebarStyle = {
    width: '280px', height: '100vh', background: '#0f172a', color: 'white',
    padding: '2.5rem 1.5rem', position: 'fixed', left: 0, top: 0
  };

  const navItem = ({ isActive }) => ({
    display: 'block', padding: '16px 20px', borderRadius: '12px',
    marginBottom: '10px', textDecoration: 'none',
    background: isActive ? 'linear-gradient(135deg, #800000 0%, #4a0000 100%)' : 'transparent',
    color: isActive ? 'white' : '#94a3b8', transition: '0.3s', fontWeight: '600'
  });

  return (
    <div style={{ display: 'flex', background: '#0f172a', minHeight: '100vh' }}>
      <aside style={sidebarStyle}>
        <h2 style={{ color: '#facc15', marginBottom: '3rem' }}>RKV <span style={{color: '#fff'}}>PRO</span></h2>
        <nav>
          <NavLink to="/admin/dashboard" style={navItem}>📊 Dashboard</NavLink>
          <NavLink to="/admin/inventory" style={navItem}>📦 Inventory</NavLink>
          <NavLink to="/admin/orders" style={navItem}>🛒 Live Orders</NavLink>
        </nav>
      </aside>

      <main style={{ flex: 1, marginLeft: '280px', padding: '3rem', background: 'radial-gradient(circle at top right, #1e293b, #0f172a)', color: 'white' }}>
        <Outlet /> {/* This is where the sub-pages load! */}
      </main>
    </div>
  );
};

export default AdminLayout;