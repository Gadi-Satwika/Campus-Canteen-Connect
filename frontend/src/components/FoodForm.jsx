import React, { useState } from 'react';
import axios from 'axios';

const FoodForm = () => {
  // 1. FIXED: Added 'image' to the state so it's not undefined
  const [food, setFood] = useState({ 
    name: '', 
    price: '', 
    image: '', // Added this
    category: 'Snacks', 
    quantity: 10 
  });

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' };
  const btnStyle = { width: '100%', padding: '14px', backgroundColor: '#800000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 2. FIXED: Including 'image' in the payload sent to backend
      const response = await axios.post('http://localhost:5000/api/food/add', {
        name: food.name,
        price: Number(food.price),
        image: food.image, // Now correctly sending the URL string
        category: food.category,
        quantity: Number(food.quantity)
      });

      if (response.status === 201 || response.status === 200) {
        alert(`${food.name} successfully published!`);
        // 3. FIXED: Resetting the image field as well
        setFood({ name: '', price: '', category: 'Snacks', image: '', quantity: 10 });
        
        // 4. OPTIONAL: Refresh page to show the new item in the list immediately
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Axios Error Detail:", err.response || err);
      alert("Backend Error: Check if server.js is running.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>FOOD NAME</label>
      <input type="text" placeholder="e.g. Samosa" style={inputStyle} value={food.name} onChange={(e)=>setFood({...food, name: e.target.value})} required />
      
      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>PRICE (₹)</label>
      <input type="number" placeholder="0" style={inputStyle} value={food.price} onChange={(e)=>setFood({...food, price: e.target.value})} required />

      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>CATEGORY</label>
      <select 
        style={inputStyle} 
        value={food.category} 
        onChange={(e) => setFood({...food, category: e.target.value})}
      >
        <option value="Breakfast">Breakfast</option>
        <option value="Lunch">Lunch</option>
        <option value="Snacks">Snacks</option>
      </select>

      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>ITEM IMAGE URL</label>
      <input 
        type="text"
        placeholder="e.g. https://images.com/dosa.jpg" 
        style={inputStyle}
        value={food.image} // Added value binding
        onChange={(e) => setFood({...food, image: e.target.value})} // Fixed: now updates state correctly
        required 
      />
      
      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>STOCK QUANTITY</label>
      <input type="number" style={inputStyle} value={food.quantity} onChange={(e)=>setFood({...food, quantity: e.target.value})} required />
      
      <button type="submit" style={btnStyle}>Publish to Student Menu</button>
    </form>
  );
};

export default FoodForm;