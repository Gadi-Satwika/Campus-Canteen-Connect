import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpecialManager = () => {
    const [banners, setBanners] = useState([]);
    const [form, setForm] = useState({ title: '', subtitle: '', image: '', code: '' });

    const fetchBanners = async () => {
        const res = await axios.get('http://localhost:5000/api/specials/all');
        setBanners(res.data);
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await axios.post('http://localhost:5000/api/specials/add', form);
        setForm({ title: '', subtitle: '', image: '', code: '' });
        fetchBanners();
    };

    const handleDelete = async (id) => {
        if(window.confirm("Delete this banner?")) {
            await axios.delete(`http://localhost:5000/api/specials/${id}`);
            fetchBanners();
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <h1 style={{ fontWeight: '900' }}>Banner Management 🎨</h1>
            
            <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                {/* FORM */}
                <form onSubmit={handleSubmit} style={{ flex: 1, background: 'white', padding: '25px', borderRadius: '20px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
                    <input placeholder="Title (e.g. FLAT 50% OFF)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} style={inputStyle} required />
                    <input placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} style={inputStyle} />
                    <input placeholder="Image URL" value={form.image} onChange={e => setForm({...form, image: e.target.value})} style={inputStyle} required />
                    <input placeholder="Promo Code" value={form.code} onChange={e => setForm({...form, code: e.target.value})} style={inputStyle} />
                    <button type="submit" style={{ width: '100%', padding: '15px', background: '#800000', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Publish Banner</button>
                </form>

                {/* PREVIEW LIST */}
                <div style={{ flex: 1.5, display: 'grid', gap: '15px' }}>
                    {banners.map(b => (
                        <div key={b._id} style={{ display: 'flex', background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #EEE' }}>
                            <img src={b.image} style={{ width: '120px', objectFit: 'cover' }} />
                            <div style={{ padding: '15px', flex: 1 }}>
                                <strong>{b.title}</strong>
                                <button onClick={() => handleDelete(b._id)} style={{ float: 'right', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #DDD' };

export default SpecialManager;