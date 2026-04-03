import { auth } from '../firebase';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import SpecialOrders from '../components/SpecialOrders';

const Menu = () => {
  // --- STATE ---
  const [items, setItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [orderSummary, setOrderSummary] = useState(null); 
  const [viewHistory, setViewHistory] = useState(false); 
  const [checkoutStep, setCheckoutStep] = useState(1); 
  const [currentServing, setCurrentServing] = useState(0);
  const [activeCategory, setActiveCategory] = useState(null);

  const [announcement, setAnnouncement] = useState(null);
  const [showBellDot, setShowBellDot] = useState(false);
  const [openAnnounce, setOpenAnnounce] = useState(false);

  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('canteenCart')) || []);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('orderHistory')) || []);
  const [userDetails, setUserDetails] = useState({ name: '', email: '', dorm: '', method: 'COD' });

  const [myComplaints, setMyComplaints] = useState([]);
  const [compForm, setCompForm] = useState({ subject: '', message: '' });
  const [editingCompId, setEditingCompId] = useState(null);
  const [showComplaint, setShowComplaint] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear(); // Clears any cart or local data
      navigate("/", { replace: true }); // Redirect to login
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // --- COMPLAINT LOGIC ---
  const fetchMyComplaints = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/complaints/all');
      setMyComplaints(res.data.filter(c => c.studentEmail === userDetails.email));
    } catch (err) { console.error("Error fetching complaints"); }
  };

  const handleComplaintSubmit = async () => {
    const formData = new FormData();
    formData.append('studentName', userDetails.name);
    formData.append('studentEmail', userDetails.email);
    formData.append('subject', compForm.subject);
    formData.append('message', compForm.message);
    if (selectedFile) formData.append('image', selectedFile);

    try {
      if (editingCompId) {
        await axios.put(`http://localhost:5000/api/complaints/update/${editingCompId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Complaint Updated Successfully! ✨");
      } else {
        await axios.post('http://localhost:5000/api/complaints/add', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert("Complaint Submitted Successfully! ✅");
      }
      setCompForm({ subject: '', message: '' });
      setSelectedFile(null);
      setEditingCompId(null);
      setShowComplaint(false);
      fetchMyComplaints();
    } catch (err) { alert("Action failed."); }
  };

  const deleteMyComplaint = async (id) => {
    if (window.confirm("Do you want to withdraw this complaint? It will stay in your history as 'Withdrawn'.")) {
      try {
        await axios.put(`http://localhost:5000/api/complaints/update/${id}`, { status: 'Withdrawn' });
        alert("Complaint Withdrawn. ↩️");
        fetchMyComplaints();
      } catch (err) { alert("Error updating status."); }
    }
  };

  // --- ANNOUNCEMENT SYNC (FIXED LOGIC) ---
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/announcements/latest');
        if (res.data && res.data.status.toLowerCase() === 'active') {
          setAnnouncement(res.data);
          const lastRead = localStorage.getItem('lastReadId');
          if (lastRead !== res.data._id) setShowBellDot(true);
        } else {
          setAnnouncement(null);
          setShowBellDot(false);
        }
      } catch (err) { console.error("Announcements failed"); }
    };
    fetchLatest();
    const interval = setInterval(fetchLatest, 30000); // 30s sync
    return () => clearInterval(interval);
  }, []);

  // --- BASE EFFECTS ---
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

  // Add this to sync your LocalStorage history with the Database status
  useEffect(() => {
    const syncHistoryStatus = async () => {
      if (userDetails.email) {
        try {
          // Fetch fresh orders from DB to get the LATEST status
          const res = await axios.get(`http://localhost:5000/api/orders/user/${userDetails.email}`);
          
          // Update the state so the "Badge" changes color immediately
          setHistory(res.data);
          
          // Update LocalStorage so it's fresh for the next refresh
          localStorage.setItem('orderHistory', JSON.stringify(res.data));
        } catch (err) {
          console.error("Status sync failed");
        }
      }
    };

    // Sync once on load, then every 20 seconds to catch Admin updates
    syncHistoryStatus();
    const interval = setInterval(syncHistoryStatus, 20000);
    return () => clearInterval(interval);
  }, [userDetails.email]);

  // --- ACTIONS ---
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
          <div onClick={() => { setOpenAnnounce(true); if (announcement) { setShowBellDot(false); localStorage.setItem('lastReadId', announcement._id); } }} style={{ cursor: 'pointer', position: 'relative', fontSize: '1.4rem' }}>
            🔔
            {showBellDot && <span style={{ position: 'absolute', top: '0', right: '0', width: '10px', height: '10px', background: '#EF4444', borderRadius: '50%', border: '2px solid white', boxShadow: '0 0 5px rgba(239, 68, 68, 0.5)' }}></span>}
          </div>
          <div onClick={() => { setShowComplaint(true); fetchMyComplaints(); }} style={{ cursor: 'pointer', fontSize: '1.4rem' }}>🛠️</div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Logout</button>
        </div>
      </nav>

      <div style={{ padding: '40px 20px', zIndex: 10, maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <SpecialOrders />

        {!activeCategory ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {[ { id: 'Breakfast', icon: '☕', img: 'https://t3.ftcdn.net/jpg/00/78/87/94/360_F_78879462_KyMC4iWhDHLlEEZDAOLiDWPuubnAaMMk.jpg' }, 
               { id: 'Lunch', icon: '🍚', img: 'https://i0.wp.com/www.chitrasfoodbook.com/wp-content/uploads/2015/06/south-indian-lunch-menu-1.jpg?w=1200&ssl=1' }, 
               { id: 'Snacks', icon: '🍿', img: 'https://media.istockphoto.com/id/1263686908/photo/mixed-salty-snack-flat-lay-table-scene-on-a-wood-background.jpg?s=612x612&w=0&k=20&c=rCZ-gpvz--NpeNA0cYGCyJj3EK0kFUSkvdsow9u4I3o=' } 
            ].map(cat => (
              <div key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ background: 'white', borderRadius: '30px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', boxShadow: '0 15px 35px rgba(0,0,0,0.1)', overflow: 'hidden', border: '1px solid #EEE' }} onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>
                <img src={cat.img} style={{ width: '100%', height: '150px', objectFit: 'cover' }} alt={cat.id} />
                <div style={{ padding: '20px' }}><span style={{ fontSize: '3rem' }}>{cat.icon}</span><h2 style={{ margin: '10px 0 0 0', color: '#800000', fontSize: '2rem' }}>{cat.id}</h2></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <button onClick={() => setActiveCategory(null)} style={{ background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold' }}>⬅ Back to Categories</button>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {items.filter(i => i.category === activeCategory).map(item => (
                <div key={item._id} style={{ background: 'white', borderRadius: '25px', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                  <img src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ width: '100%', height: '200px', objectFit: 'cover' }} alt="" />
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0' }}>{item.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#800000', fontWeight: '900', fontSize: '1.6rem' }}>₹{item.price}</span>
                      <button onClick={() => addToCart(item)} style={{ background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Add +</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: '30px', left: '20px', zIndex: 1500, background: 'linear-gradient(135deg, #800000, #4a0000)', color: 'white', padding: '10px 20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 15px 40px rgba(128,0,0,0.4)', border: '3px solid #FFD700' }}>
        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.9 }}>NOW SERVING</p>
        <h1 style={{ margin: 0, fontSize: '2.0rem', fontWeight: '900' }}>{currentServing || '--'}</h1>
      </div>

      {/* --- CART DRAWER (ORIGINAL STYLE) --- */}
      {showCart && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(5px)' }}>
          <button 
              onClick={() => setShowCart(false)} 
              style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: '#94A3B8', lineHeight: 1 }}
            >
              ×
            </button>
          <div style={{ width: '100%', maxWidth: '450px', background: 'white', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: '#800000' }}>{checkoutStep === 1 ? '🛒 Your Cart' : 'Checkout Details'}</h2>
            {cart.length === 0 ? <div style={{ flex: 1, textAlign: 'center', marginTop: '100px' }}><h3>Your cart is empty</h3></div> : (
              checkoutStep === 1 ? (
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {cart.map(item => (
                    <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '20px', background: '#F8FAFC', borderRadius: '20px', marginBottom: '15px' }}>
                      <div><strong>{item.name}</strong><br/><span>₹{item.price * item.quantity}</span></div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <button onClick={() => updateQty(item._id, -1)}>-</button><span style={{ fontWeight: 'bold' }}>{item.quantity}</span><button onClick={() => updateQty(item._id, 1)}>+</button>
                        <button onClick={() => removeFromCart(item._id)} style={{ color: 'red', background: 'none', border: 'none' }}>🗑️</button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setCheckoutStep(2)} style={{ width: '100%', marginTop: '30px', padding: '20px', background: '#800000', color: 'white', borderRadius: '15px', fontWeight: 'bold' }}>Proceed to Checkout</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <input placeholder="Name" value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #DDD' }} />
                  <input placeholder="Email" value={userDetails.email} onChange={e => setUserDetails({...userDetails, email: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #DDD' }} />
                  <input placeholder="Dorm" value={userDetails.dorm} onChange={e => setUserDetails({...userDetails, dorm: e.target.value})} style={{ padding: '15px', borderRadius: '12px', border: '1px solid #DDD' }} />
                  <button onClick={handlePlaceOrder} style={{ padding: '20px', background: '#16A34A', color: 'white', borderRadius: '15px', fontWeight: 'bold' }}>Confirm & Pay Now</button>
                  <button onClick={() => setCheckoutStep(1)} style={{ background: 'none', border: 'none', color: '#64748B' }}>Back</button>
                </div>
              )
            )}
            <button onClick={() => setShowCart(false)} style={{ marginTop: '20px' }}>Close Cart</button>
          </div>
        </div>
      )}

      {/* --- ANNOUNCEMENT MODAL (RESTORED UI) --- */}
      {openAnnounce && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', borderTop: `12px solid ${announcement?.type === 'Urgent' ? '#EF4444' : '#800000'}` }}>
            {announcement ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{announcement.type === 'Urgent' ? '🚨' : '📢'}</div>
                <h2 style={{ margin: '0 0 5px 0', color: '#1E293B' }}>{announcement.title}</h2>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '20px' }}>
                  📅 {new Date(announcement.createdAt).toLocaleDateString('en-GB')} | 🕒 {new Date(announcement.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
                <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6' }}>{announcement.message}</p>
              </>
            ) : (
              <div style={{ padding: '20px' }}>
                <div style={{ fontSize: '3rem' }}>💤</div>
                <h2 style={{ color: '#94A3B8' }}>No Notifications</h2>
                <p style={{ color: '#CBD5E1' }}>Check back later for canteen news.</p>
              </div>
            )}
            <button onClick={() => setOpenAnnounce(false)} style={{ width: '100%', marginTop: '30px', padding: '15px', background: '#800000', color: 'white', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Close Window</button>
          </div>
        </div>
      )}

      {/* --- COMPLAINT MODAL (RESTORED UI) --- */}
      {showComplaint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 7000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#800000', margin: 0 }}>🛠️ Support Center</h2>
              <button onClick={() => { setShowComplaint(false); setEditingCompId(null); setCompForm({subject:'', message:''}); }} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ marginBottom: '25px' }}>
              <h4 style={{ color: '#64748B', borderBottom: '1px solid #EEE' }}>My Previous Issues</h4>
              {myComplaints.length > 0 ? myComplaints.map(c => (
                <div key={c._id} style={{ background: '#F8FAFC', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94A3B8' }}>
                    <span>{new Date(c.createdAt).toLocaleDateString('en-GB')} <span style={{ marginLeft: '8px', opacity: 0.7 }}>{new Date(c.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></span>
                    <span style={{ color: c.status === 'Pending' ? '#F59E0B' : '#16A34A', fontWeight: 'bold' }}>{c.status.toUpperCase()}</span>
                  </div>
                  <div style={{ fontWeight: 'bold', marginTop: '5px' }}>{c.subject}</div>
                  <p style={{ fontSize: '0.85rem', margin: '5px 0', color: '#475569' }}>{c.message}</p>
                  <div style={{ display: 'flex', gap: '15px', marginTop: '10px', borderTop: '1px solid #DDD', paddingTop: '8px' }}>
                    <button onClick={() => { setCompForm(c); setEditingCompId(c._id); }} style={{ background: 'none', border: 'none', color: '#800000', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✏️ Edit</button>
                    <button onClick={() => deleteMyComplaint(c._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🗑️ Revoke</button>
                  </div>
                </div>
              )) : <p style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center' }}>No complaints raised yet.</p>}
            </div>
            <div style={{ background: '#FFFDF5', padding: '20px', borderRadius: '20px', border: '1px dashed #800000' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>{editingCompId ? "Edit Issue" : "Raise New Issue"}</h4>
              <input placeholder="Subject" value={compForm.subject} onChange={e => setCompForm({...compForm, subject: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #DDD', boxSizing: 'border-box' }} />
              <textarea placeholder="Message" value={compForm.message} onChange={e => setCompForm({...compForm, message: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DDD', minHeight: '80px', boxSizing: 'border-box' }} />
              <label style={{display:'block', marginBottom:'5px', fontSize:'0.8rem', fontWeight:'bold'}}>ATTACH PHOTO (OPTIONAL)</label>
              <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} style={{marginBottom: '15px'}} />
              <button onClick={handleComplaintSubmit} style={{ width: '100%', marginTop: '15px', padding: '15px', background: '#800000', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>{editingCompId ? 'Update Complaint' : 'Submit Complaint'}</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HISTORY MODAL --- */}
      {/* --- ORDER SUMMARY / TOKEN MODAL --- */}
{(viewHistory || orderSummary) && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
    <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
      
      {viewHistory ? (
        /* --- HISTORY LIST VIEW --- */
        <div>
          <h2 style={{ textAlign: 'center', color: '#800000', marginBottom: '20px' }}>📜 Order History</h2>
          {history.length > 0 ?history.map(h => (
  <div 
    key={h._id} 
    onClick={() => { setOrderSummary(h); setViewHistory(false); }} 
    style={{ 
      padding: '15px', 
      borderBottom: '1px solid #F1F5F9', 
      cursor: 'pointer', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ fontWeight: 'bold', color: '#1E293B' }}>Token #{h.tokenNumber}</span>
      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
    </div>

    {/* --- DYNAMIC STATUS BADGE --- */}
    <div style={{ 
  fontSize: '0.65rem', 
  fontWeight: 'bold', 
  padding: '4px 12px', 
  borderRadius: '50px', 
  // GREEN for Ready, RED for Cancelled, YELLOW for everything else (Preparing/Running)
  background: h.status === 'Ready' ? '#DCFCE7' : (h.status === 'Cancelled' ? '#FEE2E2' : '#FEF3C7'),
  color: h.status === 'Ready' ? '#166534' : (h.status === 'Cancelled' ? '#991B1B' : '#92400E'),
  border: `1px solid ${h.status === 'Ready' ? '#BBF7D0' : (h.status === 'Cancelled' ? '#FECACA' : '#FDE68A')}`
}}>
  {(h.status || 'Preparing').toUpperCase()}
</div>

    <strong style={{ color: '#800000', fontSize: '1.1rem' }}>₹{h.totalAmount}</strong>
  </div>
)) : <p style={{ textAlign: 'center', color: '#94A3B8' }}>No past orders found.</p>}
        </div>
      ) : (
        /* --- ACTUAL TOKEN RECEIPT --- */
        <div id="printable-bill" style={{ fontFamily: "'Courier New', Courier, monospace", color: '#000' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 5px 0', letterSpacing: '2px' }}>RKV CANTEEN</h2>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', margin: '0 0 15px 0' }}>OFFICIAL DIGITAL TOKEN</p>
          
          <div style={{ borderTop: '2px dashed #000', borderBottom: '2px dashed #000', padding: '10px 0', margin: '10px 0', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date:</span> <span>{new Date(orderSummary.createdAt).toLocaleDateString('en-GB')}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Time:</span> <span>{new Date(orderSummary.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><span>Customer:</span> <span style={{ fontWeight: 'bold' }}>{orderSummary.userName}</span></div>
          </div>

          <div style={{ margin: '15px 0' }}>
            {orderSummary.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #000', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem' }}>
            <span>TOTAL AMOUNT</span>
            <span>₹{orderSummary.totalAmount}</span>
          </div>

          <div style={{ textAlign: 'center', margin: '25px 0', padding: '20px', background: '#F8FAFC', borderRadius: '20px' }}>
            <h1 style={{ margin: '0 0 10px 0', fontSize: '3rem', color: '#800000' }}>#{orderSummary.tokenNumber}</h1>
            <QRCodeCanvas value={orderSummary._id} size={180} includeMargin={true} level="H" />
            <div style={{ marginTop: '15px', fontSize: '0.65rem', color: '#64748B', wordBreak: 'break-all' }}>
              ORDER ID: {orderSummary._id}
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#94A3B8', fontStyle: 'italic' }}>
            Please show this QR or Order ID at the counter to collect your food.
          </p>
        </div>
      )}

      <button 
        onClick={() => {setOrderSummary(null); setViewHistory(false);}} 
        style={{ width: '100%', padding: '15px', background: '#800000', color: 'white', borderRadius: '15px', border: 'none', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        Close Receipt
      </button>
    </div>
  </div>
)}
    </div>
  );
};

export default Menu;