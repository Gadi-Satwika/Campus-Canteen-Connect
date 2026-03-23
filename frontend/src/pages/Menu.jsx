import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react'; // New!

const Menu = () => {
  const [items, setItems] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null); // Stores the current QR info

  useEffect(() => {
    axios.get('http://localhost:5000/api/food/menu').then(res => setItems(res.data));
  }, []);

  const handleOrder = async (item) => {
    const userId = "r210713@rguktrkv.ac.in"; // You'll replace this with auth.currentUser.email later
    try {
      const res = await axios.post('http://localhost:5000/api/orders/place', {
        itemId: item._id,
        userId: userId,
        quantityRequested: 1
      });
      setActiveOrder(res.data.order); // This triggers the QR Modal
    } catch (err) {
      alert("Out of stock!");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Campus Canteen Menu</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {items.map(item => (
          <div key={item._id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '15px', textAlign: 'center' }}>
            <h3>{item.name}</h3>
            <p style={{ fontWeight: 'bold', color: '#800000' }}>₹{item.price}</p>
            <button 
              onClick={() => handleOrder(item)}
              style={{ background: '#800000', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}
            >
              Order Now
            </button>
          </div>
        ))}
      </div>

      {/* THE QR MODAL - This pops up after ordering */}
      {activeOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '20px', textAlign: 'center' }}>
            <h2 style={{ color: '#800000' }}>Order Confirmed!</h2>
            <p>Show this QR at the counter</p>
            <div style={{ margin: '20px' }}>
              <QRCodeCanvas value={`OTP:${activeOrder.otp}`} size={200} />
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>OTP: {activeOrder.otp}</p>
            <button onClick={() => setActiveOrder(null)} style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '8px', border: '1px solid #ddd', cursor: 'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;