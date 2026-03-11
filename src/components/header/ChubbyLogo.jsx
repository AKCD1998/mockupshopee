import React from "react";

const ChubbyLogo = () => {
  return (
    <a className="chb-logo" href="#" aria-label="Chubby Home">
      <span className="chb-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" className="chb-logo-svg">
          <defs>
            <linearGradient id="chbLogoBag" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7f3" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>
          </defs>
          <path
            d="M15 22h34l-2.7 30.5A4 4 0 0 1 42.3 56H21.7a4 4 0 0 1-3.98-3.5L15 22Z"
            fill="url(#chbLogoBag)"
          />
          <path
            d="M15 22h34l-2.7 30.5A4 4 0 0 1 42.3 56H21.7a4 4 0 0 1-3.98-3.5L15 22Z"
            fill="none"
            stroke="#ff8f69"
            strokeWidth="2.4"
          />
          <path
            d="M22.5 24.5v-3.3C22.5 15.5 26.9 11 32 11s9.5 4.5 9.5 10.2v3.3"
            fill="none"
            stroke="#fff2ec"
            strokeLinecap="round"
            strokeWidth="4.6"
          />
          <path
            d="M22.5 24.5v-3.3C22.5 15.5 26.9 11 32 11s9.5 4.5 9.5 10.2v3.3"
            fill="none"
            stroke="#ff8c65"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
          <path
            d="M31.9 28.8c2.2-3.4 7.5-1.6 7.5 2.3 0 3.5-3 5.8-7.4 9.2-4.4-3.4-7.4-5.7-7.4-9.2 0-3.9 5.2-5.7 7.3-2.3Z"
            fill="#ff6d4c"
          />
        </svg>
      </span>

      <span className="chb-logo-copy">
        <span className="chb-logo-brand">Chubby</span>
        <span className="chb-logo-tagline">So Chubby Baby</span>
      </span>
    </a>
  );
};

export default ChubbyLogo;

