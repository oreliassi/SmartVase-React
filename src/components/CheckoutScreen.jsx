import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import "../index.css";

const CheckoutScreen = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [orderForm, setOrderForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    city: "",
    street: "",
    apartment: "",
    shipping_type: "regular",
    coupon: ""
  });
  
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [finalTotal, setFinalTotal] = useState(0);
  
  // Shipping price mapping using useMemo to prevent recreating on each render
  const shippingPrices = useMemo(() => ({
    regular: 20,
    express: 40,
    pickup: 0
  }), []);

  // Calculate final total
  useEffect(() => {
    const shippingCost = shippingPrices[orderForm.shipping_type] || 0;
    setFinalTotal(totalPrice + shippingCost);
  }, [totalPrice, orderForm.shipping_type, shippingPrices]);

  // Fill form with user data if available
  useEffect(() => {
    const fillOrderFormFromSession = () => {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        setOrderForm(prev => ({
          ...prev,
          email: userEmail
        }));
      }
      
      // In a real app, you would fetch user data from backend
      // This is just a simulation for demo purposes
      const savedUserData = localStorage.getItem('userData');
      if (savedUserData) {
        try {
          const userData = JSON.parse(savedUserData);
          setOrderForm(prev => ({
            ...prev,
            ...userData
          }));
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    };
    
    fillOrderFormFromSession();
  }, []);

  // Update form field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderForm({
      ...orderForm,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      alert('העגלה ריקה. אנא הוסף מוצר לפני ההזמנה.');
      navigate('/design');
      return;
    }
    
    // Save user data for future use
    localStorage.setItem('userData', JSON.stringify({
      first_name: orderForm.first_name,
      last_name: orderForm.last_name,
      phone: orderForm.phone,
      city: orderForm.city,
      street: orderForm.street,
      apartment: orderForm.apartment
    }));

    // Show payment options (PayPal would be integrated here in real app)
    setShowPaymentOptions(true);
  };

  // Process payment
  const processPayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      
      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'order-success';
      successMessage.innerHTML = '<i class="fas fa-check-circle"></i> תודה, ההזמנה בוצעה בהצלחה!';
      document.querySelector('#checkout-screen').prepend(successMessage);
      
      // Clear cart
      clearCart();
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/design');
      }, 3000);
    }, 2000);
  };

  // Back to design screen
  const goBackToDesign = () => {
    navigate('/design');
  };

  return (
    <div className="container" id="checkout-screen">
      <div id="floating-buttons">
        <button className="floating-btn" onClick={() => navigate('/home')}>בית</button>
        <button className="floating-btn" onClick={() => navigate('/')}>התנתק</button>
      </div>
      
      <h2>פרטי הזמנה</h2>
      
      {!showPaymentOptions ? (
        <form id="order-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="first_name"
            placeholder="שם פרטי"
            value={orderForm.first_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="שם משפחה"
            value={orderForm.last_name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="אימייל"
            value={orderForm.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="טלפון"
            value={orderForm.phone}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="city"
            placeholder="עיר"
            value={orderForm.city}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="street"
            placeholder="רחוב"
            value={orderForm.street}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="apartment"
            placeholder="דירה"
            value={orderForm.apartment}
            onChange={handleInputChange}
            required
          />

          <label htmlFor="shipping-type">סוג משלוח:</label>
          <select
            name="shipping_type"
            id="shipping-type"
            value={orderForm.shipping_type}
            onChange={handleInputChange}
            required
          >
            <option value="regular" data-price="20">משלוח רגיל - 20 ש"ח</option>
            <option value="express" data-price="40">שליח עד הבית - 40 ש"ח</option>
            <option value="pickup" data-price="0">איסוף עצמי - חינם</option>
          </select>

          <input
            type="text"
            name="coupon"
            placeholder="קוד קופון (אם יש)"
            value={orderForm.coupon}
            onChange={handleInputChange}
          />

          <p id="final-total" style={{ fontWeight: "bold", fontSize: "18px" }}>
            סה"כ לתשלום: {finalTotal} ש"ח
          </p>

          <button type="button" id="back-to-cart" onClick={goBackToDesign}>
            חזרה
          </button>
          <button type="submit">אשר והמשך לתשלום</button>
        </form>
      ) : (
        <div id="payment-container">
          <h3>בחר אמצעי תשלום</h3>
          
          <div id="payment-methods">
            <div className="payment-method">
              <button 
                onClick={processPayment}
                disabled={isProcessing}
                className="payment-button"
              >
                {isProcessing ? 'מעבד תשלום...' : 'שלם באשראי'}
              </button>
            </div>
            
            <div className="payment-method">
              <div id="paypal-button-container">
                <button 
                  onClick={processPayment}
                  disabled={isProcessing}
                  className="payment-button paypal"
                >
                  {isProcessing ? 'מעבד תשלום...' : 'PayPal'}
                </button>
              </div>
            </div>
          </div>
          
          <p id="final-total" style={{ fontWeight: "bold", fontSize: "18px", marginTop: "20px" }}>
            סה"כ לתשלום: {finalTotal} ש"ח
          </p>
          
          <button 
            id="back-to-form" 
            onClick={() => setShowPaymentOptions(false)}
            disabled={isProcessing}
          >
            חזרה לטופס
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckoutScreen;