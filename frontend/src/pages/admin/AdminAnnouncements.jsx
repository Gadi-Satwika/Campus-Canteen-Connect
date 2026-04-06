import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminAnnouncements = () => {
  const [msg, setMsg] = useState({ title: '', message: '', type: 'Info' });
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/announcements/all');
      setHistory(res.data);
    } catch (err) { console.error("History fetch failed"); }
  };

  useEffect(() => { fetchHistory(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/announcements/add', { ...msg, status: 'Active' });
      alert("Broadcast Sent! 🚀");
      setMsg({ title: '', message: '', type: 'Info' });
      fetchHistory(); 
    } catch (err) { alert("Error broadcasting."); }
  };

  const handleRevoke = async (id) => {
    if (window.confirm("Revoke this announcement? Students will no longer see it.")) {
      try {
        await axios.put(`http://localhost:5000/api/announcements/update/${id}`, { status: 'Revoked' });
        fetchHistory();
      } catch (err) { alert("Revoke failed."); }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', padding: '20px' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <h2 style={{ color: '#800000', marginTop: 0 }}>📢 New Broadcast</h2>
        <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input placeholder="Title" value={msg.title} onChange={e => setMsg({...msg, title: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DDD' }} required />
          <textarea placeholder="Message..." value={msg.message} onChange={e => setMsg({...msg, message: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DDD', minHeight: '100px' }} required />
          <select value={msg.type} onChange={e => setMsg({...msg, type: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DDD' }}>
            <option value="Info">General Info</option>
            <option value="Urgent">🚨 Urgent</option>
            <option value="Holiday">🗓️ Holiday</option>
          </select>
          <button type="submit" style={{ background: '#800000', color: 'white', border: 'none', padding: '15px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Send Now</button>
        </form>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', height: 'fit-content' }}>
        <h2 style={{ color: '#64748B', marginTop: 0 }}>📜 History</h2>
        {history.length > 0 ? history.map(h => (
          <div key={h._id} style={{ 
              padding: '15px', 
              background: h.status === 'Revoked' ? '#F1F5F9' : 'white', 
              opacity: h.status === 'Revoked' ? 0.6 : 1,               
              borderRadius: '15px', 
              marginBottom: '10px',
              borderLeft: `5px solid ${h.status === 'Revoked' ? '#94A3B8' : '#800000'}` 
          }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
                  <span>
                      📅 {h.createdAt ? new Date(h.createdAt).toLocaleDateString('en-GB') : "No Date"} | 
                      🕒 {h.createdAt ? new Date(h.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : "No Time"}
                  </span>
                  <span style={{ fontWeight: 'bold' }}>{(h.status || 'ACTIVE').toUpperCase()}</span>
              </div>

              <strong style={{ display: 'block', marginTop: '5px' }}>{h.title}</strong>
              
              {h.status !== 'Revoked' && (
                  <button 
                      onClick={() => handleRevoke(h._id)} 
                      style={{ marginTop: '10px', background: '#FFF1F2', color: '#E11D48', border: '1px solid #FECACA', borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                  >
                      ↩ Revoke Alert
                  </button>
              )}
          </div>
        )) : <p style={{ color: '#94A3B8' }}>No announcements found.</p>}
      </div>
    </div>
  );
};

export default AdminAnnouncements;