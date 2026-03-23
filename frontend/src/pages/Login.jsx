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

  const isMobile = width < 768;

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      if (email.endsWith("@rguktrkv.ac.in") || email === "canteen.staff@rguktrkv.ac.in") {
        email === "canteen.staff@rguktrkv.ac.in" ? navigate('/admin/dashboard') : navigate('/menu');
      } else {
        await auth.signOut();
        alert("Access Denied! Use your @rguktrkv.ac.in ID.");
      }
    } catch (err) { console.error(err); }
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
      cursor: 'pointer'
    }
  };

  return (
    <div style={styles.container}>
      <LoginBackground />
      <div style={styles.glassCard}>
        <div style={styles.logoCircle}>RKV</div>
        <h1 style={styles.title}>CampusCanteen</h1>
        <p style={styles.subtitle}>RGUKT Canteen | Login</p>
        <button style={styles.loginBtn} onClick={handleLogin}>Sign in with College ID</button>
        <p style={{ marginTop: '2.5rem', color: '#a0aec0', fontSize: '0.7rem', fontWeight: '600' }}>SECURE AUTHENTICATION</p>
      </div>
    </div>
  );
};

export default Login;