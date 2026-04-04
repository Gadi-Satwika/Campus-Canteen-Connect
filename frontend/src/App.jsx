import React from 'react';
import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import LiveOrders from './pages/admin/LiveOrders';
import ProtectedRoute from './components/ProtectedRoute';
import AdminAnnouncements from './pages/admin/AdminAnnouncements';
import AdminComplaints from './pages/admin/AdminComplaints';
import SpecialManager from './pages/admin/SpecialManager';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        <Route path="/menu" element={
          <ProtectedRoute>
            <Menu />
          </ProtectedRoute>
        } />
        
        <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />

        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<LiveOrders />} />
          <Route path="announcements" element={<AdminAnnouncements />} />

          <Route path="complaints" element={<AdminComplaints />} />
          <Route path="specials" element={<SpecialManager />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;