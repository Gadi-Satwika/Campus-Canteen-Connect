import React from 'react';

const CartDrawer = ({ isOpen, onClose, cart, updateQty, removeFromCart, checkoutStep, setCheckoutStep, userDetails, setUserDetails, onPlaceOrder }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 4000, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(5px)' }}>
      <div style={{ width: '100%', maxWidth: '450px', background: 'white', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#800000', margin: 0 }}>{checkoutStep === 1 ? '🛒 Your Cart' : 'Checkout'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '2.5rem', cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>

        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '50px' }}><h3>Cart is empty</h3></div>
        ) : (
          checkoutStep === 1 ? (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {cart.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px', background: '#F8FAFC', borderRadius: '15px', marginBottom: '10px' }}>
                  <div><strong>{item.name}</strong><br/>₹{item.price * item.quantity}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button onClick={() => updateQty(item._id, -1)}>-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item._id, 1)}>+</button>
                    <button onClick={() => removeFromCart(item._id)} style={{ color: 'red', border: 'none', background: 'none' }}>🗑️</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setCheckoutStep(2)} style={{ width: '100%', marginTop: '20px', padding: '15px', background: '#800000', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>Proceed</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input placeholder="Name" value={userDetails.name} onChange={e => setUserDetails({...userDetails, name: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DDD' }} />
              {/* --- EMAIL INPUT (FIXED) --- */}
                <input 
                  type="email"
                  placeholder="Email Address" 
                  value={userDetails.email} 
                  readOnly
                  style={{ 
                    padding: '12px', 
                    borderRadius: '10px', 
                    border: '1px solid #DDD',
                    width: '100%',
                    boxSizing: 'border-box'
                  }} 
                />
              <input placeholder="Dorm/Block" value={userDetails.dorm} onChange={e => setUserDetails({...userDetails, dorm: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #DDD' }} />
              <button onClick={onPlaceOrder} style={{ padding: '15px', background: '#16A34A', color: 'white', borderRadius: '12px', fontWeight: 'bold' }}>Confirm & Pay</button>
              <button onClick={() => setCheckoutStep(1)} style={{ background: 'none', border: 'none', color: '#64748B' }}>Back to Cart</button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CartDrawer;