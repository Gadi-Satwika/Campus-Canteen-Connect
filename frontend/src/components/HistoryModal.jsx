import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const HistoryModal = ({ isOpen, onClose, viewHistory, setViewHistory, history, orderSummary, setOrderSummary }) => {
  if (!isOpen) return null;

  const getStatusLabel = (status) => {
    const s = status ? status.toLowerCase() : 'preparing';
    if (s === 'collected' || s === 'delivered' || s === 'done') return { text: 'DELIVERED', color: '#1E40AF', bg: '#DBEAFE' };
    if (s === 'ready') return { text: 'READY', color: '#166534', bg: '#DCFCE7' };
    if (s === 'deleted' || s === 'cancelled') return { text: 'CANCELLED', color: '#991B1B', bg: '#FEE2E2' };
    return { text: 'PREPARING', color: '#92400E', bg: '#FEF3C7' };
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '400px', maxHeight: '90vh', overflowY: 'auto' }}>
        
        {viewHistory ? (
          <div>
            <h2 style={{ textAlign: 'center', color: '#800000', marginBottom: '20px' }}>📜 Order History</h2>
            {history.length > 0 ? history.map(h => {
                const label = getStatusLabel(h.status);
                return (
                    <div key={h._id} onClick={() => { setOrderSummary(h); setViewHistory(false); }} style={{ padding: '15px', borderBottom: '1px solid #F1F5F9', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontWeight: 'bold' }}>Token #{h.tokenNumber}</span>
                            <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div style={{ fontSize: '0.65rem', fontWeight: 'bold', padding: '5px 12px', borderRadius: '50px', background: label.bg, color: label.color, minWidth: '85px', textAlign: 'center' }}>
                            {label.text}
                        </div>
                        <strong style={{ color: '#800000' }}>₹{h.totalAmount}</strong>
                    </div>
                );
            }) : <p style={{textAlign:'center', color:'#94A3B8'}}>No orders yet.</p>}
          </div>
        ) : (
          /* Receipt View (Keep your current logic here) */
          <div style={{ fontFamily: 'monospace' }}>
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
      </div>
    </div>
  );
};

export default HistoryModal;