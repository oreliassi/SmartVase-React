import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import LoginScreen from './components/LoginScreen';
import HomeScreen from './components/HomeScreen';
import DesignScreen from './components/DesignScreen';
import CheckoutScreen from './components/CheckoutScreen';
import PersonalArea from './components/PersonalArea';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

// Auth guard component to protect routes
const ProtectedRoute = ({ children }) => {
  // Simple check if user is logged in
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <CartProvider>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<LoginScreen />} />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomeScreen />
              </ProtectedRoute>
            } />
            <Route path="/design" element={
              <ProtectedRoute>
                <DesignScreen />
              </ProtectedRoute>
            } />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <CheckoutScreen />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <PersonalArea />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </CartProvider>
    </Router>
  );
}

export default App;