import { auth } from '../firebase';
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";

import SpecialOrders from '../components/SpecialOrders';
import AnnouncementModal from '../components/AnnouncementModal';
import SupportModal from '../components/SupportModal';
import HistoryModal from '../components/HistoryModal';
import CartDrawer from '../components/CartDrawer';

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

  const checkFoodStatus = (item) => {
      const hour = new Date().getHours();
      
      // 1. Admin Manual Kill-Switch (from your FoodItem.js schema)
      if (item.isAvailable === false) return { canOrder: false, reason: "Sold Out" };

      // 2. Admin Force Override
      if (item.availabilityMode === 'Force Available') return { canOrder: true, reason: "" };

      // 3. Automated Time Logic
      const timings = {
          'Breakfast': { start: 7, end: 11 },
          'Lunch':     { start: 12, end: 15 },
          'Snacks':    { start: 16, end: 22 } // Adjusted to 10 PM for snacks
      };

      const window = timings[item.category];
      if (window) {
          if (hour >= window.start && hour < window.end) {
              return { canOrder: true, reason: "" };
          } else {
              return { canOrder: false, reason: `Starts at ${window.start}:00` };
          }
      }
      return { canOrder: true, reason: "" };
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


  // --- ACTIONS ---
  const addToCart = (item) => {
    const exists = cart.find(i => i._id === item._id);
    if (exists) setCart(cart.map(i => i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i));
    else setCart([...cart, { ...item, quantity: 1 }]);
  };
  const updateQty = (id, delta) => setCart(prev => prev.map(item => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const removeFromCart = (id) => setCart(cart.filter(item => item._id !== id));

  // 1. Unified Sync Function
  const syncHistory = async () => {
    // DEBUG: If you see "EMAIL IS EMPTY" in F12 console, this is the bug!
    if (!userDetails.email) {
      console.log("CANNOT SYNC: EMAIL IS EMPTY");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:5000/api/orders/user/${userDetails.email}`);
      console.log("DATABASE RESPONDED WITH:", res.data);
      
      if (res.data && Array.isArray(res.data)) {
        setHistory(res.data);
        // This puts the REAL database data (Collected/Pending) back into storage
        localStorage.setItem('orderHistory', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error("FETCH FAILED:", err);
    }
  };

  // Ensure this runs whenever the userDetails (email) changes
  useEffect(() => {
    syncHistory();
  }, [userDetails.email]);

  // Add this near your other useEffects
  useEffect(() => {
    // If you use Firebase auth, get the email like this:
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserDetails(prev => ({ ...prev, email: user.email, name: user.displayName || prev.name }));
      }
    });
    return () => unsubscribe();
  }, []);

// 2. The Place Order Fix
  const handlePlaceOrder = async () => {
    if (!userDetails.name || !userDetails.email || !userDetails.dorm) return alert("Fill all details!");
    
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const orderPayload = { 
      items: cart.map(i => ({ name: i.name, quantity: i.quantity, price: i.price })), 
      totalAmount: total, 
      userName: userDetails.name, 
      userEmail: userDetails.email, // Ensure this matches Admin handleDelete
      dorm: userDetails.dorm, 
      paymentMethod: userDetails.method 
    };

    try {
      const res = await axios.post('http://localhost:5000/api/orders/place', orderPayload);
      // Add the new order to the top of history immediately
      setHistory(prev => [res.data, ...prev]);
      setOrderSummary(res.data);
      setCart([]);
      setShowCart(false);
      setCheckoutStep(1);
      // Force a sync to make sure everything is aligned
      syncHistory();
    } catch (err) {
      alert("Order Failed!");
    }
  };

// Unified Polling Effect

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

      <div style={{ padding: '20px', zIndex: 10, maxWidth: '1100px', margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
        <SpecialOrders />

        {!activeCategory ? (
          /* --- CATEGORY SELECTION VIEW --- */
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
          /* --- FILTERED ITEMS VIEW --- */
          <div>
            <button onClick={() => setActiveCategory(null)} style={{ background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', marginBottom: '30px', fontWeight: 'bold' }}>⬅ Back to Categories</button>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
              {items.filter(i => i.category === activeCategory).map(item => {
                // 1. RUN THE AVAILABILITY CHECK FOR EACH ITEM
                const { canOrder, reason } = checkFoodStatus(item);

                return (
                  <div key={item._id} style={{ 
                    background: 'white', 
                    borderRadius: '25px', 
                    overflow: 'hidden', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    position: 'relative', // CRITICAL: This anchors the "Locked" badge to the card
                    opacity: canOrder ? 1 : 0.6,
                    filter: canOrder ? 'none' : 'grayscale(1)'
                  }}>
                    {/* 2. THE FLOATING BADGE (Only shows when locked) */}
                    {!canOrder && (
                      <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#800000', color: 'white', padding: '6px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 5, boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
                        {reason}
                      </div>
                    )}

                    <img src={item.image || 'https://via.placeholder.com/300x200?text=No+Image'} style={{ width: '100%', height: '200px', objectFit: 'cover' }} alt="" />
                    
                    <div style={{ padding: '20px' }}>
                      <h3 style={{ margin: '0 0 15px 0', fontSize: '1.2rem' }}>{item.name}</h3>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#800000', fontWeight: '900', fontSize: '1.6rem' }}>₹{item.price}</span>
                        
                        {/* 3. THE SMART BUTTON */}
                        <button 
                          disabled={!canOrder}
                          onClick={() => addToCart(item)} 
                          style={{ 
                            background: canOrder ? '#800000' : '#94A3B8', 
                            color: 'white', 
                            border: 'none', 
                            padding: '12px 25px', 
                            borderRadius: '15px', 
                            fontWeight: 'bold', 
                            cursor: canOrder ? 'pointer' : 'not-allowed' 
                          }}
                        >
                          {canOrder ? 'Add +' : 'Locked'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: '30px', left: '20px', zIndex: 1500, background: 'linear-gradient(135deg, #800000, #4a0000)', color: 'white', padding: '10px 20px', borderRadius: '20px', textAlign: 'center', boxShadow: '0 15px 40px rgba(128,0,0,0.4)', border: '3px solid #FFD700' }}>
        <p style={{ margin: 0, fontSize: '0.6rem', fontWeight: 'bold', opacity: 0.9 }}>NOW SERVING</p>
        <h1 style={{ margin: 0, fontSize: '2.0rem', fontWeight: '900' }}>{currentServing || '--'}</h1>
      </div>

    <AnnouncementModal 
      isOpen={openAnnounce} 
      onClose={() => setOpenAnnounce(false)} 
      announcement={announcement} 
    />

    <SupportModal 
      isOpen={showComplaint} 
      onClose={() => { setShowComplaint(false); setEditingCompId(null); setCompForm({subject:'', message:''}); }}
      complaints={myComplaints}
      form={compForm}
      setForm={setCompForm}
      onSubmit={handleComplaintSubmit}
      onEdit={(c) => { setCompForm(c); setEditingCompId(c._id); }}
      onRevoke={deleteMyComplaint}
      onFileChange={(e) => setSelectedFile(e.target.files[0])}
      isEditing={!!editingCompId}
    />

    <CartDrawer 
      isOpen={showCart} 
      onClose={() => { setShowCart(false); setCheckoutStep(1); }}
      cart={cart}
      updateQty={updateQty}
      removeFromCart={removeFromCart}
      checkoutStep={checkoutStep}
      setCheckoutStep={setCheckoutStep}
      userDetails={userDetails}
      setUserDetails={setUserDetails}
      onPlaceOrder={handlePlaceOrder}
    />

  <HistoryModal 
    isOpen={viewHistory || !!orderSummary}
    onClose={() => { setOrderSummary(null); setViewHistory(false); }}
    viewHistory={viewHistory}
    setViewHistory={setViewHistory}
    history={history}
    orderSummary={orderSummary}
    setOrderSummary={setOrderSummary}
  />
    </div>
  );
};

export default Menu;