import React, { useState } from 'react';
import axios from 'axios';

const FoodForm = () => {
  const [food, setFood] = useState({ 
    name: '', 
    price: '', 
    category: 'Snacks', 
    quantity: 10 // Ensure this matches your Schema field
  });

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1.5px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' };
  const btnStyle = { width: '100%', padding: '14px', backgroundColor: '#800000', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use the absolute URL to avoid any confusion
      const response = await axios.post('http://localhost:5000/api/food/add', {
        name: food.name,
        price: Number(food.price), // Ensure price is a Number
        category: food.category,
        quantity: Number(food.quantity) // Ensure quantity is a Number
      });

      if (response.status === 201 || response.status === 200) {
        alert(`${food.name} successfully published!`);
        setFood({ name: '', price: '', category: 'Snacks', quantity: 10 });
      }
    } catch (err) {
      console.error("Axios Error Detail:", err.response || err);
      alert("Backend Error: Check if server.js is running and CORS is enabled.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>FOOD NAME</label>
      <input type="text" placeholder="e.g. Samosa" style={inputStyle} value={food.name} onChange={(e)=>setFood({...food, name: e.target.value})} required />
      
      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>PRICE (₹)</label>
      <input type="number" placeholder="0" style={inputStyle} value={food.price} onChange={(e)=>setFood({...food, price: e.target.value})} required />
      
      <label style={{fontSize: '0.85rem', fontWeight: '600', color: '#64748b'}}>STOCK QUANTITY</label>
      <input type="number" style={inputStyle} value={food.quantity} onChange={(e)=>setFood({...food, quantity: e.target.value})} required />
      
      <button type="submit" style={btnStyle}>Publish to Student Menu</button>
    </form>
  );
};

export default FoodForm;