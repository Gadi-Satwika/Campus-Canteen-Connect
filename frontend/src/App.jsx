import React from 'react';
import { BrowserRouter as Router, Routes, Route ,Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Menu from './pages/Menu';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import LiveOrders from './pages/admin/LiveOrders';
import ProtectedRoute from './components/ProtectedRoute';
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

        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="orders" element={<LiveOrders />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;