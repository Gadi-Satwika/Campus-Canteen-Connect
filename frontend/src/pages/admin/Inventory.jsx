import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodForm from '../../components/FoodForm';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null); // Fixes the 3-dots action

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/food/menu');
      // Safety: Ensure we always set an array
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setItems([]); // Fallback to empty array
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Remove this item?")) {
      try {
        await axios.delete(`http://localhost:5000/api/food/${id}`);
        fetchItems();
        setActiveMenu(null);
      } catch (err) {
        alert("Delete failed. Check backend console.");
      }
    }
  };

  // Safety Check: Only filter if items is an array
  const filteredItems = items?.filter(item => 
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const styles = {
    grid: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: '2rem', marginTop: '20px' },
    card: { background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
    status: (q) => ({
      padding: '5px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 'bold',
      background: q < 10 ? '#FFF1F2' : '#F0FDF4',
      color: q < 10 ? '#E11D48' : '#16A34A'
    })
  };

  return (
    <div style={{ animation: 'fadeIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontWeight: '900', color: '#1E293B' }}>Menu Repository</h1>
        <input 
          type="text" 
          placeholder="Search Item..." 
          style={{ padding: '12px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', width: '300px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={styles.grid}>
        {/* FORM SIDE */}
        <div style={{ ...styles.card, background: '#FFFDF5' }}>
          <h3 style={{ color: '#800000', marginTop: 0 }}>✨ New Entry</h3>
          <FoodForm onUploadSuccess={fetchItems} />
        </div>

        {/* TABLE SIDE */}
        <div style={styles.card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '15px' }}>Item</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '20px 15px' }}>
                    <div style={{ fontWeight: '800' }}>{item.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>UID: {item._id?.slice(-5)}</div>
                  </td>
                  <td style={{ fontWeight: '900', color: '#800000' }}>₹{item.price}</td>
                  <td>
                    <span style={styles.status(item.quantity)}>{item.quantity} In Stock</span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button 
                      onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    >
                      ⋮
                    </button>
                    
                    {activeMenu === item._id && (
                      <div style={{
                        position: 'absolute', right: '40px', top: '0', zIndex: 100,
                        background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100px'
                      }}>
                        <button 
                          onClick={() => handleDelete(item._id)}
                          style={{ width: '100%', padding: '10px', border: 'none', color: '#EF4444', background: 'none', cursor: 'pointer', textAlign: 'left' }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', padding: '20px' }}>No items found.</p>}
        </div>
      </div>
    </div>
  );
};

export default Inventory;