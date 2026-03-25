import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null); 
  const [viewHistory, setViewHistory] = useState(false); 
  const [checkoutStep, setCheckoutStep] = useState(1); 
  const [currentServing, setCurrentServing] = useState(0);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('canteenCart');
    return saved ? JSON.parse(saved) : [];
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('orderHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const [userDetails, setUserDetails] = useState({ 
    name: '', 
    email: '',
    dorm: '', 
    method: 'COD' // Default selection
  });

  useEffect(() => {
    localStorage.setItem('canteenCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('orderHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/food/menu').then(res => setItems(res.data));
  }, []);

  useEffect(() => {
    const getServing = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders/current-serving');
        setCurrentServing(res.data.tokenNumber);
      } catch (e) { console.log("Serving fetch error"); }
    };
    getServing();
    const interval = setInterval(getServing, 5000);
    return () => clearInterval(interval);
  }, []);

  const addToCart = (item) => {
    const exists = cart.find(i => i._id === item._id);
    if (exists) {
      setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => 
      item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item._id !== id));
  };

  const downloadBillImage = () => {
    const element = document.getElementById('printable-bill');
    html2canvas(element, { backgroundColor: '#ffffff', scale: 2 }).then((canvas) => {
      const link = document.createElement('a');
      link.download = `RKV-Bill-${orderSummary._id.slice(-6)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handlePlaceOrder = async () => {
    if (!userDetails.name || !userDetails.email || !userDetails.dorm) {
      return alert("Please fill Name, Email, and Dorm!");
    }

    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    // VERIFIED: Payment Method is now included in payload
    const orderPayload = {
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })),
      totalAmount: total,
      userName: userDetails.name,
      userEmail: userDetails.email, 
      dorm: userDetails.dorm,
      paymentMethod: userDetails.method // <--- RESTORED
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders/place', orderPayload);
      setHistory([res.data, ...history]); 
      setOrderSummary(res.data); 
      setCart([]); 
      setShowCart(false);
      setCheckoutStep(1);
    } catch (err) {
      alert("Order Failed! Check your server terminal for errors.");
    }
  };

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1>Campus Menu</h1>
        <button onClick={() => setViewHistory(true)} style={{ background: '#800000', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }}>📜 History</button>
      </div>

      <div style={{ background: '#800000', color: 'white', padding: '15px', borderRadius: '15px', marginBottom: '20px', textAlign: 'center' }}>
        <h3 style={{ margin: 0 }}>Now Serving Token: {currentServing || '--'}</h3>
      </div>

      {/* ITEMS LIST */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items.map(item => (
          <div key={item._id} style={{ background: 'white', padding: '20px', borderRadius: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h3>{item.name}</h3>
            <p style={{ color: '#800000', fontWeight: 'bold' }}>₹{item.price}</p>
            <button onClick={() => addToCart(item)} style={{ width: '100%', padding: '10px', background: '#FEE2E2', color: '#800000', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
        <button onClick={() => setShowCart(true)} style={{ position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)', background: '#800000', color: 'white', padding: '15px 40px', borderRadius: '30px', border: 'none', fontWeight: 'bold', zIndex: 100 }}>
          🛒 Review Cart ({cart.length})
        </button>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '400px', background: 'white', height: '100%', padding: '30px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: '#800000' }}>{checkoutStep === 1 ? 'Your Cart' : 'Checkout Details'}</h2>
            
            {checkoutStep === 1 ? (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {cart.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #EEE' }}>
                    <div>
                      <strong>{item.name}</strong><br/>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button onClick={() => updateQty(item._id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQty(item._id, 1)}>+</button>
                      <button onClick={() => removeFromCart(item._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setCheckoutStep(2)} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#800000', color: 'white', borderRadius: '10px' }}>Proceed to Details</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input placeholder="Your Full Name" value={userDetails.name} onChange={(e) => setUserDetails({...userDetails, name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #DDD' }} />
                <input placeholder="Email Address" value={userDetails.email} onChange={(e) => setUserDetails({...userDetails, email: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #DDD' }} />
                <input placeholder="Dorm/Block (e.g. G-34)" value={userDetails.dorm} onChange={(e) => setUserDetails({...userDetails, dorm: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #DDD' }} />
                
                {/* RESTORED: Payment Method Buttons */}
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748B' }}>PAYMENT METHOD</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {['COD', 'PhonePe'].map(m => (
                    <button 
                      key={m} 
                      onClick={() => setUserDetails({...userDetails, method: m})} 
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: userDetails.method === m ? '#800000' : '#F1F5F9', color: userDetails.method === m ? 'white' : '#64748B', fontWeight: 'bold' }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <button onClick={handlePlaceOrder} style={{ padding: '15px', background: '#16A34A', color: 'white', borderRadius: '10px', border: 'none', fontWeight: 'bold', marginTop: '10px' }}>Confirm & Pay</button>
                <button onClick={() => setCheckoutStep(1)} style={{ background: 'none', border: 'none', color: '#64748B' }}>Back to Cart</button>
              </div>
            )}
            <button onClick={() => setShowCart(false)} style={{ marginTop: 'auto', color: '#94A3B8', border: 'none', background: 'none' }}>Close</button>
          </div>
        </div>
      )}

      {/* BILL MODAL */}
      {(orderSummary || viewHistory) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '380px', maxHeight: '90vh', overflowY: 'auto' }}>
            {viewHistory ? (
              <div>
                <h3>Order History</h3>
                {history.map(h => (
                  <div key={h._id} onClick={() => { setOrderSummary(h); setViewHistory(false); }} style={{ padding: '10px', borderBottom: '1px solid #EEE', cursor: 'pointer' }}>
                    Token #{h.tokenNumber} - ₹{h.totalAmount}
                  </div>
                ))}
              </div>
            ) : (
              <div id="printable-bill">
                <h2 style={{ textAlign: 'center' }}>RKV CANTEEN</h2>
                <hr />
                {orderSummary.items.map((i, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{i.name} x{i.quantity}</span>
                    <span>₹{i.price * i.quantity}</span>
                  </div>
                ))}
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                  <span>Total</span><span>₹{orderSummary.totalAmount}</span>
                </div>
                <p>Resident: {orderSummary.userName} ({orderSummary.dorm})</p>
                <p>Payment: {orderSummary.paymentMethod}</p>
                <div style={{ textAlign: 'center', margin: '20px 0' }}>
                  <QRCodeCanvas value={orderSummary._id} size={200} includeMargin={true} />
                  <h3>Token: #{orderSummary.tokenNumber}</h3>
                </div>
              </div>
            )}
            <button onClick={downloadBillImage} style={{ width: '100%', padding: '10px', background: '#800000', color: 'white', borderRadius: '10px', marginBottom: '10px' }}>Download Image</button>
            <button onClick={() => {setOrderSummary(null); setViewHistory(false);}} style={{ width: '100%', padding: '10px' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;