import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

const Menu = () => {
  const [items, setItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null); 
  const [viewHistory, setViewHistory] = useState(false); 
  const [checkoutStep, setCheckoutStep] = useState(1); 
  const [currentServing, setCurrentServing] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);

  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('canteenCart')) || []);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('orderHistory')) || []);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', dorm: '', method: 'COD' });

  useEffect(() => { localStorage.setItem('canteenCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('orderHistory', JSON.stringify(history)); }, [history]);
  useEffect(() => { axios.get('http://localhost:5000/api/food/menu').then(res => setItems(res.data)); }, []);

  useEffect(() => {
    const getServing = () => {
      axios.get('http://localhost:5000/api/orders/current-serving').then(res => setCurrentServing(res.data.tokenNumber)).catch(() => {});
    };
    getServing();
    const interval = setInterval(getServing, 5000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (item) => {
    const exists = cart.find(i => i._id === item._id);
    if (exists) setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { ...item, quantity: 1 }]);
  };

  const updateQty = (id, delta) => setCart(prev => prev.map(item => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));

  const handlePlaceOrder = async () => {
    if (!userDetails.name || !userDetails.email || !userDetails.dorm) return alert("Fill all details!");
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const orderPayload = { items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), totalAmount: total, userName: userDetails.name, userEmail: userDetails.email, dorm: userDetails.dorm, paymentMethod: userDetails.method };
    try {
      const res = await axios.post('http://localhost:5000/api/orders/place', orderPayload);
      setHistory([res.data, ...history]); setOrderSummary(res.data); setCart([]); setShowCart(false); setCheckoutStep(1);
    } catch (err) { alert("Order Failed!"); }
  };

  const particlesInit = async (engine) => { await loadSlim(engine); };

  return (
    <div style={{ background: '#FDFDFD', minHeight: '100vh', fontFamily: 'Inter, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* 1. FIXED 3D BACKGROUND (Visible & Animated) */}
      <Particles id="tsparticles" init={particlesInit} options={{
        fullScreen: { enable: true, zIndex: 0 },
        particles: {
          number: { value: 60 },
          color: { value: "#800000" },
          links: { enable: true, distance: 150, color: "#800000", opacity: 0.15, width: 1 },
          move: { enable: true, speed: 1.2 },
          opacity: { value: 0.2 },
          size: { value: 3 }
        },
        interactivity: { events: { onHover: { enable: true, mode: "repulse" } } }
      }} />

      {/* 2. NAVBAR */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', background: '#800000', color: 'white', position: 'sticky', top: 0, zIndex: 2000, boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'white', color: '#800000', padding: '6px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '1.2rem' }}>RC</div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', letterSpacing: '1px' }}>CAMPUS CANTEEN</h2>
        </div>
        <div style={{ display: 'flex', gap: '25px', alignItems: 'center', fontWeight: '600' }}>
          <span onClick={() => setActiveCategory(null)} style={{ cursor: 'pointer' }}>Menu</span>
          <span onClick={() => setViewHistory(true)} style={{ cursor: 'pointer' }}>📜 History</span>
          <div onClick={() => setShowCart(true)} style={{ cursor: 'pointer', position: 'relative' }}>
            🛒 {cart.length > 0 && <span style={{ background: '#FFD700', color: 'black', borderRadius: '50%', padding: '2px 8px', fontSize: '0.75rem', position: 'absolute', top: '-10px', right: '-10px', border: '2px solid #800000' }}>{cart.length}</span>}
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px 20px', position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* SPECIAL ORDERS HERO */}
        <div style={{ background: 'white', border: '2px dashed #800000', padding: '40px', borderRadius: '30px', textAlign: 'center', marginBottom: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
          <h2 style={{ margin: 0, color: '#800000', fontSize: '1.8rem' }}>✨ RKV Special Orders Section</h2>
          <p style={{ color: '#64748B', fontSize: '1.1rem', marginTop: '10px' }}>Bulk pre-booking for Biryani & Event catering starts soon!</p>
        </div>

        {/* 3. CATEGORY CARDS (ENLARGED & ANIMATED) */}
        {!activeCategory ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[ { id: 'Breakfast', icon: '☕', img: 'https://t3.ftcdn.net/jpg/00/78/87/94/360_F_78879462_KyMC4iWhDHLlEEZDAOLiDWPuubnAaMMk.jpg' }, 
               { id: 'Lunch', icon: '🍚', img: 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2015/06/south-indian-lunch-menu-1.jpg?w=1200&ssl=1' }, 
               { id: 'Snacks', icon: '🍿', img: 'https://media.istockphoto.com/id/1263686908/photo/mixed-salty-snack-flat-lay-table-scene-on-a-wood-background.jpg?s=612x612&w=0&k=20&c=rCZ-gpvz--NpeNA0cYGCyJj3EK0kFUSkvdsow9u4I3o=' } 
            ].map(cat => (
              <div key={cat.id} onClick={() => setActiveCategory(cat.id)} 
                style={{ background: 'white', borderRadius: '30px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #EEE' }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 25px 50px rgba(128,0,0,0.2)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.1)'; }}
              >
                <img src={cat.img} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt={cat.id} />
                <div style={{ padding: '20px' }}>
                  <span style={{ fontSize: '3rem' }}>{cat.icon}</span>
                  <h2 style={{ margin: '10px 0 0 0', color: '#800000', fontSize: '2rem' }}>{cat.id}</h2>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 4. FILTERED MENU WITH "NO ITEMS" LOGIC */
          <div>
            <button onClick={() => setActiveCategory(null)} style={{ background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold' }}>⬅ Back to Categories</button>
            <h2 style={{ color: '#800000', fontSize: '2rem', marginBottom: '25px' }}>{activeCategory} Specials</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {items.filter(i => i.category === activeCategory).length > 0 ? (
                items.filter(i => i.category === activeCategory).map(item => (
                  <div key={item._id} style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', transition: '0.3s' }}>
                    <img src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ width: '100%', height: '200px', objectFit: 'cover' }} alt="" />
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem' }}>{item.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#800000', fontWeight: '900', fontSize: '1.6rem' }}>₹{item.price}</span>
                        <button onClick={() => addToCart(item)} style={{ background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Add +</button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', background: '#F1F5F9', borderRadius: '30px', color: '#64748B' }}>
                  <h1>🍽️</h1>
                  <h3>No items added yet in {activeCategory}!</h3>
                  <p>Check back later or try another category.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 5. HIGHLIGHTED SERVING TOKEN */}
      <div style={{ position: 'fixed', bottom: '30px', left: '20px', zIndex: 1500, background: 'linear-gradient(135deg, #800000, #4a0000)', color: 'white', padding: '10px 20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 15px 40px rgba(128,0,0,0.4)', border: '3px solid #FFD700' }}>
        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.9 }}>NOW SERVING</p>
        <h1 style={{ margin: 0, fontSize: '2.0rem', fontWeight: '900', letterSpacing: '2px' }}>{currentServing || '--'}</h1>
      </div>

      {/* 6. CART DRAWER WITH "ADD AN ITEM" LOGIC */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(5px)' }}>
          <div style={{ width: '100%', maxWidth: '450px', background: 'white', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)' }}>
            <h2 style={{ color: '#800000', marginBottom: '30px' }}>{checkoutStep === 1 ? '🛒 Your Cart' : 'Checkout Details'}</h2>
            
            {cart.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
                <span style={{ fontSize: '4rem' }}>🧺</span>
                <h3>Your cart is empty</h3>
                <p>Please add an item to start your order!</p>
                <button onClick={() => setShowCart(false)} style={{ marginTop: '20px', background: '#800000', color: 'white', padding: '10px 25px', borderRadius: '10px', border: 'none' }}>Go to Menu</button>
              </div>
            ) : (
              checkoutStep === 1 ? (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '20px', marginBottom: '15px' }}>
                      <div><strong>{item.name}</strong><br/><span>₹{item.price * item.quantity}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => updateQty(item._id, -1)} style={{ padding: '5px 10px' }}>-</button>
                        <span style={{ fontWeight: 'bold' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item._id, 1)} style={{ padding: '5px 10px' }}>+</button>
                        <button onClick={() => removeFromCart(item._id)} style={{ color: 'red', border: 'none', background: 'none' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setCheckoutStep(2)} style={{ width: '100%', marginTop: '30px', padding: '20px', background: '#800000', color: 'white', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.1rem' }}>Proceed to Checkout</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input placeholder="Name" value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #DDD' }} />
                  <input placeholder="Email" value={userDetails.email} onChange={e => setUserDetails({...userDetails, email: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #DDD' }} />
                  <input placeholder="Dorm/Block" value={userDetails.dorm} onChange={e => setUserDetails({...userDetails, dorm: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #DDD' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['COD', 'PhonePe'].map(m => (
                      <button key={m} onClick={() => setUserDetails({...userDetails, method: m})} style={{ flex: 1, padding: '15px', background: userDetails.method === m ? '#800000' : '#EEE', color: userDetails.method === m ? 'white' : 'black', borderRadius: '10px', border: 'none', fontWeight: 'bold' }}>{m}</button>
                    ))}
                  </div>
                  <button onClick={handlePlaceOrder} style={{ padding: '20px', background: '#16A34A', color: 'white', borderRadius: '15px', fontWeight: 'bold', fontSize: '1.1rem', border: 'none' }}>Confirm & Pay Now</button>
                  <button onClick={() => setCheckoutStep(1)} style={{ background: 'none', border: 'none', color: '#64748B' }}>Back to Cart</button>
                </div>
              )
            )}
            <button onClick={() => { setShowCart(false); setCheckoutStep(1); }} style={{ marginTop: 'auto', color: '#94A3B8', border: 'none', background: 'none' }}>Close Drawer</button>
          </div>
        </div>
      )}

      {/* HISTORY MODAL (Kept same) */}
      {(viewHistory || orderSummary) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
           <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '400px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            {viewHistory ? (
              <div>
                <h2 style={{ textAlign: 'center', color: '#800000' }}>📜 Order History</h2>
                {history.map(h => (
                  <div key={h._id} onClick={() => { setOrderSummary(h); setViewHistory(false); }} style={{ padding: '15px', borderBottom: '1px solid #EEE', cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Token #{h.tokenNumber}</span><strong>₹{h.totalAmount}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div id="printable-bill" style={{ fontFamily: 'monospace' }}>
                <h2 style={{ textAlign: 'center' }}>RKV CANTEEN</h2>
                <hr style={{ borderTop: '2px dashed black' }} />
                {orderSummary.items?.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}><span>{i.name} x{i.quantity}</span><span>₹{i.price * i.quantity}</span></div>
                ))}
                <hr style={{ borderTop: '2px dashed black' }} />
                <div style={{ fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}><span>TOTAL</span><span>₹{orderSummary.totalAmount}</span></div>
                <div style={{ textAlign: 'center', margin: '30px 0' }}>
                  <QRCodeCanvas value={orderSummary._id} size={220} includeMargin={true} level="H" />
                  <p style={{ margin: '10px 0', fontSize: '1.2rem' }}>OTP: <strong>{orderSummary.otp}</strong></p>
                  <h1 style={{ margin: 0, color: '#800000' }}>Token: #{orderSummary.tokenNumber}</h1>
                </div>
              </div>
            )}
            <button onClick={() => {setOrderSummary(null); setViewHistory(false);}} style={{ width: '100%', padding: '15px', background: '#F1F5F9', borderRadius: '15px', border: 'none', marginTop: '20px', fontWeight: 'bold' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;