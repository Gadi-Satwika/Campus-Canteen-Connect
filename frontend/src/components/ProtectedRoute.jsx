import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; 

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener waits for Firebase to initialize
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // 1. While Firebase is "thinking", show a blank screen or spinner
  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '20%' }}>Checking Session...</div>;
  }

  // 2. If no user is found after loading, go to Login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 3. ADMIN SECURITY: If it's an admin route, check the email
  if (adminOnly && user.email !== 'canteenstaffrgukt@gmail.com') {
    return <Navigate to="/menu" replace />;
  }

  return children;
};

export default ProtectedRoute;