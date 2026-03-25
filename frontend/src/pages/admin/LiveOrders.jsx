import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';

const LiveOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. DATABASE FETCH: Always stays in sync with MongoDB
  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/all');
      setAllOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Database Fetch Error:", err); }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000); 

    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(async (decodedText) => {
      try {
        const res = await axios.get(`http://localhost:5000/api/orders/${decodedText}`);
        setScannedOrder(res.data);
      } catch (e) { alert("Invalid QR Code or Order ID"); }
    }, (err) => {});

    return () => { clearInterval(interval); scanner.clear(); };
  }, []);

  // 2. STATUS LOGIC: Transitioning through the lifecycle
  const handleStatusUpdate = async (id, newStatus) => {
  // Add a simple loading alert or toast
    if (newStatus === 'Ready') {
      console.log("Sending mail... please wait.");
    }

    try {
      const res = await axios.put(`http://localhost:5000/api/orders/status/${id}`, { status: newStatus });
      fetchOrders(); 

      if (newStatus === 'Ready') {
        alert("✅ Order marked as Ready & Notification Email sent!");
      }
      
      if (newStatus === 'Collected') {
        setScannedOrder(null);
        alert("✅ Food Delivered Successfully!");
      }
    } catch (err) { 
      alert("❌ Action failed. Check your internet or backend terminal."); 
    }
  };

  // 3. DELETE LOGIC: For manual cleanup
  const handleDelete = async (id) => {
    if (window.confirm("Delete this order record permanently?")) {
      try {
        await axios.delete(`http://localhost:5000/api/orders/${id}`);
        fetchOrders();
        if (scannedOrder?._id === id) setScannedOrder(null);
      } catch (err) { alert("Delete failed"); }
    }
  };

  // 4. MANUAL FETCH: For when the camera isn't an option
  const fetchManual = async () => {
    const id = document.getElementById('manualInput').value;
    if(!id) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/orders/${id}`);
      setScannedOrder(res.data);
    } catch (e) { alert("ID not found"); }
  };

  // 5. FILTERING: Splitting Today into "Live" and "History"
  const today = new Date().toDateString();
  
  const liveStream = allOrders.filter(o => 
    new Date(o.createdAt).toDateString() === today && o.status !== 'Collected'
  );

  const collectedHistory = allOrders.filter(o => 
    new Date(o.createdAt).toDateString() === today && o.status === 'Collected'
  );

  const filteredLive = liveStream.filter(o => 
    o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(o.tokenNumber).includes(searchTerm)
  );

  return (
    <div style={{ padding: '30px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      {/* --- TOP: SCANNER & ACTIVE TRANSACTION --- */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px', marginBottom: '50px' }}>
        
        <div style={{ background: 'white', padding: '25px', borderRadius: '30px', border: '1px solid #E2E8F0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginTop: 0 }}>Terminal 01: Final Handover</h3>
          <div id="reader"></div>
          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <input id="manualInput" placeholder="Enter Order ID Manually..." style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #DDD' }} />
            <button onClick={fetchManual} style={{ background: '#800000', color: 'white', border: 'none', padding: '0 20px', borderRadius: '12px', cursor: 'pointer' }}>Fetch</button>
          </div>
        </div>

        <div style={{ background: scannedOrder ? '#F0FDF4' : '#FFFDF5', padding: '30px', borderRadius: '30px', border: `2px ${scannedOrder ? 'solid #16A34A' : 'dashed #800000'}`, minHeight: '350px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {scannedOrder ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, color: '#16A34A', fontSize: '3.5rem' }}>#{scannedOrder.tokenNumber}</h1>
                <span style={{ padding: '8px 20px', background: '#16A34A', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}>VERIFIED</span>
              </div>
              <p style={{ fontSize: '1.2rem', margin: '15px 0' }}><strong>{scannedOrder.userName}</strong> is at the counter.</p>
              
              <div style={{ background: 'white', padding: '15px', borderRadius: '15px', marginBottom: '20px', border: '1px solid #DCFCE7' }}>
                {scannedOrder.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleStatusUpdate(scannedOrder._id, 'Collected')} 
                style={{ width: '100%', padding: '20px', background: '#16A34A', color: 'white', border: 'none', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                CONFIRM COLLECTION ✅
              </button>
              <button onClick={() => setScannedOrder(null)} style={{ width: '100%', marginTop: '10px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>Clear Screen</button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#94A3B8' }}>
              <span style={{ fontSize: '4rem' }}>📸</span>
              <p>Ready to hand over food? Scan student QR now.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- MIDDLE: SEARCH & LIVE PREPARATION LIST --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ color: '#1E293B', margin: 0 }}>Orders Received</h2>
        <input 
          placeholder="Search Token or Student..." 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '12px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', width: '300px' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '20px' }}>
        {filteredLive.map(order => (
          <div key={order._id} style={{ 
            background: 'white', padding: '25px', borderRadius: '30px', 
            border: `2px solid ${order.status === 'Ready' ? '#16A34A' : '#E2E8F0'}`,
            boxShadow: '0 10px 20px rgba(0,0,0,0.02)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h4 style={{ margin: 0 }}>{order.userName}</h4>
                <small style={{ color: '#94A3B8' }}>Ordered: {new Date(order.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</small>
              </div>
              <button onClick={() => handleDelete(order._id)} style={{ background: '#F1F5F9', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer' }}>🗑️</button>
            </div>

            <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '15px', margin: '15px 0' }}>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '15px' }}>
              <h1 style={{ margin: 0, color: '#800000', fontSize: '2.5rem' }}>#{order.tokenNumber}</h1>
              {order.status === 'Preparing' ? (
                <button onClick={() => handleStatusUpdate(order._id, 'Ready')} style={{ background: '#F59E0B', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Mark Ready 🔔</button>
              ) : (
                <span style={{ color: '#16A34A', fontWeight: 'bold' }}>WAITING FOR SCAN</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- BOTTOM: TODAY'S HISTORY --- */}
      <div style={{ marginTop: '60px', padding: '40px 0', borderTop: '2px dashed #E2E8F0' }}>
        <h2 style={{ color: '#94A3B8', marginBottom: '30px' }}>Today's Handover History</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', opacity: 0.7 }}>
          {collectedHistory.map(order => (
            <div key={order._id} style={{ background: '#F1F5F9', padding: '20px', borderRadius: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ display: 'block' }}>{order.userName}</strong>
                <h3 style={{ margin: 0 }}>#{order.tokenNumber}</h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#16A34A', fontWeight: 'bold' }}>✓ COLLECTED</span>
              <button onClick={() => handleDelete(order._id)} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid #CBD5E1', color: '#94A3B8', padding: '5px', borderRadius: '8px', cursor: 'pointer' }}>Delete Record</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveOrders;