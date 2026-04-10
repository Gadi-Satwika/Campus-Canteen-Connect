import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import AdminBackground from '../../components/AdminBackground';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const mobileNavStyle = ({ isActive }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    textDecoration: 'none',
    color: isActive ? '#800000' : '#94A3B8',
    fontSize: '1.2rem', // Reduced slightly to fit all 6 icons
    height: '100%'
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <AdminBackground />

      <header style={{
        height: '70px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: isMobile ? '0 15px' : '0 30px', borderBottom: '1px solid #E2E8F0', position: 'fixed', 
        top: 0, width: '100%', zIndex: 1100, boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/rgukt-logo.png" alt="Logo" style={{ width: isMobile ? '35px' : '45px', height: isMobile ? '35px' : '45px', objectFit: 'contain' }} />
          <h2 style={{ color: '#1E293B', fontSize: isMobile ? '0.85rem' : '1.1rem', margin: 0, letterSpacing: '0.5px' }}>
            CAMPUS <span style={{fontWeight: '400'}}>CONNECT</span>
          </h2>
        </div>
        <button onClick={handleLogout} style={{
          background: '#FFF1F2', border: '1px solid #FECACA', color: '#E11D48', 
          padding: isMobile ? '6px 10px' : '8px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '0.75rem'
        }}>Logout</button>
      </header>

      <div style={{ display: 'flex', marginTop: '70px', flex: 1, marginBottom: isMobile ? '70px' : '0' }}>
        {/* DESKTOP SIDEBAR */}
        {!isMobile && (
          <aside 
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
            style={{
              width: sidebarWidth, background: 'white', borderRight: '1px solid #E2E8F0', position: 'fixed',
              left: 0, top: '70px', bottom: 0, zIndex: 1000, transition: 'width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              overflow: 'hidden', boxShadow: isExpanded ? '10px 0 30px rgba(0,0,0,0.05)' : 'none'
            }}
          >
            <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column' }}>
              <NavLink to="/admin/dashboard" style={navItem}><span style={{minWidth: '30px', textAlign: 'center', fontSize: '1.5rem'}}>📊</span>{isExpanded && <span style={{fontWeight: '700'}}>Dashboard</span>}</NavLink>
              <NavLink to="/admin/inventory" style={navItem}><span style={{minWidth: '30px', textAlign: 'center', fontSize: '1.5rem'}}>📦</span>{isExpanded && <span style={{fontWeight: '700'}}>Inventory</span>}</NavLink>
              <NavLink to="/admin/orders" style={navItem}><span style={{minWidth: '30px', textAlign: 'center', fontSize: '1.5rem'}}>🛒</span>{isExpanded && <span style={{fontWeight: '700'}}>Live Orders</span>}</NavLink>
              <NavLink to="/admin/announcements" style={navItem}><span style={{minWidth: '30px', textAlign: 'center', fontSize: '1.5rem'}}>📢</span>{isExpanded && <span style={{fontWeight: '700'}}>Announcements</span>}</NavLink>
              <NavLink to="/admin/complaints" style={navItem}><span style={{minWidth: '30px', textAlign: 'center', fontSize: '1.5rem'}}>💬</span>{isExpanded && <span style={{fontWeight: '700'}}>Complaints</span>}</NavLink>
              <NavLink to="/admin/specials" style={navItem}><span style={{minWidth: '30px', textAlign: 'center', fontSize: '1.5rem'}}>🎨</span>{isExpanded && <span style={{fontWeight: '700'}}>Banner Manager</span>}</NavLink>
            </div>
          </aside>
        )}

        {/* MOBILE BOTTOM NAV - ALL 6 LINKS INCLUDED */}
        {isMobile && (
          <nav style={{ position: 'fixed', bottom: 0, width: '100%', height: '70px', background: 'white', display: 'flex', borderTop: '1px solid #E2E8F0', zIndex: 1100, boxShadow: '0 -4px 15px rgba(0,0,0,0.05)' }}>
            <NavLink to="/admin/dashboard" style={mobileNavStyle}><span>📊</span></NavLink>
            <NavLink to="/admin/inventory" style={mobileNavStyle}><span>📦</span></NavLink>
            <NavLink to="/admin/orders" style={mobileNavStyle}><span>🛒</span></NavLink>
            <NavLink to="/admin/announcements" style={mobileNavStyle}><span>📢</span></NavLink>
            <NavLink to="/admin/specials" style={mobileNavStyle}><span>🎨</span></NavLink>
            <NavLink to="/admin/complaints" style={mobileNavStyle}><span>💬</span></NavLink>
          </nav>
        )}

        <main style={{ flex: 1, marginLeft: isMobile ? '0' : '80px', padding: isMobile ? '20px 15px' : '40px', boxSizing: 'border-box', transition: 'margin-left 0.4s ease', width: '100%', overflowX: 'hidden' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;