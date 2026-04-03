import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodForm from '../../components/FoodForm';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [editItem, setEditItem] = useState(null); // For editing

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/food/menu');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setItems([]); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Remove this item?")) {
      await axios.delete(`http://localhost:5000/api/food/${id}`);
      fetchItems();
      setActiveMenu(null);
    }
  };

  const filteredItems = items?.filter(item => 
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0 }}>Menu Repository</h1>
        <input 
          type="text" 
          placeholder="Search Item..." 
          style={{ padding: '12px 20px', borderRadius: '15px', border: '1px solid #E2E8F0', width: '100%', maxWidth: '300px' }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="inventory-grid" style={{ 
        display: 'flex', 
        flexDirection: window.innerWidth < 900 ? 'column' : 'row', 
        gap: '2rem', 
        marginTop: '30px' 
      }}>
        
        {/* FORM SIDE */}
        <div style={{ flex: '0 0 380px', background: '#FFFDF5', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ color: '#800000', marginTop: 0 }}>{editItem ? '📝 Edit Entry' : '✨ New Entry'}</h3>
          <FoodForm onUploadSuccess={fetchItems} editItem={editItem} setEditItem={setEditItem} />
        </div>

        {/* TABLE SIDE */}
        <div style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.75rem', borderBottom: '2px solid #F8FAFC' }}>
                <th style={{ padding: '15px' }}>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item._id} style={{ borderBottom: '1px solid #F8FAFC' }}>
                  <td style={{ padding: '15px' }}>
                    <div style={{ fontWeight: '800' }}>{item.name}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>UID: {item._id?.slice(-5)}</div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748B' }}>{item.category}</td>
                  <td style={{ fontWeight: '900', color: '#800000' }}>₹{item.price}</td>
                  <td>
                    <span style={{ 
                      padding: '5px 12px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 'bold',
                      background: item.quantity < 10 ? '#FFF1F2' : '#F0FDF4',
                      color: item.quantity < 10 ? '#E11D48' : '#16A34A'
                    }}>
                      {item.quantity} In Stock
                    </span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <button onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>⋮</button>
                    {activeMenu === item._id && (
                      <div style={{ position: 'absolute', right: '40px', top: '0', zIndex: 100, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '120px', padding: '5px' }}>
                        <button onClick={() => { setEditItem(item); setActiveMenu(null); }} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: '#1E293B' }}>Edit</button>
                        <button onClick={() => handleDelete(item._id)} style={{ width: '100%', padding: '10px', border: 'none', color: '#EF4444', background: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold' }}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;