import React from "react";

const ChubbyCartButton = ({ count = 2 }) => {
  return (
    <button type="button" className="chb-cart-button" aria-label="ตะกร้าสินค้า">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M3 5h2.4l1.2 7.1a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 1.9-1.4l1.8-5.8H7.3"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="18.5" r="1.35" fill="currentColor" />
        <circle cx="16.6" cy="18.5" r="1.35" fill="currentColor" />
      </svg>
      {count > 0 ? <span className="chb-cart-badge">{count}</span> : null}
    </button>
  );
};

export default ChubbyCartButton;

