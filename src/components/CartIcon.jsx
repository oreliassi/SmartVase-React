import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartIcon = () => {
  const { 
    cartItems, 
    cartCount, 
    totalPrice, 
    showCart, 
    setShowCart, 
    removeFromCart, 
    getTextureName 
  } = useCart();
  
  const navigate = useNavigate();

  return (
    <div id="cart-container">
      <div id="cart-icon" onClick={() => setShowCart(!showCart)}>
        🛒 <span id="cart-count">{cartCount}</span>
      </div>
      
      {showCart && cartItems.length > 0 && (
        <div id="cart-details">
          <h3>העגלה שלך</h3>
          <ul id="cart-items">
            {cartItems.map(item => (
              <li key={item.id} data-id={item.id}>
                <span 
                  style={{float: 'left', color: 'red', cursor: 'pointer'}} 
                  className="remove-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                >
                  ✖
                </span>
                גובה: {item.height} ס"מ, רוחב: {item.width} ס"מ<br />
                צבע: {item.colorName}, טקסטורה: {getTextureName(item.texture)}<br />
                מחיר: {item.price} ש"ח
              </li>
            ))}
          </ul>
          <p id="total-price">סה"כ: {totalPrice} ש"ח</p>
          <button id="continue-shopping" onClick={() => setShowCart(false)}>המשך קנייה</button>
          <button id="checkout" onClick={() => navigate('/checkout')}>לתשלום</button>
        </div>
      )}
      
      {showCart && cartItems.length === 0 && (
        <div id="cart-details">
          <h3>העגלה שלך</h3>
          <p style={{ textAlign: 'center', padding: '20px 0' }}>העגלה ריקה</p>
          <button id="continue-shopping" onClick={() => setShowCart(false)}>המשך קנייה</button>
        </div>
      )}
    </div>
  );
};

export default CartIcon;