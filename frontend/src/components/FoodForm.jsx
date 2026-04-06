import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FoodForm = ({ onUploadSuccess, editItem, setEditItem }) => {
  const [food, setFood] = useState({ name: '', price: '', category: 'Breakfast', image: '', quantity: 10 });


  useEffect(() => {
    if (editItem) {
      setFood({
        name: editItem.name,
        price: editItem.price,
        category: editItem.category || 'Breakfast',
        image: editItem.image || '',
        quantity: editItem.quantity || 10
      });
    }
  }, [editItem]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  try {

    const payload = {
      name: food.name,
      price: Number(food.price) || 0,
      category: food.category,
      image: food.image,
      quantity: Number(food.quantity) || 0
    };

    if (editItem) {
      await axios.put(`http://localhost:5000/api/food/edit/${editItem._id}`, payload);
      alert("Item Updated successfully!");
      setEditItem(null); 
    } else {
      await axios.post('http://localhost:5000/api/food/add', payload);
      alert("New Item Published!");
    }
    
    setFood({ name: '', price: '', category: 'Breakfast', image: '', quantity: 10 });
    onUploadSuccess(); 
  } catch (err) {
    console.error("Save Error:", err.response?.data || err.message);
    alert("Error saving item. Check if the Edit route is added to the backend.");
  }
};

  const inputStyle = { width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B' }}>ITEM NAME</label>
      <input type="text" value={food.name} onChange={e => setFood({...food, name: e.target.value})} style={inputStyle} required />
      
      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B' }}>PRICE (₹)</label>
      <input type="number" value={food.price} onChange={e => setFood({...food, price: e.target.value})} style={inputStyle} required />

      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B' }}>CATEGORY</label>
      <select value={food.category} onChange={e => setFood({...food, category: e.target.value})} style={inputStyle}>
        <option value="Breakfast">Breakfast</option>
        <option value="Lunch">Lunch</option>
        <option value="Snacks">Snacks</option>
      </select>

      <label style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748B' }}>IMAGE URL</label>
      <input type="text" value={food.image} onChange={e => setFood({...food, image: e.target.value})} style={inputStyle} />

      <button type="submit" style={{ background: '#800000', color: 'white', padding: '14px', borderRadius: '12px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
        {editItem ? 'Update Item' : 'Publish Item'}
      </button>
      {editItem && <button type="button" onClick={() => { setEditItem(null); setFood({name:'', price:'', category:'Breakfast', image:'', quantity:10}); }} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}>Cancel Edit</button>}
    </form>
  );
};

export default FoodForm;