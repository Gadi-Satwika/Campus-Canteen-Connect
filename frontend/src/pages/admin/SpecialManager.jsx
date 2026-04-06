import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpecialManager = () => {
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState({ title: '', subtitle: '', image: '', code: '', price: '', quantity: '' });

    const fetchBanners = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/specials/all');
            setBanners(res.data);
        } catch (err) { console.error("Fetch failed", err); }
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/specials/add', {
                ...form,
                price: Number(form.price),
                quantity: Number(form.quantity)
            });
            setForm({ title: '', subtitle: '', image: '', code: '', price: '', quantity: '' });
            fetchBanners();
            alert("Flash Special Live! 🔥");
        } catch (err) { alert("Error adding special"); }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this banner?")) {
            await axios.delete(`http://localhost:5000/api/specials/${id}`);
            fetchBanners();
        }
    };

    return (
        <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0 }}>Banner Management 🎨</h1>
                <p style={{ color: '#64748B' }}>Create and manage flash sales for the student home screen.</p>
            </div>
            
            {/* Main Container - Responsive Wrap */}
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                
                {/* FORM PANEL */}
                <div style={{ flex: '1 1 400px', background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', height: 'fit-content' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Create New Special</h3>
                    <form onSubmit={handleSubmit}>
                        <input placeholder="Banner Title (e.g. MEGA THALI)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} required />
                        <input placeholder="Subtitle (e.g. Only for today!)" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} style={inputStyle} />
                        <input placeholder="Image URL (Clear PNG/JPG)" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={inputStyle} required />
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input placeholder="Promo Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} style={inputStyle} />
                            <input type="number" placeholder="Price (₹)" value={form.price} onChange={e => setForm({...form, price: e.target.value})} style={inputStyle} required />
                        </div>
                        <input type="number" placeholder="Available Plates" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} style={inputStyle} required />
                        
                        <button type="submit" style={{ width: '100%', padding: '15px', background: '#800000', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', boxShadow: '0 5px 15px rgba(128,0,0,0.2)' }}>
                            Publish Live Banner 🚀
                        </button>
                    </form>
                </div>

                {/* PREVIEW LIST */}
                <div style={{ flex: '2 1 500px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.1rem' }}>Active Banners ({banners.length})</h3>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {banners.length > 0 ? banners.map(b => (
                            <div key={b._id} style={{ display: 'flex', background: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #F1F5F9', position: 'relative' }}>
                                {/* Image Container with fixed ratio */}
                                <div style={{ width: '180px', height: '120px', flexShrink: 0 }}>
                                    <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                {/* Content Section */}
                                <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#1E293B' }}>{b.title}</h4>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>{b.subtitle}</p>
                                        </div>
                                        <button onClick={() => handleDelete(b._id)} style={{ padding: '8px 12px', color: '#EF4444', border: '1px solid #FEE2E2', background: '#FEF2F2', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Delete</button>
                                    </div>

                                    {/* Badges Row */}
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                        <span style={badgeStyle}>₹{b.price}</span>
                                        <span style={{...badgeStyle, background: '#F1F5F9', color: '#475569'}}>Qty: {b.quantity}</span>
                                        {b.code && <span style={{...badgeStyle, background: '#E0F2FE', color: '#0369A1'}}>CODE: {b.code}</span>}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '50px', background: '#F8FAFC', borderRadius: '20px', color: '#94A3B8', border: '2px dashed #E2E8F0' }}>
                                No banners active. Create one to start a flash sale!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const inputStyle = { 
    width: '100%', 
    padding: '14px', 
    marginBottom: '15px', 
    borderRadius: '10px', 
    border: '1px solid #E2E8F0',
    outline: 'none',
    fontSize: '0.9rem',
    background: '#F8FAFC'
};

const badgeStyle = {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    background: '#DCFCE7',
    color: '#166534'
};

export default SpecialManager;