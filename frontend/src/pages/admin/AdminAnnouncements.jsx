import React, { useState, useEffect } from 'react';
import API from '../../api';

const AdminAnnouncements = () => {
  const [msg, setMsg] = useState({ title: '', message: '', type: 'Info' });
  const [history, setHistory] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive Check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await API.get('/announcements/all');
      // Sort history to show most recent at the top
      const sortedData = Array.isArray(res.data) 
        ? res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) 
        : [];
      setHistory(sortedData);
    } catch (err) { console.error("History fetch failed"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await API.post('/announcements/add', { ...msg, status: 'Active' });
      alert("Broadcast Sent! 🚀");
      setMsg({ title: '', message: '', type: 'Info' });
      fetchHistory(); 
    } catch (err) { alert("Error broadcasting."); }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("Revoke this announcement? Students will no longer see it.")) {
      try {
        await API.put(`/announcements/update/${id}`, { status: 'Revoked' });
        fetchHistory();
      } catch (err) { alert("Revoke failed."); }
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
      gap: isMobile ? '20px' : '30px', 
      padding: isMobile ? '10px' : '20px' 
    }}>
      
      {/* --- FORM SECTION --- */}
      <div style={{ 
        background: 'white', 
        padding: isMobile ? '20px' : '30px', 
        borderRadius: '25px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        height: 'fit-content'
      }}>
        <h2 style={{ color: '#800000', marginTop: 0, fontSize: isMobile ? '1.4rem' : '1.8rem' }}>📢 New Broadcast</h2>
        <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '20px' }}>Send a real-time alert to all student devices.</p>
        
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            placeholder="Alert Title" 
            value={msg.title} 
            onChange={e => setMsg({...msg, title: e.target.value})} 
            style={{ padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none' }} 
            required 
          />
          <textarea 
            placeholder="Write your message here..." 
            value={msg.message} 
            onChange={e => setMsg({...msg, message: e.target.value})} 
            style={{ padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', minHeight: '120px', outline: 'none', fontFamily: 'inherit' }} 
            required 
          />
          <select 
            value={msg.type} 
            onChange={e => setMsg({...msg, type: e.target.value})} 
            style={{ padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white' }}
          >
            <option value="Info">General Info</option>
            <option value="Urgent">🚨 Urgent / Important</option>
            <option value="Holiday">🗓️ Holiday Notice</option>
          </select>
          <button 
            type="submit" 
            style={{ 
              background: '#800000', 
              color: 'white', 
              border: 'none', 
              padding: '15px', 
              borderRadius: '12px', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(128,0,0,0.2)',
              transition: 'transform 0.2s'
            }}
          >
            Broadcast to All
          </button>
        </form>
      </div>

      {/* --- HISTORY SECTION --- */}
      <div style={{ 
        background: 'white', 
        padding: isMobile ? '20px' : '30px', 
        borderRadius: '25px', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)', 
        height: isMobile ? 'auto' : 'fit-content',
        maxHeight: isMobile ? 'none' : '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ color: '#64748B', marginTop: 0, fontSize: isMobile ? '1.4rem' : '1.8rem' }}>📜 Recent History</h2>
        <div style={{ marginTop: '20px' }}>
          {history.length > 0 ? history.map(h => (
            <div key={h._id} style={{ 
                padding: '18px', 
                background: h.status === 'Revoked' ? '#F8FAFC' : 'white', 
                opacity: h.status === 'Revoked' ? 0.7 : 1,               
                borderRadius: '18px', 
                marginBottom: '15px',
                border: '1px solid #E2E8F0',
                borderLeft: `6px solid ${h.status === 'Revoked' ? '#94A3B8' : (h.type === 'Urgent' ? '#EF4444' : '#800000')}` 
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: '#94A3B8', marginBottom: '8px' }}>
                    <span>
                      {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-GB') : "Today"} | 
                      {h.createdAt ? new Date(h.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : ""}
                    </span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      background: h.status === 'Revoked' ? '#E2E8F0' : '#DCFCE7', 
                      color: h.status === 'Revoked' ? '#64748B' : '#166534',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {h.status?.toUpperCase()}
                    </span>
                </div>

                <strong style={{ display: 'block', fontSize: '1rem', color: '#1E293B' }}>{h.title}</strong>
                <p style={{ margin: '8px 0', fontSize: '0.85rem', color: '#64748B', lineHeight: '1.4' }}>{h.message}</p>
                
                {h.status !== 'Revoked' && (
                    <button 
                        onClick={() => handleRevoke(h._id)} 
                        style={{ 
                          marginTop: '10px', 
                          background: '#FFF1F2', 
                          color: '#E11D48', 
                          border: '1px solid #FECACA', 
                          borderRadius: '8px', 
                          padding: '6px 12px', 
                          cursor: 'pointer', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold' 
                        }}
                    >
                        ↩ Stop Showing to Students
                    </button>
                )}
            </div>
          )) : <p style={{ color: '#94A3B8', textAlign: 'center' }}>No broadcasts yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;