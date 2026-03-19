import React from "react";
import VariantPriceEditor from "./admin/VariantPriceEditor";

const priceFormatter = new Intl.NumberFormat("th-TH", {
  maximumFractionDigits: 0,
});

const getSafeNumber = (value, fallback = 0) => {
  return Number.isFinite(value) ? value : fallback;
};

const formatBaht = (value) => `฿${priceFormatter.format(Math.max(getSafeNumber(value, 0), 0))}`;
const isVariantActive = (variant) => variant?.active !== false;
const isVariantDisabled = (variant) => !isVariantActive(variant);

const ProductInfoPanel = ({
  titleSlot = null,
  productName = "สินค้าตัวอย่าง",
  soldCount = 0,
  totalRatings = 0,
  averageRating = 0,
  variants = [],
  selectedVariantId,
  selectedVariant,
  isEditMode = false,
  quantity = 1,
  favoriteCount = 20,
  internalNote = "",
  onSaveVariantRows = () => {},
  onRestoreDefaultVariantRows,
  onVariantChange,
  onDecreaseQuantity,
  onIncreaseQuantity,
  onQuantityInputChange,
  onAddToCart,
  onBuyNow,
}) => {
  const safeVariants = Array.isArray(variants) ? variants : [];
  const activeVariants = safeVariants.filter((variant) => isVariantActive(variant));
  const hasActiveVariants = activeVariants.length > 0;
  const hasSelectedVariant = Boolean(selectedVariant && selectedVariant.id);
  const variantPriceValues = activeVariants
    .map((variant) => getSafeNumber(variant?.price, 0))
    .filter((price) => Number.isFinite(price));
  const minVariantPrice = variantPriceValues.length ? Math.min(...variantPriceValues) : 0;
  const maxVariantPrice = variantPriceValues.length ? Math.max(...variantPriceValues) : 0;

  const selectedVariantPrice = hasSelectedVariant ? getSafeNumber(selectedVariant.price, 0) : 0;
  const selectedVariantActive = hasSelectedVariant ? isVariantActive(selectedVariant) : false;
  const selectedCompareAtPrice = hasSelectedVariant
    ? getSafeNumber(selectedVariant.compareAtPrice, null)
    : null;
  const variantStock = hasSelectedVariant
    ? Math.max(getSafeNumber(selectedVariant.stock, 0), 0)
    : 0;
  const selectedVariantDisabled = hasSelectedVariant ? !selectedVariantActive : false;
  const isOutOfStock = hasSelectedVariant ? variantStock <= 0 : false;
  const disablePurchaseActions = !hasSelectedVariant || selectedVariantDisabled || isOutOfStock;
  const deliveryWindowText = "จะได้รับภายใน 13 มี.ค. - 15 มี.ค.";
  const safeFavoriteCount = Math.max(getSafeNumber(favoriteCount, 0), 0);

  const isPriceUnavailable = !hasSelectedVariant && !variantPriceValues.length;
  const priceDisplayText = hasSelectedVariant && selectedVariantActive
    ? formatBaht(selectedVariantPrice)
    : !variantPriceValues.length
      ? "ยังไม่เปิดขาย"
      : minVariantPrice === maxVariantPrice
      ? formatBaht(minVariantPrice)
      : `${formatBaht(minVariantPrice)} - ${formatBaht(maxVariantPrice)}`;

  const discountPercent = hasSelectedVariant && selectedVariantActive && selectedCompareAtPrice
    ? Math.max(
        0,
        Math.round(((selectedCompareAtPrice - selectedVariantPrice) / selectedCompareAtPrice) * 100)
      )
    : 0;

  return (
    <section className="pm-info-panel" aria-label="ข้อมูลสินค้า">
      {titleSlot || <h1 className="pm-product-title">{productName}</h1>}

      <div className="pm-product-meta">
        <div className="pm-meta-item">
          <span className="pm-meta-value">{getSafeNumber(averageRating, 0).toFixed(1)}</span>
          <span className="pm-stars">{"★".repeat(5)}</span>
          <span className="pm-meta-label">({getSafeNumber(totalRatings, 0)} คะแนน)</span>
        </div>
        <span className="pm-meta-divider" />
        <div className="pm-meta-item">
          <span className="pm-meta-value">{getSafeNumber(soldCount, 0).toLocaleString("th-TH")}</span>
          <span className="pm-meta-label">ขายแล้ว</span>
        </div>
      </div>

      <div className="pm-price-box">
        <span className={`pm-price-current ${isPriceUnavailable ? "is-unavailable" : ""}`}>
          {priceDisplayText}
        </span>
        {hasSelectedVariant && selectedVariantActive && selectedCompareAtPrice ? (
          <span className="pm-price-original">{formatBaht(selectedCompareAtPrice)}</span>
        ) : null}
        {hasSelectedVariant && selectedVariantActive && discountPercent > 0 ? (
          <span className="pm-price-badge">-{discountPercent}%</span>
        ) : null}
        {isEditMode ? (
          <VariantPriceEditor
            variants={safeVariants}
            onSave={onSaveVariantRows}
            onRestoreDefault={onRestoreDefaultVariantRows}
          />
        ) : null}
      </div>

      <div className="pm-detail-stack">
        <section className="pm-detail-row">
          <h2 className="pm-detail-title">การจัดส่ง</h2>
          <div className="pm-detail-content">
            <div className="pm-detail-line pm-detail-line-head">
              <svg
                className="pm-detail-icon is-delivery"
                viewBox="0 0 20 20"
                width="20"
                height="20"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M1.45831 4.16669C1.11314 4.16669 0.833313 4.44651 0.833313 4.79169V14.375C0.833313 14.7202 1.11314 15 1.45831 15H3.49158C3.57186 16.1052 4.49366 16.978 5.6207 16.978C6.74775 16.978 7.66955 16.1052 7.74983 15H12.0833L12.0867 15H13.219C13.2993 16.1054 14.2222 16.978 15.3481 16.978C16.4751 16.978 17.3969 16.1052 17.4772 15H18.9134C19.1184 15 19.3103 14.8995 19.4271 14.731C19.5438 14.5626 19.5706 14.3476 19.4986 14.1556L16.8172 7.00285C16.7257 6.75887 16.4925 6.59723 16.232 6.59723H12.7083V4.79169C12.7083 4.44651 12.4285 4.16669 12.0833 4.16669H1.45831ZM17.1822 13.75H18.0116L15.7988 7.84723H12.7083V13.75H13.5142C13.887 13.1262 14.5689 12.7084 15.3481 12.7084C16.128 12.7084 16.8097 13.1263 17.1822 13.75ZM5.6207 12.7084C4.84077 12.7084 4.15912 13.1263 3.78662 13.75H2.08331V5.41669H11.4583V13.75H7.45479C7.08229 13.1263 6.40064 12.7084 5.6207 12.7084ZM5.6207 13.9584C5.13174 13.9584 4.7359 14.3547 4.7359 14.8432C4.7359 15.3317 5.13174 15.728 5.6207 15.728C6.10967 15.728 6.50551 15.3317 6.50551 14.8432C6.50551 14.3547 6.10967 13.9584 5.6207 13.9584ZM14.4633 14.8432C14.4633 14.3549 14.8598 13.9584 15.3481 13.9584C15.837 13.9584 16.2329 14.3547 16.2329 14.8432C16.2329 15.3317 15.837 15.728 15.3481 15.728C14.8598 15.728 14.4633 15.3314 14.4633 14.8432Z"
                />
              </svg>
              <span className="pm-delivery-window">{deliveryWindowText}</span>
              <svg className="pm-detail-chevron" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M14.94 12L9.47 6.53l1.06-1.06 5.647 5.646a1.25 1.25 0 010 1.768L10.53 18.53l-1.06-1.06L14.94 12z"
                />
              </svg>
            </div>
            <div className="pm-detail-line pm-delivery-free">ส่งฟรี</div>
            <div className="pm-detail-line pm-delivery-note">รับโค้ดส่วนลด ฿30 หากได้รับสินค้าล่าช้า</div>
          </div>
        </section>

        <section className="pm-detail-row">
          <h2 className="pm-detail-title">ช้อปปี้การันตี</h2>
          <div className="pm-detail-content">
            <div className="pm-detail-line pm-detail-line-head">
              <svg
                className="pm-detail-icon is-guarantee"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                aria-hidden="true"
              >
                <path d="M8 1.6L13.4 3.5V7.8C13.4 10.8 11.5 13.5 8 14.5C4.5 13.5 2.6 10.8 2.6 7.8V3.5L8 1.6ZM8 3L4 4.4V7.8C4 10 5.3 12 8 12.9C10.7 12 12 10 12 7.8V4.4L8 3Z" />
              </svg>
              <span className="pm-guarantee-text">เก็บเงินปลายทาง</span>
              <svg className="pm-detail-chevron is-down" viewBox="0 0 12 12" width="12" height="12" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M6 8.146L11.146 3l.707.707-5.146 5.147a1 1 0 01-1.414 0L.146 3.707.854 3 6 8.146z"
                />
              </svg>
            </div>
          </div>
        </section>

        <section className="pm-detail-row">
          <h2 className="pm-detail-title">ตัวเลือก</h2>
          <div className="pm-detail-content">
            <div className="pm-variant-list is-inline">
              {safeVariants.map((variant) => {
                const isDisabled = isVariantDisabled(variant);
                const isSelected = selectedVariantId === variant.id;

                return (
                  <button
                    key={variant.id}
                    type="button"
                    className={`pm-variant-btn ${isSelected ? "is-selected" : ""} ${
                      isDisabled ? "is-disabled" : ""
                    }`}
                    onClick={() => onVariantChange?.(variant.id)}
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="pm-detail-row">
          <h2 className="pm-detail-title">จำนวน</h2>
          <div className="pm-detail-content">
            <div className="pm-qty-stock-row">
              <div className="pm-qty-wrap">
                <button
                  type="button"
                  className="pm-qty-btn"
                  onClick={onDecreaseQuantity}
                  disabled={disablePurchaseActions || quantity <= 1}
                  aria-label="ลดจำนวนสินค้า"
                >
                  -
                </button>
                <input
                  className="pm-qty-input"
                  type="number"
                  min={1}
                  max={hasSelectedVariant ? Math.max(variantStock, 1) : 1}
                  value={quantity}
                  onChange={(event) => onQuantityInputChange?.(Number(event.target.value))}
                  disabled={disablePurchaseActions}
                  aria-label="จำนวนสินค้า"
                />
                <button
                  type="button"
                  className="pm-qty-btn"
                  onClick={onIncreaseQuantity}
                  disabled={disablePurchaseActions || quantity >= variantStock}
                  aria-label="เพิ่มจำนวนสินค้า"
                >
                  +
                </button>
              </div>
              <span className={`pm-stock-hint ${hasSelectedVariant && isOutOfStock ? "pm-stock-out" : ""}`}>
                {!hasSelectedVariant
                  ? hasActiveVariants
                    ? "ยังไม่ได้เลือกตัวเลือกสินค้า"
                    : "ยังไม่มีตัวเลือกที่เปิดขาย"
                  : !selectedVariantActive
                    ? "ตัวเลือกนี้ปิดการขาย"
                    : isOutOfStock
                    ? "สินค้าหมด"
                    : `มีสินค้าทั้งหมด ${variantStock} ชิ้น`}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="pm-action-row">
        <button
          type="button"
          className="pm-btn pm-btn-outline"
          onClick={onAddToCart}
          disabled={disablePurchaseActions}
        >
          เพิ่มไปยังรถเข็น
        </button>
        <button
          type="button"
          className="pm-btn pm-btn-primary"
          onClick={onBuyNow}
          disabled={disablePurchaseActions}
        >
          ซื้อสินค้า
        </button>
      </div>

      <div className="pm-social-row">
        <div className="pm-share-wrap">
          <span className="pm-share-label">แชร์:</span>
          <button
            type="button"
            className="pm-share-btn is-messenger"
            aria-label="Share on Messenger"
          >
            M
          </button>
          <button
            type="button"
            className="pm-share-btn is-facebook"
            aria-label="Share on Facebook"
          >
            f
          </button>
          <button
            type="button"
            className="pm-share-btn is-pinterest"
            aria-label="Share on Pinterest"
          >
            P
          </button>
          <button
            type="button"
            className="pm-share-btn is-twitter"
            aria-label="Share on Twitter"
          >
            X
          </button>
        </div>

        <div className="pm-favorite-wrap">
          <button
            type="button"
            className="pm-favorite-btn"
            aria-label={`Favorite (${safeFavoriteCount})`}
          >
            <svg width="24" height="20" viewBox="0 0 24 20" className="pm-favorite-icon" aria-hidden="true">
              <path
                d="M19.469 1.262c-5.284-1.53-7.47 4.142-7.47 4.142S9.815-.269 4.532 1.262C-1.937 3.138.44 13.832 12 19.333c11.559-5.501 13.938-16.195 7.469-18.07z"
                stroke="#FF424F"
                strokeWidth="1.5"
                fill="none"
                fillRule="evenodd"
                strokeLinejoin="round"
              />
            </svg>
            <span className="pm-favorite-label">
              Favorite ({safeFavoriteCount.toLocaleString("th-TH")})
            </span>
          </button>
        </div>
      </div>

      <p className="pm-cta-note">
        {internalNote || "หน้านี้เป็นตัวอย่างการแสดงผล ยังไม่เชื่อมต่อระบบขายจริง"}
      </p>
    </section>
  );
};

export default ProductInfoPanel;
