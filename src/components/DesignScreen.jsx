import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import CartIcon from './CartIcon';
import VaseViewer from './VaseViewer';
import '../index.css';

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

const DesignScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  
  // Check if we have parameters from reorder
  const reorderParams = location.state;

  // State variables
  const [selectedColor, setSelectedColor] = useState(reorderParams?.color || "#f14a4a");
  const [texture, setTexture] = useState(reorderParams?.texture || "");
  const [height, setHeight] = useState(reorderParams?.height || 15);
  const [width, setWidth] = useState(reorderParams?.width || 15);
  const [price, setPrice] = useState(0);
  const [showPrice, setShowPrice] = useState(false);
  const [currentModelPath, setCurrentModelPath] = useState(reorderParams?.modelPath || 'models/vase1.stl');
  const [isLoading, setIsLoading] = useState(false);

  // Handle calculate price button click
  const handleCalculatePrice = () => {
    const newPrice = (parseInt(height) + parseInt(width)) * 2;
    setPrice(newPrice);
    setShowPrice(true);
    return newPrice;
  };
  
  // Internal price calculation (doesn't show price)
  const updatePriceInternal = useCallback(() => {
    const newPrice = (parseInt(height) + parseInt(width)) * 2;
    setPrice(newPrice);
    return newPrice;
  }, [height, width]);

  // Add item to cart
  const handleAddToCart = () => {
    try {
      if (!selectedColor) {
        alert('אנא בחר צבע לפני הוספה לעגלה.');
        return;
      }

      if (!texture) {
        alert('אנא בחר טקסטורה לפני הוספה לעגלה.');
        return;
      }

      // Ensure price is calculated
      const calculatedPrice = updatePriceInternal();
      
      // Create the item
      const itemData = {
        height,
        width,
        color: selectedColor,
        colorName: colorNames[selectedColor] || selectedColor,
        texture,
        price: calculatedPrice,
        model: currentModelPath
      };

      // Add to cart
      addToCart(itemData);
      
      // Create flying animation effect
      createFlyingItemAnimation();
      
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  // Flying item animation for cart
  const createFlyingItemAnimation = () => {
    try {
      const addToCartButton = document.getElementById('add-to-cart');
      const cartIconElement = document.getElementById('cart-icon');
      
      if (!addToCartButton || !cartIconElement) {
        return;
      }
      
      const startRect = addToCartButton.getBoundingClientRect();
      const cartRect = cartIconElement.getBoundingClientRect();
      
      const startPosition = {
        left: startRect.left + startRect.width / 2,
        top: startRect.top + startRect.height / 2
      };
      
      const cartIconPosition = {
        left: cartRect.left + cartRect.width / 2,
        top: cartRect.top + cartRect.height / 2
      };

      // Create flying item element
      const flyingItem = document.createElement('div');
      flyingItem.className = 'flying-item';
      
      // Style the flying item
      flyingItem.style.position = 'fixed';
      flyingItem.style.width = '70px';
      flyingItem.style.height = '70px';
      flyingItem.style.borderRadius = '50%';
      flyingItem.style.backgroundColor = selectedColor;
      flyingItem.style.boxShadow = `0 0 20px 5px rgba(255,255,255,0.7), 0 0 30px 10px ${selectedColor}`;
      flyingItem.style.border = '4px solid white';
      flyingItem.style.zIndex = '10000';
      flyingItem.style.left = `${startPosition.left - 35}px`;
      flyingItem.style.top = `${startPosition.top - 35}px`;
      flyingItem.style.opacity = '1';
      flyingItem.style.transition = 'all 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)';
      
      document.body.appendChild(flyingItem);
      
      // Animation sequence
      setTimeout(() => {
        flyingItem.style.left = `${cartIconPosition.left - 15}px`;
        flyingItem.style.top = `${cartIconPosition.top - 15}px`;
        flyingItem.style.width = '30px';
        flyingItem.style.height = '30px';
        flyingItem.style.opacity = '0.7';
        
        // Add shine to cart
        setTimeout(() => {
          const shine = document.createElement('div');
          shine.className = 'cart-shine';
          cartIconElement.appendChild(shine);
          
          // Make cart icon pop
          cartIconElement.style.transform = 'scale(1.2)';
          
          setTimeout(() => {
            cartIconElement.style.transform = 'scale(1)';
            
            // Clean up
            setTimeout(() => {
              try {
                if (shine.parentNode) shine.parentNode.removeChild(shine);
                if (flyingItem.parentNode) flyingItem.parentNode.removeChild(flyingItem);
              } catch (e) {
                console.error("Error removing elements:", e);
              }
            }, 300);
          }, 300);
        }, 500);
      }, 50);
    } catch (error) {
      console.error("Error in animation:", error);
    }
  };

  // Help functions for carousel
  const scrollLeft = () => {
    try {
      const gallery = document.getElementById('pot-gallery');
      if (gallery) gallery.scrollLeft += 200;
    } catch (error) {
      console.error("Error scrolling left:", error);
    }
  };

  const scrollRight = () => {
    try {
      const gallery = document.getElementById('pot-gallery');
      if (gallery) gallery.scrollLeft -= 200;
    } catch (error) {
      console.error("Error scrolling right:", error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  // Set model
  const selectModel = (modelPath) => {
    setCurrentModelPath(modelPath);
  };

  return (
    <div className="container" id="design-screen">
      <div id="floating-buttons">
        <button className="floating-btn" onClick={() => navigate('/home')}>בית</button>
        <button className="floating-btn" onClick={handleLogout}>התנתק</button>
      </div>

      {/* Cart Icon Component */}
      <CartIcon />
      
      <div className="logo">
        <img src="/images/logo.png" alt="SmartVase Logo" />
      </div>
      
      <h2>עצב את הכד שלך</h2>
      
      {/* Carousel for vase models */}
      <div className="carousel-wrapper">
        <button className="carousel-arrow left" onClick={scrollLeft}>&#10094;</button>
        
        <div className="carousel-track" id="pot-gallery">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
            <div 
              key={num}
              className={`pot-option ${currentModelPath === `models/vase${num}.stl` ? 'selected' : ''}`}
              data-model={`models/vase${num}.stl`}
              onClick={() => selectModel(`models/vase${num}.stl`)}
            >
              <img src={`/images/vase${num}.png`} alt={`כד ${num}`} />
            </div>
          ))}
        </div>
        
        <button className="carousel-arrow right" onClick={scrollRight}>&#10095;</button>
      </div>
      
      {/* 3D Model Viewer - Using the VaseViewer component */}
      <div className="model-wrapper" style={{ height: '500px' }}>
        <VaseViewer 
          modelPath={currentModelPath} 
          color={selectedColor}
          width={width}
          height={height}
        />
        {isLoading && (
          <div className="ar-loading">
            <div className="spinner"></div>
            <p>טוען את הכד...</p>
          </div>
        )}
      </div>
      
      {/* Height Slider */}
      <div className="slider-label">
        <label htmlFor="height-slider">גובה:</label>
        <span id="height-value">{height} ס"מ</span>
      </div>
      <div className="slider-container">
        <input 
          type="range" 
          id="height-slider" 
          min="5" 
          max="25" 
          value={height}
          onChange={(e) => {
            try {
              const newHeight = parseInt(e.target.value);
              if (isFinite(newHeight) && newHeight > 0) {
                setHeight(newHeight);
                if (showPrice) {
                  updatePriceInternal();
                }
              }
            } catch (error) {
              console.error("Error updating height:", error);
            }
          }}
        />
      </div>

      {/* Width Slider */}
      <div className="slider-label">
        <label htmlFor="width-slider">רוחב:</label>
        <span id="width-value">{width} ס"מ</span>
      </div>
      <div className="slider-container">
        <input 
          type="range" 
          id="width-slider" 
          min="5" 
          max="25" 
          value={width}
          onChange={(e) => {
            try {
              const newWidth = parseInt(e.target.value);
              if (isFinite(newWidth) && newWidth > 0) {
                setWidth(newWidth);
                if (showPrice) {
                  updatePriceInternal();
                }
              }
            } catch (error) {
              console.error("Error updating width:", error);
            }
          }}
        />
      </div>
      
      {/* Color Options */}
      <div id="color-options">
        <p>בחר צבע:</p>
        {Object.keys(colorNames).map((color) => (
          <div 
            key={color}
            className={`color-box ${selectedColor === color ? 'selected' : ''}`}
            style={{ backgroundColor: color }}
            data-color={color}
            onClick={() => {
              try {
                setSelectedColor(color);
              } catch (error) {
                console.error("Error selecting color:", error);
              }
            }}
          ></div>
        ))}
      </div>
      
      {/* Texture Selection */}
      <label>בחר טקסטורה:</label>
      <select 
        id="texture-select"
        value={texture}
        onChange={(e) => {
          try {
            setTexture(e.target.value);
          } catch (error) {
            console.error("Error selecting texture:", error);
          }
        }}
      >
        <option value="">-- בחר טקסטורה --</option>
        <option value="smooth">חלק</option>
        <option value="rough">מחוספס</option>
        <option value="matte">מט</option>
      </select>
      
      {/* Calculate Price */}
      <button id="calculate-price" onClick={handleCalculatePrice}>חשב מחיר</button>
      {showPrice && <p id="price-display">המחיר: {price} ש"ח</p>}
      
      {/* Add to Cart */}
      <button id="add-to-cart" onClick={handleAddToCart}>הוסף לעגלה</button>
    </div>
  );
};

export default DesignScreen;