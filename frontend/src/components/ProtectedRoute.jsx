import React from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../firebase'; // Path to firebase.js

const ProtectedRoute = ({ children }) => {
  const user = auth.currentUser;
  
  if (!user) {
    // If not logged in, send them back to the Login page
    return <Navigate to="/" />;
  }
  
  return children;
};

export default ProtectedRoute;