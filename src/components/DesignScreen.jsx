import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
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
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#f14a4a");
  const [texture, setTexture] = useState("");
  const [height, setHeight] = useState(15);
  const [width, setWidth] = useState(15);
  const [price, setPrice] = useState(0);
  const [currentModelPath, setCurrentModelPath] = useState('models/vase1.stl');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Three.js references
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const potMeshRef = useRef(null);

  // Load cart from localStorage on component mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cartItems');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        setCartCount(parsedCart.length);
        setTotalPrice(parsedCart.reduce((sum, item) => sum + item.price, 0));
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cartItems]);

  // Calculate price based on dimensions
  const calculatePrice = useCallback(() => {
    try {
      const newPrice = (parseInt(height) + parseInt(width)) * 2;
      setPrice(newPrice);
    } catch (error) {
      console.error("Error calculating price:", error);
      setPrice(0);
    }
  }, [height, width]);

  // Load STL model function - defined before it's used
  const loadSTLModel = useCallback((modelPath) => {
    try {
      if (!sceneRef.current || !cameraRef.current || !controlsRef.current) {
        console.warn("Scene, camera, or controls not initialized yet");
        return;
      }

      setIsLoading(true);
      
      const loader = new STLLoader();
      
      loader.load(
        modelPath,
        (geometry) => {
          try {
            geometry.computeBoundingBox();
            geometry.center();

            const material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(selectedColor),
              roughness: 0.5,
              metalness: 0.1
            });

            // Remove previous model if exists
            if (potMeshRef.current) {
              sceneRef.current.remove(potMeshRef.current);
            }

            // Create new mesh
            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.set(-Math.PI / 2, 0, 0);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Calculate original dimensions
            const box = new THREE.Box3().setFromObject(mesh);
            const size = new THREE.Vector3();
            box.getSize(size);
            const modelHeight = size.z;
            const modelWidth = (size.x + size.y) / 2;

            // Store original dimensions
            mesh.userData.originalHeight = modelHeight;
            mesh.userData.originalWidth = modelWidth;

            // Scale the model
            const scaleZ = height / modelHeight;
            const scaleXY = width / modelWidth;
            mesh.scale.set(scaleXY, scaleXY, scaleZ);

            // Add to scene
            sceneRef.current.add(mesh);
            potMeshRef.current = mesh;

            // Update camera position based on model size
            mesh.updateMatrixWorld(true);
            const updatedBox = new THREE.Box3().setFromObject(mesh);
            const newCenter = new THREE.Vector3();
            updatedBox.getCenter(newCenter);
            controlsRef.current.target.copy(newCenter);

            const updatedSize = new THREE.Vector3();
            updatedBox.getSize(updatedSize);
            const maxSize = Math.max(updatedSize.x, updatedSize.y, updatedSize.z);
            const fov = cameraRef.current.fov * (Math.PI / 180);
            const distance = (maxSize / 2) / Math.tan(fov / 2);
            const cameraBackFactor = 2.8;
            cameraRef.current.position.copy(
              newCenter.clone().add(new THREE.Vector3(0, 0, distance * cameraBackFactor))
            );

            controlsRef.current.update();
            setIsLoading(false);
            
            // Calculate price
            calculatePrice();
          } catch (error) {
            console.error("Error processing STL model:", error);
            setIsLoading(false);
          }
        },
        undefined,
        (error) => {
          console.error('Error loading STL:', error);
          setIsLoading(false);
          alert('נתקלנו בבעיה בטעינת הדגם. אנא נסה שנית');
        }
      );
    } catch (error) {
      console.error("Error in loadSTLModel function:", error);
      setIsLoading(false);
    }
  }, [selectedColor, height, width, calculatePrice]);

  // Initialize 3D scene
  useEffect(() => {
    try {
      if (!containerRef.current || initialized) return;

      const initScene = () => {
        try {
          const container = containerRef.current;
          if (!container) return;
          
          const width = container.clientWidth;
          const height = container.clientHeight;

          // Scene setup
          const scene = new THREE.Scene();
          sceneRef.current = scene;

          // Camera setup
          const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
          camera.position.set(0, 0, 150);
          cameraRef.current = camera;

          // Renderer setup
          const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
          renderer.setSize(width, height);
          renderer.setClearColor(0xf9f9f9);
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFSoftShadowMap;
          rendererRef.current = renderer;
          
          // Clear container before adding new canvas
          container.innerHTML = '';
          container.appendChild(renderer.domElement);

          // Lights
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
          scene.add(ambientLight);

          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(50, 50, 100);
          directionalLight.castShadow = true;
          directionalLight.shadow.mapSize.width = 1024;
          directionalLight.shadow.mapSize.height = 1024;
          directionalLight.shadow.radius = 4;
          scene.add(directionalLight);

          const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
          backLight.position.set(-50, -50, -100);
          scene.add(backLight);

          // Controls
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.enableDamping = true;
          controls.dampingFactor = 0.05;
          controls.rotateSpeed = 0.8;
          controlsRef.current = controls;

          // Ground plane
          const ground = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.ShadowMaterial({ opacity: 0.15 })
          );
          ground.name = 'ground';
          ground.rotation.x = -Math.PI / 2;
          ground.position.y = -30;
          ground.receiveShadow = true;
          scene.add(ground);

          // Animation loop
          const animate = () => {
            if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
            
            requestAnimationFrame(animate);
            if (controlsRef.current) controlsRef.current.update();
            
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          };
          
          animate();
          setInitialized(true);
        } catch (error) {
          console.error("Error initializing scene:", error);
        }
      };

      initScene();
      
      // Load model after scene is initialized
      setTimeout(() => {
        if (sceneRef.current && cameraRef.current && controlsRef.current) {
          loadSTLModel(currentModelPath);
        }
      }, 100);

      // Handle window resize
      const handleResize = () => {
        try {
          if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
          
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          
          rendererRef.current.setSize(width, height);
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        } catch (error) {
          console.error("Error handling resize:", error);
        }
      };

      window.addEventListener('resize', handleResize);
      
      return () => {
        try {
          window.removeEventListener('resize', handleResize);
          
          // Clean up Three.js resources
          if (rendererRef.current) {
            rendererRef.current.dispose();
            if (rendererRef.current.domElement && rendererRef.current.domElement.parentNode) {
              rendererRef.current.domElement.parentNode.removeChild(rendererRef.current.domElement);
            }
          }
          
          if (potMeshRef.current) {
            if (potMeshRef.current.geometry) potMeshRef.current.geometry.dispose();
            if (potMeshRef.current.material) {
              if (Array.isArray(potMeshRef.current.material)) {
                potMeshRef.current.material.forEach(material => material.dispose());
              } else {
                potMeshRef.current.material.dispose();
              }
            }
          }
          
          if (sceneRef.current) {
            // Dispose all objects in the scene
            sceneRef.current.traverse((object) => {
              if (object.geometry) object.geometry.dispose();
              if (object.material) {
                if (Array.isArray(object.material)) {
                  object.material.forEach(material => material.dispose());
                } else {
                  object.material.dispose();
                }
              }
            });
          }
        } catch (error) {
          console.error("Error cleaning up:", error);
        }
      };
    } catch (error) {
      console.error("Error in main useEffect:", error);
    }
  }, [currentModelPath, loadSTLModel, initialized]);

  // Update model dimensions
  const updateModelScaleAndCamera = useCallback(() => {
    try {
      if (!potMeshRef.current || !controlsRef.current) return;

      if (potMeshRef.current.userData && 
          potMeshRef.current.userData.originalHeight && 
          potMeshRef.current.userData.originalWidth) {
        
        const scaleZ = height / potMeshRef.current.userData.originalHeight;
        const scaleXY = width / potMeshRef.current.userData.originalWidth;

        // Ensure scales are valid numbers
        if (isFinite(scaleZ) && isFinite(scaleXY) && scaleZ > 0 && scaleXY > 0) {
          potMeshRef.current.scale.set(scaleXY, scaleXY, scaleZ);
          potMeshRef.current.updateMatrixWorld(true);

          // Update orbit controls target if available
          if (controlsRef.current && controlsRef.current.target) {
            const box = new THREE.Box3().setFromObject(potMeshRef.current);
            const center = new THREE.Vector3();
            box.getCenter(center);
            controlsRef.current.target.copy(center);
            controlsRef.current.update();
          }
        }
      }
    } catch (error) {
      console.error("Error updating model scale:", error);
    }
  }, [height, width]);

  // Change model color
  const changeModelColor = useCallback((color) => {
    try {
      if (potMeshRef.current && potMeshRef.current.material) {
        potMeshRef.current.material.color.set(color);
      }
    } catch (error) {
      console.error("Error changing model color:", error);
    }
  }, []);

  // Add item to cart
  const addItemToCart = () => {
    try {
      if (!selectedColor) {
        alert('אנא בחר צבע לפני הוספה לעגלה.');
        return false;
      }

      if (!texture) {
        alert('אנא בחר טקסטורה לפני הוספה לעגלה.');
        return false;
      }

      // Ensure price is calculated
      const calculatedPrice = (parseInt(height) + parseInt(width)) * 2;
      
      // Create the item
      const colorName = colorNames[selectedColor] || selectedColor;
      const item = {
        id: Date.now(),
        height,
        width,
        color: selectedColor,
        colorName,
        texture,
        price: calculatedPrice,
        model: currentModelPath
      };

      // Try to use animation, but fallback to direct update if it fails
      try {
        createFlyingItemAnimation(() => {
          setCartItems(prev => [...prev, item]);
          setCartCount(prev => prev + 1);
          setTotalPrice(prev => prev + calculatedPrice);
          setShowCart(true);
        });
      } catch (error) {
        console.error("Animation error, using direct update:", error);
        setCartItems(prev => [...prev, item]);
        setCartCount(prev => prev + 1);
        setTotalPrice(prev => prev + calculatedPrice);
        setShowCart(true);
      }
      
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    }
  };

  // Flying item animation
  const createFlyingItemAnimation = (onComplete) => {
    try {
      const addToCartButton = document.getElementById('add-to-cart');
      const cartIconElement = document.getElementById('cart-icon');
      
      if (!addToCartButton || !cartIconElement) {
        onComplete();
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
      
      document.body.appendChild(flyingItem);
      
      // Animation sequence using setTimeout for simplicity
      // Initial pulse
      setTimeout(() => {
        flyingItem.style.width = '75px';
        flyingItem.style.height = '75px';
        
        setTimeout(() => {
          flyingItem.style.width = '70px';
          flyingItem.style.height = '70px';
          
          // Move up first
          setTimeout(() => {
            flyingItem.style.transition = 'top 300ms ease-out';
            flyingItem.style.top = `${startPosition.top - 150}px`;
            
            // Then to cart
            setTimeout(() => {
              flyingItem.style.transition = 'all 500ms ease-in';
              flyingItem.style.left = `${cartIconPosition.left - 15}px`;
              flyingItem.style.top = `${cartIconPosition.top - 15}px`;
              flyingItem.style.width = '30px';
              flyingItem.style.height = '30px';
              
              // Add shine to cart
              setTimeout(() => {
                const shine = document.createElement('div');
                shine.className = 'cart-shine';
                cartIconElement.appendChild(shine);
                
                // Make cart icon pop
                cartIconElement.style.transform = 'scale(1.7)';
                
                setTimeout(() => {
                  cartIconElement.style.transform = 'scale(1)';
                  
                  setTimeout(() => {
                    try {
                      if (shine.parentNode) shine.parentNode.removeChild(shine);
                      if (flyingItem.parentNode) flyingItem.parentNode.removeChild(flyingItem);
                    } catch (e) {
                      console.error("Error removing elements:", e);
                    }
                    onComplete();
                  }, 300);
                }, 300);
              }, 500);
            }, 300);
          }, 300);
        }, 150);
      }, 150);
    } catch (error) {
      console.error("Error in animation:", error);
      onComplete(); // Ensure callback is called even if animation fails
    }
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    try {
      const itemIndex = cartItems.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        const item = cartItems[itemIndex];
        setTotalPrice(prev => prev - item.price);
        
        const newCartItems = [...cartItems];
        newCartItems.splice(itemIndex, 1);
        setCartItems(newCartItems);
        setCartCount(prev => prev - 1);
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  // Helper function to get texture name
  const getTextureName = (value) => {
    switch (value) {
      case 'smooth': return 'חלק';
      case 'rough': return 'מחוספס';
      case 'matte': return 'מט';
      default: return value;
    }
  };

  // Go to checkout
  const goToCheckout = () => {
    try {
      navigate('/checkout');
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = '/checkout';
    }
  };

  // Safe scroll functions
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

  // Safe navigation
  const navigateTo = (path) => {
    try {
      navigate(path);
    } catch (error) {
      console.error("Navigation error:", error);
      window.location.href = path;
    }
  };

  // Set model and load
  const selectModel = (modelPath) => {
    try {
      setCurrentModelPath(modelPath);
      setTimeout(() => {
        loadSTLModel(modelPath);
      }, 50);
    } catch (error) {
      console.error("Error selecting model:", error);
    }
  };

  return (
    <div className="container" id="design-screen">
      <div id="floating-buttons">
        <button className="floating-btn" onClick={() => navigateTo('/home')}>בית</button>
        <button className="floating-btn" onClick={() => navigateTo('/')}>התנתק</button>
      </div>

      {/* Cart Icon */}
      <div id="cart-container">
        <div id="cart-icon" onClick={() => setShowCart(prev => !prev)}>
          🛒 <span id="cart-count">{cartCount}</span>
        </div>
        
        {showCart && (
          <div id="cart-details">
            <h3>העגלה שלך</h3>
            {cartItems.length > 0 ? (
              <>
                <ul id="cart-items">
                  {cartItems.map(item => (
                    <li key={item.id} data-id={item.id}>
                      <span 
                        style={{float: 'left', color: 'red', cursor: 'pointer'}} 
                        className="remove-item"
                        onClick={() => removeFromCart(item.id)}
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
                <button id="checkout" onClick={goToCheckout}>לתשלום</button>
              </>
            ) : (
              <>
                <p style={{ textAlign: 'center', padding: '10px' }}>העגלה ריקה</p>
                <button id="continue-shopping" onClick={() => setShowCart(false)}>המשך קנייה</button>
              </>
            )}
          </div>
        )}
      </div>

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
      
      {/* 3D Model Viewer */}
      <div className="model-wrapper">
        <div id="3d-model-container" ref={containerRef} style={{ width: '100%', height: '500px', position: 'relative' }}>
          {isLoading && (
            <div className="ar-loading">
              <div className="spinner"></div>
              <p>טוען את הכד...</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Height Slider */}
      <div className="slider-label">
        <label htmlFor="height-slider">גובה:</label>
        <span id="height-value">{height} ס"מ</span>
      </div>
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
              // Using setTimeout to ensure state is updated
              setTimeout(() => {
                updateModelScaleAndCamera();
                calculatePrice();
              }, 10);
            }
          } catch (error) {
            console.error("Error updating height:", error);
          }
        }}
      />
      
      {/* Width Slider */}
      <div className="slider-label">
        <label htmlFor="width-slider">רוחב:</label>
        <span id="width-value">{width} ס"מ</span>
      </div>
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
              // Using setTimeout to ensure state is updated
              setTimeout(() => {
                updateModelScaleAndCamera();
                calculatePrice();
              }, 10);
            }
          } catch (error) {
            console.error("Error updating width:", error);
          }
        }}
      />
      
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
                changeModelColor(color);
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
      <button id="calculate-price" onClick={() => {
        try {
          calculatePrice();
        } catch (error) {
          console.error("Error calculating price:", error);
        }
      }}>חשב מחיר</button>
      <p id="price-display">המחיר: {price} ש"ח</p>
      
      {/* Add to Cart */}
      <button id="add-to-cart" onClick={() => {
        try {
          addItemToCart();
        } catch (error) {
          console.error("Error adding to cart:", error);
        }
      }}>הוסף לעגלה</button>
    </div>
  );
};

export default DesignScreen;