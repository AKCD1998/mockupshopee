import React, { useRef } from "react";
import { getProductRoute } from "../utils/appRoutes";

const priceFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const SameShopCarousel = ({ items = [], onNavigateToProduct = null }) => {
  const trackRef = useRef(null);

  const handleScroll = (direction) => {
    if (!trackRef.current) {
      return;
    }
    const amount = direction === "left" ? -340 : 340;
    trackRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleNavigate = (event, slug) => {
    if (
      typeof onNavigateToProduct !== "function" ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    onNavigateToProduct(slug);
  };

  return (
    <section className="pm-section-card pm-carousel-card" aria-label="สินค้าจากร้านเดียวกัน">
      <div className="pm-carousel-header">
        <h2 className="pm-section-title">จากร้านเดียวกัน</h2>
        <div className="pm-carousel-controls">
          <button
            type="button"
            className="pm-carousel-arrow"
            onClick={() => handleScroll("left")}
            aria-label="เลื่อนซ้าย"
          >
            ‹
          </button>
          <button
            type="button"
            className="pm-carousel-arrow"
            onClick={() => handleScroll("right")}
            aria-label="เลื่อนขวา"
          >
            ›
          </button>
        </div>
      </div>

      <div className="pm-carousel-track" ref={trackRef}>
        {items.map((item) => (
          <article className="pm-carousel-item" key={item.id}>
            <a
              href={item.slug ? getProductRoute(item.slug) : "#"}
              className="pm-carousel-link"
              onClick={(event) => {
                if (!item.slug) {
                  event.preventDefault();
                  return;
                }

                handleNavigate(event, item.slug);
              }}
            >
              <div className="pm-carousel-image-wrap">
                <img src={item.image} alt={item.name} className="pm-carousel-image" />
              </div>
              <h3 className="pm-carousel-name">{item.name}</h3>
              <div className="pm-carousel-price-row">
                <span className="pm-carousel-price">{priceFormatter.format(item.price)}</span>
              </div>
              <div className="pm-carousel-meta">
                <span className="pm-carousel-rating">★ {item.rating.toFixed(1)}</span>
                <span className="pm-carousel-sold">
                  ขายแล้ว {item.sold.toLocaleString("th-TH")}
                </span>
              </div>
            </a>
          </article>
        ))}
      </div>
    </section>
  );
};

export default SameShopCarousel;
