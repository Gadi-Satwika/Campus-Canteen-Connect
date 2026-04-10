import React, { useState, useEffect } from 'react';
import API from '../../api';
import FoodForm from '../../components/FoodForm';

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

    const windowTime = timings[item.category]; 
    if (windowTime) {
        if (hour >= windowTime.start && hour < windowTime.end) return { canOrder: true, reason: "" };
        return { canOrder: false, reason: "Time Locked" };
    }
    return { canOrder: true, reason: "" };
  };

  const fetchItems = async () => {
    try {
      const res = await API.get('/food/menu');
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) { setItems([]); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleToggleStock = async (id, currentStatus) => {
    try {
      await API.put(`/food/update/${id}`, { isAvailable: !currentStatus });
      fetchItems();
      setActiveMenu(null);
    } catch (err) { alert("Update failed"); }
  };

  const handleToggleForce = async (id, currentMode) => {
    try {
      const newMode = currentMode === 'Auto' ? 'Force Available' : 'Auto';
      await API.put(`/food/update/${id}`, { availabilityMode: newMode });
      fetchItems();
      setActiveMenu(null);
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Remove this item?")) {
      await API.delete(`/food/${id}`);
      fetchItems();
      setActiveMenu(null);
    }
  };

  const filteredItems = items?.filter(item => 
    item?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div style={{ padding: isMobile ? '10px' : '20px' }}>
      {/* HEADER & SEARCH */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '15px',
        marginBottom: '20px'
      }}>
        <h1 style={{ fontWeight: '900', color: '#1E293B', margin: 0, fontSize: isMobile ? '1.5rem' : '2rem' }}>
          Menu Repository
        </h1>
        <input 
          type="text" 
          placeholder="Search Item..." 
          style={{ 
            padding: '12px 20px', 
            borderRadius: '15px', 
            border: '1px solid #E2E8F0', 
            width: '100%', 
            maxWidth: isMobile ? '100%' : '300px',
            fontSize: '16px' // Prevents iOS zoom on focus
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row', 
        gap: '20px', 
        marginTop: '10px' 
      }}>

        {/* FORM SECTION */}
        <div style={{ 
          flex: isMobile ? '1' : '0 0 380px', 
          background: '#FFFDF5', 
          padding: isMobile ? '1.5rem' : '2rem', 
          borderRadius: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
          height: 'fit-content' 
        }}>
          <h3 style={{ color: '#800000', marginTop: 0, fontSize: '1.2rem' }}>
            {editItem ? '📝 Edit Entry' : '✨ New Entry'}
          </h3>
          <FoodForm onUploadSuccess={fetchItems} editItem={editItem} setEditItem={setEditItem} />
        </div>

        {/* TABLE SECTION */}
        <div style={{ 
          flex: 1, 
          background: 'white', 
          padding: isMobile ? '1rem' : '1.5rem', 
          borderRadius: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
          overflowX: 'auto', // Keep table scrollable on small screens
          maxWidth: '100%'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '450px' : 'auto' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: '0.75rem', borderBottom: '2px solid #F8FAFC' }}>
                <th style={{ padding: '15px 10px' }}>Item</th>
                <th>Flags</th>
                <th>Price</th>
                <th style={{ textAlign: 'center' }}>Action</th>
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
                      background: isTimeLocked ? '#F8FAFC' : 'white'
                  }}>
                    <td style={{ padding: '12px 10px' }}>
                      <div style={{ fontWeight: '800', fontSize: '0.85rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{item.category}</div>
                    </td>
                    
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ 
                            fontSize: '0.55rem', 
                            padding: '2px 5px', 
                            borderRadius: '4px', 
                            textAlign: 'center',
                            width: 'fit-content',
                            background: item.isAvailable ? '#DCFCE7' : '#FEE2E2', 
                            color: item.isAvailable ? '#166534' : '#991B1B',
                            fontWeight: 'bold'
                          }}>
                              {item.isAvailable ? 'INSTOCK' : 'SOLDOUT'}
                          </span>
                          {isTimeLocked && (
                            <span style={{ fontSize: '0.55rem', padding: '2px 5px', borderRadius: '4px', background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', textAlign: 'center', width: 'fit-content' }}>🕒 LOCK</span>
                          )}
                      </div>
                    </td>

                    <td style={{ fontWeight: '900', color: '#800000', fontSize: '0.9rem' }}>₹{item.price}</td>

                    <td style={{ position: 'relative', textAlign: 'center' }}>
                      <button onClick={() => setActiveMenu(activeMenu === item._id ? null : item._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', padding: '10px' }}>⋮</button>
                      
                      {activeMenu === item._id && (
                        <div style={{ 
                          position: 'absolute', 
                          right: isMobile ? '10px' : '40px', 
                          top: '30px', 
                          zIndex: 200, 
                          background: 'white', 
                          border: '1px solid #E2E8F0', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.15)', 
                          width: '170px', 
                          padding: '5px' 
                        }}>
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