import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SpecialOrders = ({ addToCart }) => {
    const [dbSpecials, setDbSpecials] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    // --- CONFIGURATION: Add as many banners as you like here ---
    const staticBanners = [
        {
            title: "FLAT 50% OFF",
            sub: "On your first Biryani Pre-booking! Use Code: RKV50",
            img: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1350&q=80",
            color: "linear-gradient(90deg, rgba(128,0,0,0.9) 0%, rgba(128,0,0,0.4) 100%)"
        },
        {
            title: "MEGA COMBO DEALS",
            sub: "Buy 5 Snack Boxes & Get 1 Free! Perfect for Dorm Parties.",
            img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1350&q=80",
            color: "linear-gradient(90deg, rgba(30,41,59,0.9) 0%, rgba(30,41,59,0.4) 100%)"
        },
        {
            title: "WEEKEND REFRESH",
            sub: "Get a free Cold Coffee with any Burger purchase.",
            img: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1350&q=80",
            color: "linear-gradient(90deg, rgba(22,101,52,0.9) 0%, rgba(22,101,52,0.4) 100%)"
        }
    ];

    // --- AUTOMATIC TRANSITION LOGIC ---
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % staticBanners.length);
        }, 5000); // Changes every 5 seconds
        return () => clearInterval(timer);
    }, [staticBanners.length]);

    const handleViewSpecials = async () => {
        setLoading(true);
        setShowModal(true);
        try {
            const res = await axios.get('http://localhost:5000/api/specials/all');
            setDbSpecials(res.data);
        } catch (err) {
            console.error("Fetch specials failed");
        }
        setLoading(false);
    };

    const b = staticBanners[currentIndex];

    return (
        <div style={{ marginBottom: '35px', width: '100%' }}>
            {/* MAIN CAROUSEL BANNER */}
            <div style={{ 
                width: '100%', 
                height: '210px', 
                borderRadius: '24px', 
                position: 'relative', 
                overflow: 'hidden', 
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                backgroundImage: `${b.color}, url(${b.img})`,
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                padding: '0 45px', 
                color: 'white',
                transition: 'background-image 0.8s ease-in-out', // Smooth Fade Effect
                boxSizing: 'border-box'
            }}>
                <div style={{ maxWidth: '500px' }}>
                    <span style={{ background: '#FFD700', color: '#800000', padding: '3px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 'bold', display: 'inline-block', marginBottom: '10px' }}>
                        CAMPUS EXCLUSIVE
                    </span>
                    <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{b.title}</h1>
                    <p style={{ margin: '6px 0 18px 0', opacity: 0.9, fontSize: '0.9rem', lineHeight: '1.4' }}>{b.sub}</p>
                    
                    <button 
                        onClick={handleViewSpecials}
                        style={{ 
                            padding: '10px 22px', background: 'white', color: '#800000', 
                            border: 'none', borderRadius: '12px', fontWeight: 'bold', 
                            cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                        }}
                    >
                        🚀 View Today's Specials
                    </button>
                </div>

                {/* DYNAMIC NAVIGATION DOTS */}
                <div style={{ position: 'absolute', bottom: '20px', right: '40px', display: 'flex', gap: '8px' }}>
                    {staticBanners.map((_, i) => (
                        <div 
                            key={i} 
                            onClick={() => setCurrentIndex(i)}
                            style={{ 
                                width: i === currentIndex ? '24px' : '8px', 
                                height: '8px', 
                                borderRadius: '10px', 
                                background: 'white', 
                                opacity: i === currentIndex ? 1 : 0.4, 
                                cursor: 'pointer',
                                transition: '0.4s all' 
                            }} 
                        />
                    ))}
                </div>
            </div>

            {/* SPECIALS MODAL (The Popup) */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
                    <div style={{ background: 'white', width: '100%', maxWidth: '480px', borderRadius: '32px', padding: '35px', position: 'relative', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '25px', right: '25px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '35px', height: '35px', cursor: 'pointer', fontWeight: '900', color: '#64748B' }}>✕</button>
                        
                        <h2 style={{ color: '#800000', fontSize: '1.6rem', marginBottom: '20px' }}>🍱 Live Specials</h2>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>Loading deals...</div>
                        ) : dbSpecials.length > 0 ? (
                            <div style={{ display: 'grid', gap: '15px' }}>
                                {dbSpecials.map(s => {
            const isOut = s.quantity <= 0;
            return (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: isOut ? '#F1F5F9' : '#FFF7ED', borderRadius: '20px', opacity: isOut ? 0.6 : 1 }}>
                    <img src={s.image} style={{ width: '70px', height: '70px', borderRadius: '15px', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0 }}>{s.title}</h4>
                        <div style={{ color: '#800000', fontWeight: 'bold' }}>₹{s.price}</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748B' }}>Only {s.quantity} left!</div>
                    </div>

                    <button 
                        disabled={isOut}
                        onClick={() => {
                            addToCart({
                                _id: s._id,
                                name: s.title,
                                price: s.price,
                                image: s.image,
                                isSpecial: true // Flag for Admin
                            });
                            alert(`${s.title} added to cart!`);
                        }}
                        style={{ 
                            background: isOut ? '#94A3B8' : '#800000', 
                            color: 'white', border: 'none', padding: '10px 15px', 
                            borderRadius: '10px', fontWeight: 'bold', cursor: isOut ? 'not-allowed' : 'pointer' 
                        }}
                    >
                        {isOut ? 'Sold Out' : 'Add +'}
                    </button>
                </div>
            );
        })}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <span style={{ fontSize: '3rem' }}>🍗</span>
                                <h3 style={{ color: '#1E293B', margin: '15px 0 5px 0' }}>No Extra Specials</h3>
                                <p style={{ color: '#94A3B8', fontSize: '0.85rem' }}>Check back during lunch hours!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpecialOrders;