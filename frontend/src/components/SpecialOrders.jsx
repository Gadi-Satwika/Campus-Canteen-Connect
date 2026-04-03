import React, { useState, useEffect } from 'react';

const SpecialOrders = () => {
  const [index, setIndex] = useState(0);

  const banners = [
    {
      title: "💥 FLAT 50% OFF",
      desc: "On your first Biryani Pre-booking! Use Code: RKV50",
      img: "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=1200", // High-reliability Biryani
      badge: "LIMITED OFFER"
    },
    {
      title: "🍿 MEGA COMBO DEALS",
      desc: "Buy 5 Snack Boxes & Get 1 Free! Perfect for Dorm Parties.",
      img: "https://images.pexels.com/photos/1582482/pexels-photo-1582482.jpeg?auto=compress&cs=tinysrgb&w=1200", // High-reliability Snacks
      badge: "STUDENT SPECIAL"
    },
    {
      title: "🍱 CATERING DISCOUNTS",
      desc: "20% Off on all Club Event catering orders this month.",
      img: "https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?auto=compress&cs=tinysrgb&w=1200", // High-reliability Catering
      badge: "EVENT PROMO"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setIndex(prev => (prev + 1) % banners.length), 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div style={{ position: 'relative', marginBottom: '40px', overflow: 'hidden', borderRadius: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', height: '180px' }}>
      {banners.map((b, i) => (
        <div key={i} style={{
          position: 'absolute', inset: 0, opacity: index === i ? 1 : 0, transition: '0.8s ease-in-out',
          backgroundImage: `linear-gradient(90deg, rgba(128,0,0,0.95) 35%, rgba(0,0,0,0.2)), url(${b.img})`,
          backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', padding: '0 40px', color: 'white'
        }}>
          <div style={{ transform: index === i ? 'translateX(0)' : 'translateX(-30px)', transition: '0.6s' }}>
            <span style={{ background: '#FFD700', color: '#800000', padding: '4px 12px', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 'bold' }}>{b.badge}</span>
            <h2 style={{ margin: '10px 0 5px 0', fontSize: '2rem', fontWeight: '900', letterSpacing: '1px' }}>{b.title}</h2>
            <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>{b.desc}</p>
          </div>
        </div>
      ))}
      {/* Small Indicator Dots */}
      <div style={{ position: 'absolute', bottom: '15px', right: '30px', display: 'flex', gap: '6px' }}>
        {banners.map((_, i) => (
          <div key={i} style={{ width: index === i ? '20px' : '6px', height: '6px', borderRadius: '10px', background: 'white', opacity: index === i ? 1 : 0.4, transition: '0.3s' }}></div>
        ))}
      </div>
    </div>
  );
};

export default SpecialOrders;