import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const CartContext = createContext();

// Color names mapping
const colorNames = {
  "#e7d5d5": "לבן",
  "#000000": "שחור",
  "#f14a4a": "אדום",
  "#99db99": "ירוק",
  "#7878f1": "כחול",
  "#ffeb94": "צהוב",
  "#dd8add": "ורוד",
  "#99dada": "טורקיז",
  "#aaaaaa": "אפור",
  "#ffa500": "כתום"
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showCart, setShowCart] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setCartCount(parsedCart.length);
        calculateTotal(parsedCart);
      } catch (error) {
        console.error('Error parsing cart data:', error);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate total price
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    setTotalPrice(total);
  };

  // Add item to cart
  const addToCart = (itemData) => {
    const newItem = {
      id: Date.now(),
      ...itemData,
      colorName: colorNames[itemData.color] || itemData.color
    };
    
    const updatedCart = [...cartItems, newItem];
    setCartItems(updatedCart);
    setCartCount(updatedCart.length);
    calculateTotal(updatedCart);
    setShowCart(true); // Show cart when item is added
    return newItem;
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    setCartCount(updatedCart.length);
    calculateTotal(updatedCart);
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setTotalPrice(0);
    localStorage.removeItem('cartItems');
  };

  // Helper function for texture names
  const getTextureName = (value) => {
    switch (value) {
      case 'smooth': return 'חלק';
      case 'rough': return 'מחוספס';
      case 'matte': return 'מט';
      default: return value;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        totalPrice,
        showCart,
        setShowCart,
        addToCart,
        removeFromCart,
        clearCart,
        getTextureName
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;