import React, { useState } from 'react';
import axios from 'axios';
import API from '../api'
import { QRCodeCanvas } from 'qrcode.react';


const HistoryModal = ({ isOpen, onClose, viewHistory, setViewHistory, history, orderSummary, setOrderSummary, fetchHistory }) => {
  const [ratingData, setRatingData] = useState(null);
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const userDetails = JSON.parse(localStorage.getItem('user'));

  const getStatusLabel = (status) => {
    const s = status ? String(status).toLowerCase() : 'preparing';
    if (s === 'ready') return { text: 'READY', color: '#166534', bg: '#DCFCE7' };
    if (s === 'collected' || s === 'delivered' || s === 'done') return { text: 'DELIVERED', color: '#1E40AF', bg: '#DBEAFE' };
    if (s === 'deleted' || s === 'cancelled') return { text: 'CANCELLED', color: '#991B1B', bg: '#FEE2E2' };
    return { text: 'PREPARING', color: '#92400E', bg: '#FEF3C7' };
  };

  const openRatingModal = (e, h) => {
    e.stopPropagation(); 
    setRatingData(h);
    setScore(5);
    setComment("");
  };

  const submitReview = async () => {
    try {
        if (!ratingData || !ratingData.items) return;
        const uniqueItems = [];
        const seenIds = new Set();

        ratingData.items.forEach(item => {
            const targetId = item.foodId || item._id;
            if (targetId && !seenIds.has(targetId)) {
                seenIds.add(targetId);
                uniqueItems.push(item);
            }
        });

        const ratingPromises = uniqueItems.map(async (item) => {
            const targetId = item.foodId || item._id;
            
            try {
                return await API.post(`/food/rate/${targetId}`, {
                    rating: score,
                    comment: comment,
                    userName: userDetails?.name || "Student",
                    orderId: ratingData._id 
                });
            } catch (err) {
                if (err.response?.status === 404) {
                    console.warn(`Skipping deleted item: ${item.name}`);
                    return; 
                }
                throw err;
            }
        });

        await Promise.allSettled(ratingPromises);
        
        alert("Review Submitted! ⭐");
        setRatingData(null);

        if (typeof fetchHistory === 'function') {
            fetchHistory();
        } else {
            window.location.reload(); 
        }
        
    } catch (err) {
        console.error("Submit Error:", err);
        alert("Rating failed. Please try again.");
    }
};

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {viewHistory ? (
          <div>
            <h2 style={{ textAlign: 'center', color: '#800000', marginBottom: '20px' }}>📜 Order History</h2>
            {history.length > 0 ? history.map(h => {
                const label = getStatusLabel(h.status);
                const isCollected = h.status?.toLowerCase() === 'collected';
                return (
                    <div key={h._id} onClick={() => { setOrderSummary(h); setViewHistory(false); }} style={{ padding: '15px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 'bold' }}>Token #{h.tokenNumber}</span>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                            <div style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '5px 12px', borderRadius: '50px', background: label.bg, color: label.color }}>
                                {label.text}
                            </div>
                            
                            {isCollected && !h.isRated && (
                                <button 
                                    onClick={(e) => openRatingModal(e, h)}
                                    style={{ background: '#FFD700', color: '#000', border: 'none', padding: '5px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                                >
                                    ⭐ Rate Now
                                </button>
                            )}
                        </div>
                    </div>
                );
            }) : <p style={{textAlign:'center', color:'#94A3B8'}}>No orders yet.</p>}
          </div>
        ) : (
          <div style={{ fontFamily: 'monospace' }}>
            {/* ... Receipt View remains the same ... */}
            <h2 style={{ textAlign: 'center' }}>RKV CANTEEN</h2>
            <hr style={{ borderTop: '2px dashed #000' }} />
            <div style={{ fontSize: '0.9rem', margin: '10px 0' }}>
               <div>Customer: <b>{orderSummary?.userName}</b></div>
               <div>Time: {orderSummary ? new Date(orderSummary.createdAt).toLocaleTimeString() : ''}</div>
            </div>
            {orderSummary?.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid #000', marginTop: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
              <span>TOTAL</span><span>₹{orderSummary?.totalAmount}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <h1 style={{ color: '#800000', fontSize: '3rem' }}>#{orderSummary?.tokenNumber}</h1>
              {orderSummary && <QRCodeCanvas value={orderSummary._id} size={180} />}
            </div>
          </div>
        )}

        <button onClick={onClose} style={{ width: '100%', padding: '15px', background: '#800000', color: 'white', borderRadius: '15px', border: 'none', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
          Close
        </button>

        {/* --- RATING POPUP OVERLAY --- */}
        {ratingData && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ background: 'white', width: '100%', maxWidth: '400px', borderRadius: '25px', padding: '30px', textAlign: 'center' }}>
                    <h3 style={{ color: '#800000', margin: '0 0 10px 0' }}>Rate Your Meal</h3>
                    <div style={{ fontSize: '2rem', margin: '20px 0', display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <span key={star} onClick={() => setScore(star)} style={{ cursor: 'pointer', color: star <= score ? '#F59E0B' : '#CBD5E1' }}>★</span>
                        ))}
                    </div>
                    <textarea 
                        placeholder="Any comments? (Optional)" 
                        value={comment} 
                        onChange={(e) => setComment(e.target.value)} 
                        style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', height: '80px', marginBottom: '20px' }} 
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => setRatingData(null)} style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none' }}>Cancel</button>
                        <button onClick={submitReview} style={{ flex: 2, padding: '12px', background: '#800000', color: 'white', borderRadius: '12px', border: 'none' }}>Submit Review</button>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryModal;