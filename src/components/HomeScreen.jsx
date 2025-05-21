import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  return (
    <div className="container" id="home-screen">
      <div id="floating-buttons">
        <button className="floating-btn" onClick={() => navigate('/home')}>בית</button>
        <button className="floating-btn" onClick={handleLogout}>התנתק</button>
      </div>
      
      <div className="logo">
        <img src="/images/logo.png" alt="SmartVase Logo" />
      </div>
      
      <h2 className="home-title">עמוד הבית</h2>

      <div className="home-buttons">
        <button id="go-to-design" onClick={() => navigate("/design")}>
          עצב כד חדש
        </button>
        <button id="go-to-orders" onClick={() => navigate("/orders")}>
          ההזמנות שלי
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;