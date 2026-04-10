import React, { useState, useEffect } from 'react';
import API from '../../api';

const AdminComplaints = () => {
    const [complaints, setComplaints] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchAll = async () => {
        try {
            const res = await API.get('/complaints/all');
            setComplaints(res.data);
        } catch (err) { console.error("Error fetching complaints"); }
    };

    const markResolved = async (id) => {
        try {
            await API.put(`/complaints/update/${id}`, { status: 'Resolved' });
            alert("Issue marked as Resolved! ✅");
            fetchAll(); 
        } catch (err) {
            alert("Could not update status.");
        }
    };

    useEffect(() => { fetchAll(); }, []);

    return (
    <div style={{ padding: isMobile ? '10px 5px' : '20px' }}>
        <h1 style={{ 
            color: '#800000', 
            marginBottom: isMobile ? '20px' : '30px', 
            fontWeight: '900',
            fontSize: isMobile ? '1.5rem' : '2rem',
            textAlign: isMobile ? 'center' : 'left'
        }}>🛠️ Student Support Center</h1>

        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', 
            gap: '20px' 
        }}>
            {complaints.length > 0 ? complaints.map(c => (
                <div key={c._id} style={{ 
                    background: c.status === 'Withdrawn' ? '#F8FAFC' : 'white', 
                    borderRadius: '25px', 
                    overflow: 'hidden', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                    border: '1px solid #E2E8F0',
                    opacity: c.status === 'Withdrawn' ? 0.7 : 1,
                    transition: '0.3s'
                }}>

                    {c.image && (
                        <div style={{ filter: c.status === 'Withdrawn' ? 'grayscale(100%)' : 'none' }}>
                            <img 
                                src={`https://campus-canteen-connect-production.up.railway.app${c.image}`} 
                                alt="Complaint" 
                                style={{ width: '100%', height: isMobile ? '200px' : '180px', objectFit: 'cover' }} 
                            />
                        </div>
                    )}

                    <div style={{ padding: '20px' }}>
                        <div style={{ 
                            display: 'flex', 
                            flexDirection: isMobile ? 'column' : 'row',
                            justifyContent: 'space-between', 
                            fontSize: '0.75rem', 
                            color: '#94A3B8', 
                            marginBottom: '10px',
                            gap: isMobile ? '5px' : '0'
                        }}>
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

                        <h3 style={{ 
                            margin: '0 0 10px 0', 
                            fontSize: '1.1rem',
                            color: c.status === 'Withdrawn' ? '#94A3B8' : '#1E293B' 
                        }}>{c.subject}</h3>
                        
                        <p style={{ 
                            fontSize: '0.9rem', 
                            color: '#475569', 
                            lineHeight: '1.5',
                            margin: '0 0 15px 0' 
                        }}>{c.message}</p>

                        <div style={{ marginTop: 'auto' }}>
                            {c.status === 'Pending' ? (
                                <button 
                                    onClick={() => markResolved(c._id)} 
                                    style={{ 
                                        width: '100%', 
                                        padding: '14px', 
                                        background: '#800000', 
                                        color: 'white', 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 10px rgba(128,0,0,0.15)'
                                    }}
                                >
                                    Mark Resolved ✅
                                </button>
                            ) : c.status === 'Resolved' ? (
                                <div style={{ textAlign: 'center', color: '#16A34A', fontWeight: 'bold', padding: '12px', background: '#DCFCE7', borderRadius: '12px', border: '1px solid #BBF7D0', fontSize: '0.85rem' }}>
                                    ✓ Issue Resolved
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', color: '#64748B', fontWeight: 'bold', padding: '12px', background: '#F1F5F9', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.85rem' }}>
                                    Withdrawn by Student
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