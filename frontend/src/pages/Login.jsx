import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import LoginBackground from '../components/LoginBackground';

const Login = () => {
  const navigate = useNavigate();
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  // Inside Login.jsx useEffect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        navigate('/menu', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const isMobile = width < 768;

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user.email;

      // 1. Check if the email is allowed (Student or Staff)
      if (email.endsWith("@rguktrkv.ac.in") || email === "canteenstaffrgukt@gmail.com") {
        
        // 2. Prepare user object to store in LocalStorage (CRITICAL for session persistence)
        const userData = {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          photo: user.photoURL,
          isAdmin: email === "canteenstaffrgukt@gmail.com"
        };

        // 3. Save to localStorage so it survives page refreshes
        localStorage.setItem('canteenUser', JSON.stringify(userData));

        // 4. Redirect based on email
        if (email === "canteenstaffrgukt@gmail.com") {
          navigate('/admin/dashboard', {replace: true});
        } else {
          navigate('/menu', { replace: true });
        }

      } else {
        // Deny access for non-college emails
        await auth.signOut();
        alert("Access Denied! Use your @rguktrkv.ac.in ID.");
      }
    } catch (err) { 
      console.error("Login Error:", err); 
      alert("Authentication failed. Please try again.");
    }
  };

  const styles = {
    container: { 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: isMobile ? 'center' : 'flex-start', 
      paddingLeft: isMobile ? '0' : '10%',
      padding: isMobile ? '20px' : '0'
    },
    glassCard: {
      zIndex: 10,
      width: '100%',
      maxWidth: isMobile ? '350px' : '400px',
      background: 'rgba(255, 255, 255, 0.7)', 
      backdropFilter: 'blur(20px)',
      borderRadius: '30px',
      padding: isMobile ? '2rem' : '3.5rem',
      border: '1px solid rgba(255, 255, 255, 0.4)',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.05)',
      textAlign: 'center'
    },
    logoCircle: {
      width: '60px', height: '60px', borderRadius: '50%', background: '#800000', 
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '1rem', fontWeight: '800', margin: '0 auto 20px auto',
    },
    title: { fontSize: isMobile ? '1.8rem' : '2.2rem', fontWeight: '900', color: '#1a202c', margin: '0 0 10px 0' },
    subtitle: { color: '#718096', marginBottom: isMobile ? '30px' : '45px', fontSize: '0.85rem' },
    loginBtn: {
      width: '100%', padding: '16px', background: '#800000', color: 'white',
      border: 'none', borderRadius: '12px', fontWeight: '700', fontSize: '1rem',
      cursor: 'pointer', transition: '0.3s'
    }
  };

  return (
    <div style={styles.container}>
      <LoginBackground />
      <div style={styles.glassCard}>
        <div style={styles.logoCircle}>RKV</div>
        <h1 style={styles.title}>CampusCanteen</h1>
        <p style={styles.subtitle}>RGUKT Canteen | Login</p>
        <button 
          style={styles.loginBtn} 
          onClick={handleLogin}
          onMouseOver={(e) => e.target.style.background = '#600000'}
          onMouseOut={(e) => e.target.style.background = '#800000'}
        >
          Sign in with College ID
        </button>
        <p style={{ marginTop: '2.5rem', color: '#a0aec0', fontSize: '0.7rem', fontWeight: '600' }}>SECURE AUTHENTICATION</p>
      </div>
    </div>
  );
};

export default Login;