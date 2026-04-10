import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import API from '../../api';

const LiveOrders = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [scannedOrder, setScannedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewHistory, setViewHistory] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Responsive Check
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      await API.put(`/orders/status/${orderId}`, { status: 'Deleted', reason: reason });
      await API.post(`/orders/send-cancellation-email`, { email: userEmail, reason: reason, orderId: orderId });
      alert("✅ Order Cancelled and Email Sent!");
      fetchOrders(); 
    } catch (err) {
      alert("❌ Error: Status updated but email might have failed.");
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
      const scanner = new Html5QrcodeScanner("reader", { 
        fps: 10, 
        qrbox: isMobile ? 200 : 250 // Smaller box for mobile
      });
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
  }, [scannerOpen, isMobile]);

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
    o.status !== 'Collected' && o.status !== 'Deleted' 
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

  return (
    <div style={{ padding: isMobile ? '10px 5px' : '20px', background: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* HEADER SECTION */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '25px', 
        flexWrap: 'wrap', 
        gap: '10px' 
      }}>
        <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0, fontSize: isMobile ? '1.4rem' : '2rem' }}>Live Feed</h1>
        <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
          <input 
            placeholder="Search..." 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px', borderRadius: '12px', border: '1px solid #E2E8F0', flex: 1, minWidth: '0' }}
          />
          <button onClick={() => setViewHistory(!viewHistory)} style={{ background: '#800000', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
            {viewHistory ? "Live" : "History"}
          </button>
        </div>
      </div>

      {!viewHistory ? (
        /* LIVE ORDERS GRID */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '15px' 
        }}>
          {filteredLive.length > 0 ? filteredLive.map(order => (
            <div key={order._id} style={{ background: 'white', padding: '18px', borderRadius: '20px', border: `2px solid ${order.status === 'Ready' ? '#16A34A' : '#E2E8F0'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: 0, color: '#800000', fontSize: '1.5rem' }}>#{order.tokenNumber}</h2>
                <button onClick={() => handleDelete(order._id, order.userEmail)} style={{ border: 'none', background: '#FFF1F2', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>🗑️</button>
              </div>
              <p style={{ fontWeight: 'bold', margin: '10px 0', fontSize: '0.95rem' }}>{order.userName}</p>
              
              <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '15px' }}>
                {order.items.map((it, idx) => <div key={idx} style={{padding: '2px 0'}}>{it.name} <span style={{color: '#64748B'}}>x{it.quantity}</span></div>)}
              </div>
              
              {order.status === 'Ready' ? (
                <div style={{ textAlign: 'center', color: '#16A34A', fontWeight: 'bold', padding: '10px', border: '2px dashed #16A34A', borderRadius: '12px', fontSize: '0.8rem' }}>
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
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px' }}>
              <h3 style={{ color: '#94A3B8' }}>No active orders.</h3>
            </div>
          )}
        </div>
      ) : (
        /* HISTORY VIEW */
        <div style={{maxWidth: '100%', overflowX: 'hidden'}}>
          {Object.keys(groupedHistory).length > 0 ? Object.keys(groupedHistory).slice(0, 10).map(date => (
            <div key={date} style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#800000', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', margin: '20px 0 10px 0', fontSize: '0.9rem' }}>{date}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                {groupedHistory[date].map(h => (
                  <div key={h._id} style={{ background: 'white', padding: '12px', borderRadius: '15px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{fontSize: '0.9rem'}}>#{h.tokenNumber}</strong>
                      <small style={{ color: '#64748B', display: 'block', fontSize: '0.75rem' }}>{h.userName}</small>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <div style={{ fontWeight: 'bold', color: '#800000', fontSize: '0.9rem' }}>₹{h.totalAmount}</div>
                      <span style={{ fontSize: '0.55rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', background: h.status === 'Deleted' ? '#FEE2E2' : '#DBEAFE', color: h.status === 'Deleted' ? '#991B1B' : '#1E40AF' }}>
                        {h.status === 'Deleted' ? 'CANCEL' : 'COLLECTED'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : <div style={{ textAlign: 'center', padding: '50px' }}>No history found.</div>}
        </div>
      )}

      {/* SCANNER TRIGGER */}
      <button 
        onClick={() => setScannerOpen(true)}
        style={{ position: 'fixed', bottom: isMobile ? '90px' : '30px', right: '20px', width: '60px', height: '60px', borderRadius: '50%', background: '#800000', color: 'white', fontSize: '1.5rem', border: 'none', boxShadow: '0 8px 20px rgba(128,0,0,0.4)', zIndex: 1000 }}
      >
        📷
      </button>

      {/* OVERLAY MODAL */}
      {(scannerOpen || scannedOrder) && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px' }}>
          <div style={{ background: 'white', padding: isMobile ? '20px' : '30px', borderRadius: '25px', width: '100%', maxWidth: '400px' }}>
            {scannedOrder ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ background: '#F0FDF4', padding: '15px', borderRadius: '15px', border: '2px solid #16A34A', marginBottom: '15px' }}>
                  <h1 style={{ fontSize: '3rem', color: '#16A34A', margin: 0 }}>#{scannedOrder.tokenNumber}</h1>
                  <p style={{fontSize: '0.9rem'}}><strong>{scannedOrder.userName}</strong> verified.</p>
                </div>
                <div style={{ textAlign: 'left', marginBottom: '15px', fontSize: '0.85rem', maxHeight: '150px', overflowY: 'auto' }}>
                  {scannedOrder.items.map((it, i) => <div key={i} style={{borderBottom: '1px solid #eee', padding: '5px 0'}}>{it.name} x{it.quantity}</div>)}
                </div>
                <button onClick={() => handleStatusUpdate(scannedOrder._id, 'Collected')} style={{ width: '100%', padding: '15px', background: '#16A34A', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none' }}>COMPLETE ✅</button>
              </div>
            ) : (
              <div>
                <h4 style={{ textAlign: 'center', margin: '0 0 15px 0' }}>Handover Scanner</h4>
                <div id="reader" style={{ borderRadius: '12px', overflow: 'hidden', width: '100%' }}></div>
                <div style={{ marginTop: '15px', display: 'flex', gap: '8px' }}>
                  <input id="manualInput" placeholder="Order ID..." style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #DDD', fontSize: '0.85rem' }} />
                  <button onClick={fetchManual} style={{ background: '#800000', color: 'white', border: 'none', padding: '0 12px', borderRadius: '8px', fontSize: '0.85rem' }}>Fetch</button>
                </div>
              </div>
            )}
            <button onClick={() => { setScannerOpen(false); setScannedOrder(null); }} style={{ width: '100%', marginTop: '15px', color: '#94A3B8', background: 'none', border: 'none', fontSize: '0.9rem' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOrders;