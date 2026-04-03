import React from 'react';

const AnnouncementModal = ({ isOpen, onClose, announcement }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '30px', width: '100%', maxWidth: '400px', textAlign: 'center', borderTop: `12px solid ${announcement?.type === 'Urgent' ? '#EF4444' : '#800000'}` }}>
        {announcement ? (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{announcement.type === 'Urgent' ? '🚨' : '📢'}</div>
            <h2 style={{ margin: '0 0 5px 0', color: '#1E293B' }}>{announcement.title}</h2>
            <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginBottom: '20px' }}>
              📅 {new Date(announcement.createdAt).toLocaleDateString('en-GB')} | 🕒 {new Date(announcement.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </div>
            <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.6' }}>{announcement.message}</p>
          </>
        ) : (
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '3rem' }}>💤</div>
            <h2 style={{ color: '#94A3B8' }}>No Notifications</h2>
            <p style={{ color: '#CBD5E1' }}>Check back later for canteen news.</p>
          </div>
        )}
        <button onClick={onClose} style={{ width: '100%', marginTop: '30px', padding: '15px', background: '#800000', color: 'white', borderRadius: '15px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
          Close Window
        </button>
      </div>
    </div>
  );
};

export default AnnouncementModal;