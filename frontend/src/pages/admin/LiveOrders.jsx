import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../api';
import axios from 'axios';

const LiveOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewHistory, setViewHistory] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);


  const fetchOrders = async () => {
    try {
      const res = await API.get('/orders/all');
      setAllOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Database Fetch Error:", err); }
  };


  const handleDelete = async (orderId, userEmail) => {
    const reason = window.prompt("Reason for cancellation (will be emailed to student):");
    if (!reason) return;

    try {
      await API.put(`/orders/status/${orderId}`, { 
        status: 'Deleted',
        reason: reason 
      });

      await API.post(`/orders/send-cancellation-email`, {
        email: userEmail,
        reason: reason,
        orderId: orderId
      });

      alert("✅ Order Cancelled and Email Sent!");
      fetchOrders(); 
    } catch (err) {
      console.error(err);
      alert("❌ Error: Order status updated but email might have failed.");
      fetchOrders(); 
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scannerOpen) {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render(async (decodedText) => {
        try {
          const res = await API.get(`/orders/${decodedText}`);
          setScannedOrder(res.data);
          scanner.clear();
          setScannerOpen(false);
        } catch (e) { alert("Invalid QR Code or Order ID"); }
      }, (err) => {});
      return () => scanner.clear();
    }
  }, [scannerOpen]);


  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await API.put(`/orders/status/${id}`, { status: newStatus });
      fetchOrders(); 
      if (newStatus === 'Ready') alert("✅ Order Ready & Email Sent!");
      if (newStatus === 'Collected') {
        setScannedOrder(null);
        alert("✅ Food Delivered!");
      }
    } catch (err) { alert("❌ Action failed."); }
  };



const handleDeleteOrder = async (id) => {
  const reason = window.prompt("Enter reason for cancellation (sent to student email):");
    if (reason) {
        try {
            await API.put(`/orders/status/${id}`, { 
                status: 'Deleted',
                reason: reason 
            });
            alert("Order marked as Deleted and Student notified.");
            fetchOrders(); 
        } catch (err) { alert("Action failed."); }
    }
  };


  <button onClick={() => handleDeleteOrder(order._id)} style={{ color: 'red' }}>
    🗑️ Cancel Order
  </button>

  const fetchManual = async () => {
    const id = document.getElementById('manualInput').value;
    if(!id) return;
    try {
      const res = await API.get(`/orders/${id}`);
      setScannedOrder(res.data);
      setScannerOpen(false);
    } catch (e) { alert("ID not found"); }
  };

  const todayStr = new Date().toDateString();

  const liveStream = allOrders.filter(o => 
    new Date(o.createdAt).toDateString() === todayStr && 
    o.status !== 'Collected' && 
    o.status !== 'Deleted' 
  );

  const filteredLive = liveStream.filter(o => 
    o.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    String(o.tokenNumber).includes(searchTerm)
  );

const groupedHistory = allOrders
  .filter(o => o.status === 'Collected' || o.status === 'Deleted') 
  .reduce((groups, order) => {
    const date = new Date(order.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(order);
    return groups;
  }, {});

  const markAsReady = async (orderId) => {
    await API.put(`/orders/update/${orderId}`, { status: 'Ready' });
  };

  return (
    <div style={{ padding: '20px', background: '#F8FAFC', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0 }}>Live Canteen Feed</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            placeholder="Search Token/Name..." 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '12px 15px', borderRadius: '12px', border: '1px solid #E2E8F0', width: '200px' }}
          />
          <button onClick={() => setViewHistory(!viewHistory)} style={{ background: '#800000', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
            {viewHistory ? "View Live" : "Past 10 Days"}
          </button>
        </div>
      </div>

      {!viewHistory ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredLive.length > 0 ? filteredLive.map(order => (
            <div key={order._id} style={{ background: 'white', padding: '20px', borderRadius: '25px', border: `2px solid ${order.status === 'Ready' ? '#16A34A' : '#E2E8F0'}`, boxShadow: '0 10px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 style={{ margin: 0, color: '#800000' }}>#{order.tokenNumber}</h2>
                <button onClick={() => handleDelete(order._id, order.userEmail)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
              </div>
              <p style={{ fontWeight: 'bold', margin: '10px 0' }}>{order.userName}</p>
              
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', fontSize: '0.9rem', marginBottom: '15px' }}>
                {order.items.map((it, idx) => <div key={idx}>{it.name} x{it.quantity}</div>)}
              </div>
              {order.status === 'Ready' ? (
                <div style={{ textAlign: 'center', color: '#16A34A', fontWeight: 'bold', padding: '12px', border: '1px solid #16A34A', borderRadius: '12px' }}>
                  WAITING FOR SCAN...
                </div>
              ) : (
                <button 
                  onClick={() => handleStatusUpdate(order._id, 'Ready')} 
                  style={{ width: '100%', padding: '12px', background: '#F59E0B', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Mark Ready 🔔
                </button>
              )}
            </div>
          )) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px' }}>
              <img src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" style={{ width: '120px', opacity: 0.2 }} alt="" />
              <h3 style={{ color: '#94A3B8' }}>No active orders for now.</h3>
            </div>
          )}
        </div>
      ) : (
      <div>
        {Object.keys(groupedHistory).length > 0 ? Object.keys(groupedHistory).slice(0, 10).map(date => (
          <div key={date} style={{ marginBottom: '30px' }}>
            <h3 style={{ color: '#800000', borderBottom: '2px solid #EEE', paddingBottom: '10px' }}>{date}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', marginTop: '15px' }}>
              {groupedHistory[date].map(h => (
                <div key={h._id} style={{ background: 'white', padding: '15px', borderRadius: '15px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Token #{h.tokenNumber}</strong>
                    
                    {/* STATUS BADGE FOR ADMIN HISTORY */}
                    <span style={{ 
                      fontSize: '0.6rem', 
                      padding: '4px 8px', 
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      background: h.status === 'Deleted' ? '#FEE2E2' : '#DBEAFE',
                      color: h.status === 'Deleted' ? '#991B1B' : '#1E40AF'
                    }}>
                      {h.status === 'Deleted' ? 'CANCELLED' : 'COLLECTED'}
                    </span>
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    <small style={{ color: '#64748B', display: 'block' }}>{h.userName}</small>
                    <strong style={{ color: '#800000' }}>₹{h.totalAmount}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '100px' }}><h3>No history records found.</h3></div>
        )}
      </div>
            )}
      <button 
        onClick={() => setScannerOpen(true)}
        style={{ position: 'fixed', bottom: '30px', right: '30px', width: '70px', height: '70px', borderRadius: '50%', background: '#800000', color: 'white', fontSize: '1.8rem', border: 'none', boxShadow: '0 10px 30px rgba(128,0,0,0.4)', cursor: 'pointer', zIndex: 1000 }}
      >
        📷
      </button>
      {scannerOpen || scannedOrder ? (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '450px', position: 'relative' }}>
            
            {scannedOrder ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#F0FDF4', padding: '20px', borderRadius: '20px', border: '2px solid #16A34A', marginBottom: '20px' }}>
                  <h1 style={{ fontSize: '4rem', color: '#16A34A', margin: 0 }}>#{scannedOrder.tokenNumber}</h1>
                  <p><strong>{scannedOrder.userName}</strong> verified.</p>
                </div>
                <div style={{ textAlign: 'left', marginBottom: '20px' }}>
                  {scannedOrder.items.map((it, i) => <div key={i}>{it.name} x{it.quantity}</div>)}
                </div>
                <button onClick={() => handleStatusUpdate(scannedOrder._id, 'Collected')} style={{ width: '100%', padding: '18px', background: '#16A34A', color: 'white', borderRadius: '15px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>COMPLETE HANDOVER ✅</button>
              </div>
            ) : (
              <div>
                <h3 style={{ textAlign: 'center', margin: '0 0 20px 0' }}>Handover Scanner</h3>
                <div id="reader" style={{ borderRadius: '15px', overflow: 'hidden' }}></div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <input id="manualInput" placeholder="Order ID..." style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid #DDD' }} />
                  <button onClick={fetchManual} style={{ background: '#800000', color: 'white', border: 'none', padding: '0 15px', borderRadius: '10px' }}>Fetch</button>
                </div>
              </div>
            )}
            
            <button onClick={() => { setScannerOpen(false); setScannedOrder(null); }} style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      ) : null}

    </div>
  );
};

export default LiveOrders;