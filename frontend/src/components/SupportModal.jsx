import React from 'react';

const SupportModal = ({ isOpen, onClose, complaints, form, setForm, onSubmit, onEdit, onRevoke, onFileChange, isEditing }) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 7000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(5px)' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '30px', width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#800000', margin: 0 }}>🛠️ Support Center</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h4 style={{ color: '#64748B', borderBottom: '1px solid #EEE', paddingBottom: '5px' }}>My Previous Issues</h4>
          {complaints.length > 0 ? complaints.map(c => (
            <div key={c._id} style={{ background: '#F8FAFC', padding: '15px', borderRadius: '15px', marginBottom: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#94A3B8' }}>
                <span>{new Date(c.createdAt).toLocaleDateString('en-GB')}</span>
                <span style={{ color: c.status === 'Resolved' ? '#16A34A' : '#F59E0B', fontWeight: 'bold' }}>{c.status?.toUpperCase() || 'PENDING'}</span>
              </div>
              <div style={{ fontWeight: 'bold', marginTop: '5px' }}>{c.subject}</div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px', borderTop: '1px solid #DDD', paddingTop: '8px' }}>
                <button onClick={() => onEdit(c)} style={{ background: 'none', border: 'none', color: '#800000', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>✏️ Edit</button>
                <button onClick={() => onRevoke(c._id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}>🗑️ Revoke</button>
              </div>
            </div>
          )) : <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>No issues raised yet.</p>}
        </div>

        <div style={{ background: '#FFFDF5', padding: '20px', borderRadius: '20px', border: '1px dashed #800000' }}>
          <h4 style={{ margin: '0 0 15px 0' }}>{isEditing ? "Edit Issue" : "Raise New Issue"}</h4>
          <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '10px', border: '1px solid #DDD' }} />
          <textarea placeholder="Description" value={form.message} onChange={e => setForm({...form, message: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #DDD', minHeight: '80px' }} />
          <input type="file" onChange={onFileChange} style={{ marginTop: '10px' }} />
          <button onClick={onSubmit} style={{ width: '100%', marginTop: '15px', padding: '15px', background: '#800000', color: 'white', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
            {isEditing ? 'Update Complaint' : 'Submit Complaint'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;