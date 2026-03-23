import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodForm from '../../components/FoodForm';

const Inventory = () => {
  const [items, setItems] = useState([]);

  const fetchItems = () => {
    axios.get('http://localhost:5000/api/food/menu').then(res => setItems(res.data));
  };

  useEffect(() => { fetchItems(); }, []);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '450px 1fr', gap: '2rem' }}>
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ color: '#facc15' }}>Entry Terminal</h3>
        <FoodForm onUploadSuccess={fetchItems} />
      </div>
      
      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3>Live Repository</h3>
        {/* Render your table here */}
      </div>
    </div>
  );
};

export default Inventory;