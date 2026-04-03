import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);

    const fetchAll = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/complaints/all');
            setComplaints(res.data);
        } catch (err) { console.error("Error fetching complaints"); }
    };

    const markResolved = async (id) => {
        try {
            // This updates the status to Resolved in the backend
            await axios.put(`http://localhost:5000/api/complaints/update/${id}`, { status: 'Resolved' });
            alert("Issue marked as Resolved! ✅");
            fetchAll(); // Refresh the list
        } catch (err) {
            alert("Could not update status.");
        }
    };

    useEffect(() => { fetchAll(); }, []);

    return (
    <div style={{ padding: '20px' }}>
        <h1 style={{ color: '#800000', marginBottom: '30px', fontWeight: '900' }}>🛠️ Student Support Center</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
            {complaints.length > 0 ? complaints.map(c => (
                <div key={c._id} style={{ 
                    background: c.status === 'Withdrawn' ? '#F8FAFC' : 'white', 
                    borderRadius: '25px', 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                    border: '1px solid #E2E8F0',
                    opacity: c.status === 'Withdrawn' ? 0.7 : 1, // Fades out withdrawn items
                    transition: '0.3s'
                }}>
                    
                    {/* IMAGE SECTION */}
                    {c.image && (
                        <div style={{ filter: c.status === 'Withdrawn' ? 'grayscale(100%)' : 'none' }}>
                            <img 
                                src={`http://localhost:5000${c.image}`} 
                                alt="Complaint" 
                                style={{ width: '100%', height: '180px', objectFit: 'cover' }} 
                            />
                        </div>
                    )}

                    <div style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8', marginBottom: '10px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span>📅 {new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
                                <span style={{ color: '#CBD5E1' }}>|</span>
                                <span>🕒 {new Date(c.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                            </div>
                            <span style={{ 
                                fontWeight: 'bold', 
                                color: c.status === 'Resolved' ? '#16A34A' : (c.status === 'Withdrawn' ? '#64748B' : '#F59E0B') 
                            }}>
                                {c.status.toUpperCase()}
                            </span>
                        </div>

                        <h3 style={{ margin: '0 0 10px 0', color: c.status === 'Withdrawn' ? '#94A3B8' : '#1E293B' }}>{c.subject}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{c.message}</p>

                        {/* --- STATUS-BASED ACTIONS --- */}
                        <div style={{ marginTop: '20px' }}>
                            {c.status === 'Pending' ? (
                                <button 
                                    onClick={() => markResolved(c._id)} 
                                    style={{ width: '100%', padding: '12px', background: '#800000', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    Mark as Resolved ✅
                                </button>
                            ) : c.status === 'Resolved' ? (
                                <div style={{ textAlign: 'center', color: '#16A34A', fontWeight: 'bold', padding: '12px', background: '#DCFCE7', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                                    ✓ Fixed & Resolved
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 'bold', padding: '12px', background: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                                    ↩ Withdrawn by Student
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94A3B8' }}>
                    <h3>No complaints found.</h3>
                </div>
            )}
        </div>
    </div>
);
};

export default AdminComplaints;