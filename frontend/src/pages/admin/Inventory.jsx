import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FoodForm from '../../components/FoodForm';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [editItem, setEditItem] = useState(null);

 const checkFoodStatus = (item) => {
    const hour = new Date().getHours();
    

    const mode = item.availabilityMode ? item.availabilityMode.toLowerCase() : 'auto';
    const isManualOut = item.isAvailable === false;

    if (isManualOut) return { canOrder: false, reason: "Sold Out" };
    
    if (mode !== 'auto') return { canOrder: true, reason: "" };

    const timings = {
        'Breakfast': { start: 0, end: 11 },
        'Lunch':     { start: 11, end: 16 },
        'Snacks':    { start: 16, end: 24 }
    };

    const window = timings[item.category]; 
    if (window) {
        if (hour >= window.start && hour < window.end) return { canOrder: true, reason: "" };
        return { canOrder: false, reason: "Time Locked" };
    }
    return { canOrder: true, reason: "" };
};

  const fetchItems = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/food/menu');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setItems([]); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleToggleStock = async (id, currentStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/food/update/${id}`, { isAvailable: !currentStatus });
      fetchItems();
      setActiveMenu(null);
    } catch (err) { alert("Update failed"); }
  };

  const handleToggleForce = async (id, currentMode) => {
    try {
      const newMode = currentMode === 'Auto' ? 'Force Available' : 'Auto';
      await axios.put(`http://localhost:5000/api/food/update/${id}`, { availabilityMode: newMode });
      fetchItems();
      setActiveMenu(null);
    } catch (err) { alert("Update failed"); }
  };

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

      <div className="inventory-grid" style={{ display: 'flex', flexDirection: 'row', gap: '2rem', marginTop: '30px' }}>

        <div style={{ flex: '0 0 380px', background: '#FFFDF5', padding: '2rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: 'fit-content' }}>
          <h3 style={{ color: '#800000', marginTop: 0 }}>{editItem ? '📝 Edit Entry' : '✨ New Entry'}</h3>
          <FoodForm onUploadSuccess={fetchItems} editItem={editItem} setEditItem={setEditItem} />
        </div>

        <div style={{ flex: 1, background: 'white', padding: '1.5rem', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.75rem', borderBottom: '2px solid #F8FAFC' }}>
                <th style={{ padding: '15px' }}>Item</th>
                <th>Status Flags</th>
                <th>Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => {
                const { canOrder } = checkFoodStatus(item);
                const isTimeLocked = !canOrder && item.availabilityMode === 'Auto';

                return (
                  <tr key={item._id} style={{ 
                      borderBottom: '1px solid #F8FAFC',
                      opacity: isTimeLocked ? 0.4 : 1, 
                      background: isTimeLocked ? '#F8FAFC' : 'white', 
                      transition: 'opacity 0.3s ease'
                  }}>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontWeight: '800' }}>{item.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{item.category}</div>
                    </td>
                    
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                          <span style={{ fontSize: '0.6rem', padding: '3px 7px', borderRadius: '5px', background: item.isAvailable ? '#DCFCE7' : '#FEE2E2', color: item.isAvailable ? '#166534' : '#991B1B' }}>
                              {item.isAvailable ? 'INSTOCK' : 'SOLDOUT'}
                          </span>
                          {isTimeLocked && (
                            <span style={{ fontSize: '0.6rem', padding: '3px 7px', borderRadius: '5px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }}>🕒 TIMELOCKED</span>
                          )}
                      </div>
                    </td>

                    <td style={{ fontWeight: '900', color: '#800000' }}>₹{item.price}</td>

                    <td style={{ position: 'relative' }}>
                      <button onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>⋮</button>
                      
                      {activeMenu === item._id && (
                        <div style={{ position: 'absolute', right: '40px', top: '0', zIndex: 100, background: 'white', border: '1px solid #E2E8F0', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '180px', padding: '5px' }}>
                          
                          {isTimeLocked ? (
                              <button onClick={() => handleToggleForce(item._id, 'Auto')} style={{ width: '100%', padding: '10px', border: 'none', background: '#FFFBEB', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: '#B45309', fontSize: '0.75rem', borderRadius: '8px' }}>
                                 🔓 Force Enable
                              </button>
                          ) : (
                              <button onClick={() => handleToggleStock(item._id, item.isAvailable)} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: item.isAvailable ? '#EF4444' : '#16A34A', fontSize: '0.75rem' }}>
                                 {item.isAvailable ? '⛔ Mark Sold Out' : '✅ Mark Available'}
                              </button>
                          )}

                          <button onClick={() => handleToggleForce(item._id, item.availabilityMode)} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontWeight: 'bold', color: '#1E40AF', fontSize: '0.75rem' }}>
                             {item.availabilityMode === 'Auto' ? '⚡ Switch to Force' : '🤖 Switch to Auto'}
                          </button>

                          <hr style={{ border: '0.5px solid #F1F5F9', margin: '5px 0' }} />
                          <button onClick={() => { setEditItem(item); setActiveMenu(null); }} style={{ width: '100%', padding: '10px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem' }}>Edit Details</button>
                          <button onClick={() => handleDelete(item._id)} style={{ width: '100%', padding: '10px', border: 'none', color: '#EF4444', background: 'none', cursor: 'pointer', textAlign: 'left', fontSize: '0.75rem' }}>Delete Item</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;