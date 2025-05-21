import React from "react";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const navigate = useNavigate();

  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];

  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.price;
  }, 0);

  const goToCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="container">
      <h2>העגלה שלך</h2>
      {cartItems.length === 0 ? (
        <p>אין מוצרים בעגלה</p>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index}>
                {item.name} - {item.price} ש"ח
              </li>
            ))}
          </ul>
          <p>סה״כ לתשלום: {totalPrice} ש"ח</p>
          <button onClick={goToCheckout}>לתשלום</button>
        </>
      )}
    </div>
  );
}
