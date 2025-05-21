import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (localStorage.getItem('isLoggedIn') === 'true') {
      navigate('/home');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("נא למלא שם משתמש וסיסמה");
      return;
    }

    setIsLoading(true);

    try {
      // This would be a real API call in a production app
      // Instead, we're simulating a successful login for demonstration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Store login status
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      
      // Navigate to home page
      navigate('/home');
    } catch (err) {
      setError("שם משתמש או סיסמה שגויים");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin(e);
    }
  };

  return (
    <div className="container" id="login-screen">
      <div className="logo">
        <img src="/images/logo.png" alt="SmartVase Logo" />
      </div>
      <h2>התחברות</h2>
      
      {error && <p className="error-message">{error}</p>}
      
      <input
        type="text"
        id="username"
        placeholder="אימייל"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
      />
      
      <input
        type="password"
        id="password"
        placeholder="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={isLoading}
      />
      
      <button 
        id="login-btn" 
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? 'מתחבר...' : 'התחבר'}
      </button>
      
      <button 
        id="admin-login"
        onClick={() => navigate('/admin')}
        disabled={isLoading}
      >
        התחברות כמנהל
      </button>
    </div>
  );
};

export default LoginScreen;