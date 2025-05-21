import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

const PersonalArea = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    // Simulate loading orders from a server
    const loadOrders = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock orders data
        const mockOrders = [
          {
            order_number: '1001',
            date: '2025-05-15T10:30:00',
            shipping: 'express',
            city: 'תל אביב',
            street: 'רוטשילד 10',
            apartment: '5',
            price: 320,
            status: 'confirmed',
            models: [
              {
                model_number: 'vase1.stl',
                height: 20,
                width: 15,
                color: '#f14a4a',
                texture: 'smooth'
              },
              {
                model_number: 'vase3.stl',
                height: 15,
                width: 10,
                color: '#7878f1',
                texture: 'rough'
              }
            ]
          },
          {
            order_number: '1002',
            date: '2025-05-08T14:45:00',
            shipping: 'regular',
            city: 'חיפה',
            street: 'הרצל 55',
            apartment: '12',
            price: 180,
            status: 'shipped',
            models: [
              {
                model_number: 'vase2.stl',
                height: 18,
                width: 12,
                color: '#99db99',
                texture: 'matte'
              }
            ]
          }
        ];
        
        setOrders(mockOrders);
      } catch (error) {
        console.error('Error loading orders:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  const getStatusText = (status) => {
    switch(status) {
      case 'pending': return 'ממתין לאישור';
      case 'confirmed': return 'אושר';
      case 'shipped': return 'נשלח';
      case 'delivered': return 'נמסר';
      default: return status;
    }
  };

  const getShippingText = (shipping) => {
    switch(shipping) {
      case 'regular': return 'משלוח רגיל';
      case 'express': return 'שליח עד הבית';
      case 'pickup': return 'איסוף עצמי';
      default: return shipping;
    }
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
  };

  const reorderItem = (modelPath, height, width, color, texture) => {
    // Navigate to design screen with parameters
    navigate('/design', { 
      state: { 
        modelPath, 
        height, 
        width, 
        color, 
        texture,
        reorder: true 
      } 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    });
  };

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

  const getTextureName = (value) => {
    switch (value) {
      case 'smooth': return 'חלק';
      case 'rough': return 'מחוספס';
      case 'matte': return 'מט';
      default: return value;
    }
  };

  return (
    <div className="container" id="personal-area">
      <div id="floating-buttons">
        <button className="floating-btn" onClick={() => navigate('/home')}>בית</button>
        <button className="floating-btn" onClick={() => navigate('/')}>התנתק</button>
      </div>
      
      <div className="logo">
        <img src="/images/logo.png" alt="SmartVase Logo" />
      </div>
      
      <h2>ההזמנות שלי</h2>
      
      <div id="ordersContainer">
        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>טוען הזמנות...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="no-orders">
            <i className="fas fa-info-circle"></i> אין הזמנות קודמות.
          </div>
        ) : (
          <div className="orders-container">
            {orders.map(order => (
              <div key={order.order_number} className="order-item">
                <h3>הזמנה #{order.order_number}</h3>
                <p><i className="far fa-calendar-alt"></i> <strong>תאריך:</strong> {formatDate(order.date)}</p>
                <p><i className="fas fa-truck"></i> <strong>משלוח:</strong> {getShippingText(order.shipping)}</p>
                <p><i className="fas fa-map-marker-alt"></i> <strong>יעד:</strong> {order.city}, {order.street} {order.apartment}</p>
                <p><i className="fas fa-shekel-sign"></i> <strong>סכום:</strong> {order.price} ש"ח</p>
                <p><i className="fas fa-clipboard-check"></i> <strong>סטטוס:</strong> {getStatusText(order.status)}</p>
                <button 
                  className="order-details-btn" 
                  onClick={() => showOrderDetails(order)}
                >
                  הצג פרטים
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedOrder && (
        <div className="order-details-modal">
          <div className="modal-content">
            <span className="close-modal" onClick={closeOrderDetails}>&times;</span>
            <h3>פרטי הזמנה #{selectedOrder.order_number}</h3>
            
            <div className="order-status">
              <p><strong>תאריך:</strong> {formatDate(selectedOrder.date)}</p>
              <p><strong>סוג משלוח:</strong> {getShippingText(selectedOrder.shipping)}</p>
              <p><strong>כתובת:</strong> {selectedOrder.city}, {selectedOrder.street} {selectedOrder.apartment}</p>
              <p><strong>סכום:</strong> {selectedOrder.price} ש"ח</p>
              <p><strong>סטטוס:</strong> {getStatusText(selectedOrder.status)}</p>
            </div>
            
            <h4>פריטים בהזמנה:</h4>
            <div className="order-items">
              {selectedOrder.models.map((model, index) => {
                const colorName = colorNames[model.color] || model.color;
                const fullModelPath = model.model_number.includes('models/') 
                  ? model.model_number 
                  : `models/${model.model_number}`;
                
                return (
                  <div key={index} className="order-item-detail">
                    <h4>פריט {index + 1}</h4>
                    <div className="item-content">
                      <div className="model-image">
                        <img 
                          src={`/images/${model.model_number.replace('.stl', '')}.png`} 
                          alt={`דגם ${index + 1}`}
                          style={{ backgroundColor: model.color, mixBlendMode: 'multiply' }}
                        />
                      </div>
                      <div className="item-details">
                        <p><strong>גובה:</strong> {model.height} ס"מ</p>
                        <p><strong>רוחב:</strong> {model.width} ס"מ</p>
                        <p>
                          <strong>צבע:</strong> 
                          <span 
                            style={{
                              backgroundColor: model.color,
                              display: 'inline-block',
                              width: '15px',
                              height: '15px',
                              borderRadius: '50%',
                              marginRight: '5px',
                              verticalAlign: 'middle'
                            }}
                          ></span> 
                          {colorName}
                        </p>
                        <p><strong>טקסטורה:</strong> {getTextureName(model.texture)}</p>
                      </div>
                    </div>
                    <button 
                      id="hzamn-mwhw-dwmh" 
                      className="reorder-btn"
                      onClick={() => reorderItem(
                        fullModelPath,
                        model.height,
                        model.width,
                        model.color,
                        model.texture
                      )}
                    >
                      <i className="fas fa-edit"></i> הזמן מוצר דומה
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      <button id="back-to-menu" onClick={() => navigate('/home')}>חזרה</button>
    </div>
  );
};

export default PersonalArea;