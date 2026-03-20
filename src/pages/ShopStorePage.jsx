import React, { useEffect, useMemo, useState } from "react";
import ChubbyTopHeader from "../components/header/ChubbyTopHeader";
import mockProduct, { getAllMockProducts } from "../data/mockProduct";
import { SHOP_PROMO_BANNER_IMAGES, SHOP_PROMO_PRODUCT_IMAGES } from "../data/shopPromoAssets";
import { getStoredDisplayProducts } from "../utils/displayProduct";
import { EDITABLE_CONTENT_CHANGED_EVENT } from "../utils/editableContentStorage";
import { PRODUCT_ROUTE, getProductRoute } from "../utils/appRoutes";
import "../styles/chubby-header.css";
import "../styles/store-page.css";

const priceFormatter = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("th-TH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const getStorefrontActiveVariants = (product = {}) => {
  if (!Array.isArray(product.variants)) {
    return [];
  }

  const activeVariants = product.variants.filter((variant) => variant?.active !== false);
  return activeVariants.length ? activeVariants : product.variants;
};

const getStorefrontProductSummary = (product = {}, options = {}) => {
  const variants = getStorefrontActiveVariants(product);
  const preferredVariant =
    typeof options.preferredVariantId === "string" && options.preferredVariantId.trim()
      ? variants.find((variant) => variant?.id === options.preferredVariantId.trim()) || null
      : null;
  const primaryVariant = preferredVariant || variants[0] || {};
  const prices = (preferredVariant ? [preferredVariant] : variants)
    .map((variant) => variant?.price)
    .filter((price) => Number.isFinite(price));
  const compareAtPrices = (preferredVariant ? [preferredVariant] : variants)
    .map((variant) => variant?.compareAtPrice)
    .filter((price) => Number.isFinite(price));

  return {
    id: product.id || "mock-product",
    slug: product.slug || "",
    name: product.name || "สินค้าตัวอย่าง",
    image:
      typeof options.imageOverride === "string" && options.imageOverride.trim()
        ? options.imageOverride.trim()
        : Array.isArray(product.images) && product.images.length
          ? product.images[0]
          : "",
    price: prices.length ? Math.min(...prices) : 0,
    originalPrice: compareAtPrices.length ? Math.max(...compareAtPrices) : null,
    ratingLabel: Number.isFinite(product.ratingSummary?.score)
      ? product.ratingSummary.score.toFixed(1)
      : "0.0",
    soldCount: Number.isFinite(product.soldCount) ? product.soldCount : 0,
    variantLabel:
      typeof primaryVariant.label === "string" && primaryVariant.label.trim()
        ? primaryVariant.label.trim()
        : "ตัวเลือกมาตรฐาน",
  };
};

const buildStoreProductCardData = (product = {}, overrides = {}, options = {}) => {
  const productSummary = getStorefrontProductSummary(product, options);

  return {
    id: productSummary.id,
    slug: productSummary.slug,
    image: productSummary.image,
    imageAlt: productSummary.name,
    name: productSummary.name,
    price: productSummary.price,
    originalPrice: productSummary.originalPrice,
    ratingLabel: productSummary.ratingLabel,
    soldLabel: `ขายแล้ว ${compactNumberFormatter.format(productSummary.soldCount)} ชิ้น`,
    ...overrides,
  };
};

const getDiscountLabel = (price, originalPrice) => {
  if (!Number.isFinite(price) || !Number.isFinite(originalPrice) || originalPrice <= price) {
    return null;
  }

  const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  return discount > 0 ? `-${discount}%` : null;
};

const OverviewMetaIcon = ({ iconId }) => {
  const sharedProps = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (iconId) {
    case "products":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path {...sharedProps} d="M3.5 6.5h13v10h-13z" />
          <path {...sharedProps} d="M6 6.5V4.8h8V6.5" />
          <path {...sharedProps} d="M3.5 9.5h13" />
        </svg>
      );
    case "followers":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle {...sharedProps} cx="7" cy="6.5" r="2.4" />
          <path {...sharedProps} d="M3.7 14.8c.7-2.1 2.5-3.3 4.9-3.3s4.1 1.2 4.8 3.3" />
          <path {...sharedProps} d="M14.2 7.1c1.7.2 2.8 1.2 3.4 2.8" />
        </svg>
      );
    case "following":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <circle {...sharedProps} cx="7" cy="6.5" r="2.4" />
          <path {...sharedProps} d="M3.7 14.8c.7-2.1 2.5-3.3 4.9-3.3s4.1 1.2 4.8 3.3" />
          <path {...sharedProps} d="M14.5 6.2h3" />
          <path {...sharedProps} d="M16 4.7v3" />
        </svg>
      );
    case "rating":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path
            {...sharedProps}
            d="M10 3.5 11.8 7l3.8.5-2.8 2.7.7 3.8L10 12.2 6.5 14l.7-3.8L4.4 7.5 8.2 7z"
          />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path {...sharedProps} d="M4 5.2h12v7.6H8.1L4 15.5z" />
          <path {...sharedProps} d="M7 8.2h6" />
          <path {...sharedProps} d="M7 10.7h4.6" />
        </svg>
      );
    case "joined":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path {...sharedProps} d="M4.2 5.3h11.6v10.5H4.2z" />
          <path {...sharedProps} d="M4.2 8.2h11.6" />
          <path {...sharedProps} d="M7 3.8v3" />
          <path {...sharedProps} d="M13 3.8v3" />
        </svg>
      );
    case "registration":
      return (
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path {...sharedProps} d="M4 4.8h12v10.4H4z" />
          <path {...sharedProps} d="M7 8h6" />
          <path {...sharedProps} d="M7 10.6h6" />
          <path {...sharedProps} d="M7 13.2h3.4" />
        </svg>
      );
    default:
      return null;
  }
};

const StoreProductCard = ({ product, onNavigate = () => {}, className = "" }) => {
  const productHref = product.href || (product.slug ? getProductRoute(product.slug) : PRODUCT_ROUTE);

  const handleCardNavigate = (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    if (!product.slug) {
      return;
    }

    event.preventDefault();
    onNavigate(product.slug);
  };

  return (
    <a
      href={productHref}
      className={["store-recommend-card", className].filter(Boolean).join(" ")}
      onClick={handleCardNavigate}
      aria-label={`เปิดหน้าสินค้า ${product.name}`}
    >
      <div className="store-recommend-card__image-wrap">
        <img
          src={product.image}
          alt={product.imageAlt || product.name}
          className="store-recommend-card__image"
        />
        {product.badge ? (
          <span className="store-recommend-card__overlay-badge">{product.badge}</span>
        ) : null}
      </div>

      <div className="store-recommend-card__body">
        <h3 className="store-recommend-card__name">{product.name}</h3>

        <div className="store-recommend-card__price-row">
          <strong className="store-recommend-card__price">
            {priceFormatter.format(product.price)}
          </strong>
          {Number.isFinite(product.originalPrice) ? (
            <span className="store-recommend-card__original-price">
              {priceFormatter.format(product.originalPrice)}
            </span>
          ) : null}
        </div>

        {product.voucherLabel ? (
          <div className="store-recommend-card__voucher-tag">{product.voucherLabel}</div>
        ) : null}

        <div className="store-recommend-card__meta">
          {product.ratingLabel ? (
            <span className="store-recommend-card__rating">★ {product.ratingLabel}</span>
          ) : null}
          {product.soldLabel ? (
            <span className="store-recommend-card__sold">{product.soldLabel}</span>
          ) : null}
        </div>
      </div>
    </a>
  );
};

const StoreOverviewSection = ({
  ariaLabel,
  eyebrow,
  title,
  buttonLabel,
  onButtonClick = () => {},
  productSlug = "",
  featuredImage,
  featuredImageAlt,
  badge,
  productName,
  description,
  price,
  originalPrice,
  metaItems = [],
  detailEyebrow,
  detailTitle,
  detailItems = [],
  categoryTitle,
  categoryItems = [],
}) => (
  <section className="store-overview-grid" aria-label={ariaLabel}>
    <article className="store-panel store-panel-featured">
      <div className="store-panel-heading">
        <div>
          <p className="store-eyebrow">{eyebrow}</p>
          <h2 className="store-section-title">{title}</h2>
        </div>
        {buttonLabel ? (
          <button
            type="button"
            className="store-link-btn"
            onClick={() => onButtonClick(productSlug)}
          >
            {buttonLabel}
          </button>
        ) : null}
      </div>

      <div className="store-featured-product">
        <div className="store-featured-image-wrap">
          <img src={featuredImage} alt={featuredImageAlt} className="store-featured-image" />
        </div>

        <div className="store-featured-copy">
          <span className="store-product-badge">{badge}</span>
          <h3 className="store-featured-name">{productName}</h3>
          <p className="store-featured-description">{description}</p>

          <div className="store-price-stack">
            <strong className="store-featured-price">{priceFormatter.format(price)}</strong>
            {Number.isFinite(originalPrice) ? (
              <span className="store-featured-original-price">
                {priceFormatter.format(originalPrice)}
              </span>
            ) : null}
          </div>

          <div className="store-meta-row">
            {metaItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </article>

    <aside className="store-panel store-panel-side">
      <div className="store-panel-heading">
        <div>
          <p className="store-eyebrow">{detailEyebrow}</p>
          <h2 className="store-section-title">{detailTitle}</h2>
        </div>
      </div>

      <dl className="store-detail-list">
        {detailItems.map((item) => (
          <div className="store-detail-row" key={`${item.label}-${item.value}`}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="store-category-block">
        <h3 className="store-side-title">{categoryTitle}</h3>
        <div className="store-category-list">
          {categoryItems.map((item) => (
            <span className="store-category-pill" key={item}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </aside>
  </section>
);

const STORE_FOOTER_ARTICLES = [
  {
    title: "Dr. Morepen Medical TH – ร้านค้าคุณภาพบน Shopee สะดวก คุ้ม ส่งไว",
    paragraphs: [
      "Dr. Morepen Medical TH เป็นร้านค้าที่นำเสนอสินค้าคุณภาพ พร้อมให้คุณได้เพลิดเพลินกับประสบการณ์การช้อปปิ้งออนไลน์ที่สะดวก รวดเร็ว ปลอดภัย และคุ้มค่าบน Shopee",
    ],
  },
  {
    title: "📦 สินค้าแท้ การันตีคุณภาพ",
    paragraphs: [
      "ไม่ว่าจะเป็นอุปกรณ์ทางการแพทย์และสินค้าเพื่อสุขภาพจาก Dr. Morepen Medical TH ทั้งหมดล้วนคัดสรรมาเพื่อให้คุณมั่นใจได้ในทุกการสั่งซื้อ",
    ],
  },
  {
    title: "💰 ช้อปคุ้มกับส่วนลดพิเศษ",
    paragraphs: [
      "พบกับโปรโมชั่นสุดคุ้ม โค้ดส่วนลด และดีลเฉพาะบน Shopee ที่ช่วยลดค่าใช้จ่ายในทุกคำสั่งซื้อได้มากยิ่งขึ้น",
    ],
  },
  {
    title: "⚡ Flash Sale ลดพิเศษในเวลาจำกัด",
    paragraphs: [
      "ไม่ควรพลาดดีลเด็ดจากสินค้าราคาพิเศษในช่วงแคมเปญ Flash Sale ลดราคาสินค้ายอดฮิตในช่วงเวลาสั้น ๆ",
    ],
  },
  {
    title: "🚚 ส่งไวทั่วไทย ถึงมือคุณในไม่กี่วัน",
    paragraphs: [
      "ร้าน Dr. Morepen Medical TH เราพร้อมจัดส่งสินค้าอย่างรวดเร็วทั่วประเทศ ช่วยให้ได้รับของที่ต้องการโดยไม่ต้องรอนาน",
    ],
  },
  {
    title: "🎥 ดูรีวิวและวีดีโอสินค้าได้เต็มๆจาก Shopee Video & Shopee LIVE",
    paragraphs: [
      "คุณสามารถดูรีวิวจากลูกค้าจริงผ่าน Shopee Video หรือร่วมชมการถ่ายทอดสดสินค้าได้ทันทีบน Shopee LIVE",
    ],
  },
  {
    title: "💳 SPayLater – ผ่อนจ่ายได้สบายกว่า",
    paragraphs: [
      "สะดวกยิ่งขึ้นด้วยตัวเลือกผ่อนชำระสินค้า ช่วยให้คุณสั่งซื้อสินค้ากับ SPayLater ได้ง่ายขึ้น และเลือกผ่อนจ่ายสบายได้ตามต้องการ",
    ],
  },
  {
    title: "📌 กดติดตามร้าน Dr. Morepen Medical TH เพื่อไม่พลาดโปรดี ๆ และสินค้าคุณภาพที่คุณต้องช้อป!",
    paragraphs: [],
  },
];

const STORE_FOOTER_LINK_COLUMNS = [
  {
    title: "ศูนย์ช่วยเหลือ",
    items: [
      "Help Centre",
      "สั่งซื้อสินค้าอย่างไร",
      "เริ่มขายสินค้าอย่างไร",
      "นโยบายการชำระเงินใน Shopee",
      "Shopee Coins",
      "การสั่งซื้อสินค้า",
      "การคืนเงินและคืนสินค้า",
      "ทำไมใช้ Shopee แล้วดีกว่า?",
      "ติดต่อ Shopee",
    ],
  },
  {
    title: "เกี่ยวกับ SHOPEE",
    items: [
      "เกี่ยวกับเรา",
      "โปรแกรม Affiliate",
      "ร่วมงานกับเรา",
      "นักลงทุน",
      "นโยบายความเป็นส่วนตัวของ Shopee",
      "Shopee Blog",
      "Shopee Mall",
      "Seller Centre",
      "Flash Deals",
      "ผู้ติดต่อสื่อโฆษณา",
    ],
  },
];

const STORE_FOOTER_PAYMENT_METHODS = [
  "SPay",
  "COD",
  "VISA",
  "Mastercard",
  "PromptPay",
  "KBank",
  "SCB",
  "UOB",
];

const STORE_FOOTER_SHIPPING_METHODS = [
  "SPX Express",
  "BEST Express",
  "J&T Express",
  "DHL eCommerce",
  "Kerry Express",
  "Flash Express",
];

const STORE_FOOTER_SOCIAL_LINKS = ["Facebook", "Instagram", "Line", "LinkedIn"];
const STORE_FOOTER_APP_LINKS = ["App Store", "Google Play", "AppGallery"];
const STORE_FOOTER_COUNTRIES = [
  "สิงคโปร์",
  "อินโดนีเซีย",
  "ไต้หวัน",
  "มาเลเซีย",
  "เวียดนาม",
  "ฟิลิปปินส์",
  "บราซิล",
  "เม็กซิโก",
  "โคลัมเบีย",
];

const STORE_LISTING_CATEGORY_ITEMS = [
  { id: "all-products", label: "สินค้าทั้งหมด", count: "28" },
  { id: "medical", label: "เวชภัณฑ์", count: "18" },
  { id: "glucometer", label: "เครื่องตรวจน้ำตาล", count: "6" },
  { id: "accessories", label: "อุปกรณ์เสริม", count: "4" },
];

const STORE_LISTING_SORT_ITEMS = [
  { id: "popular", label: "ยอดนิยม" },
  { id: "latest", label: "ล่าสุด" },
  { id: "best-selling", label: "สินค้าขายดี" },
  { id: "price", label: "ราคา" },
];

const STORE_LISTING_PAGES = ["1", "2", "3"];
const STORE_BANNER_IMAGE_SRC = SHOP_PROMO_BANNER_IMAGES.storefrontHero;
const STORE_BG03_GALLERY_IMAGE_SRCS = {
  meterOnly: SHOP_PROMO_PRODUCT_IMAGES.meterOnly,
  meterStripBundle: SHOP_PROMO_PRODUCT_IMAGES.meterStrip25,
};
const STORE_FEATURE_BANNER_GRID_IMAGES = [
  {
    id: "top-left",
    src: SHOP_PROMO_BANNER_IMAGES.featureGridTopLeft,
    alt: "ภาพแบนเนอร์รายละเอียดร้านตำแหน่งซ้ายบน",
  },
  {
    id: "top-right",
    src: SHOP_PROMO_BANNER_IMAGES.featureGridTopRight,
    alt: "ภาพแบนเนอร์รายละเอียดร้านตำแหน่งขวาบน",
  },
  {
    id: "bottom-left",
    src: SHOP_PROMO_BANNER_IMAGES.featureGridBottomLeft,
    alt: "ภาพแบนเนอร์รายละเอียดร้านตำแหน่งซ้ายล่าง",
  },
  {
    id: "bottom-right",
    src: SHOP_PROMO_BANNER_IMAGES.featureGridBottomRight,
    alt: "ภาพแบนเนอร์รายละเอียดร้านตำแหน่งขวาล่าง",
  },
];
const STORE_TOP_SALES_BANNER_SRC = SHOP_PROMO_BANNER_IMAGES.topSales;
const STORE_VERTICAL_BANNER_SRC = SHOP_PROMO_BANNER_IMAGES.vertical;
const STORE_OVERVIEW_BANNER_SRC = SHOP_PROMO_BANNER_IMAGES.overview;
const STORE_OVERVIEW_INSERT_BANNER_SRC = SHOP_PROMO_BANNER_IMAGES.overviewInsert;
const STORE_SECONDARY_OVERVIEW_FEATURED_IMAGE_SRC = SHOP_PROMO_PRODUCT_IMAGES.stethoscope;
const EXCLUDED_STOREFRONT_PRODUCT_SLUGS = [
  "dr-morepen-blood-pressure-monitor-bp12",
  "sinocare-safe-aq-test-strips-50",
  "sinocare-sterile-lancets-100",
];
const STORE_TOP_SALES_CARD_CONFIGS = [
  {
    id: "top-sales-1",
    productSlug: "dr-morepen-glucoone-bg03-meter-strip-kit",
    preferredVariantId: "meter-strip-25",
    nameOverride: "DR.MOREPEN GLUCOONE BG-03 เครื่อง + แถบตรวจ 25-50 ชิ้น",
    badge: "ขายดี",
    voucherLabel: "โค้ดลด ฿20 เมื่อซื้อครบ ฿499",
  },
  {
    id: "top-sales-2",
    productSlug: "dr-morepen-professionals-deluxe-stethoscope",
    preferredVariantId: "stethoscope-black",
    badge: "ช้อปปี้ถูกชัวร์",
    voucherLabel: "ส่งฟรีเมื่อซื้อครบ ฿699",
  },
  {
    id: "top-sales-3",
    productSlug: "dr-morepen-glucoone-bg03-test-strips",
    preferredVariantId: "test-strips-25",
    badge: "อุปกรณ์เสริม",
    voucherLabel: "มีแถบตรวจพร้อมส่ง",
  },
  {
    id: "top-sales-4",
    productSlug: "dr-morepen-glucoone-bg03",
    preferredVariantId: "meter-strip-50",
    nameOverride: "DR.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาล + ตัวเลือกแถบตรวจ",
    imageOverride: SHOP_PROMO_PRODUCT_IMAGES.meterStrip50,
    badge: "หลายตัวเลือก",
    voucherLabel: "เลือกชุดที่ต้องการได้",
  },
  {
    id: "top-sales-5",
    productSlug: "dr-morepen-glucoone-bg03-meter-only",
    preferredVariantId: "meter-only",
    nameOverride: "DR.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาลอย่างเดียว",
    badge: "ของแท้",
    voucherLabel: "ดีลพิเศษเฉพาะวันนี้",
  },
];
const STORE_SHOP_LISTING_CARD_CONFIGS = [
  {
    id: "shop-listing-meter",
    productSlug: "dr-morepen-glucoone-bg03-meter-only",
    preferredVariantId: "meter-only",
    nameOverride: "DR.MOREPEN GLUCOONE BG-03 เครื่องวัดน้ำตาลอย่างเดียว",
    promoLabel: "ช้อปปี้ถูกชัวร์",
    badgeLabel: "Mall",
  },
  {
    id: "shop-listing-strip-pack",
    productSlug: "dr-morepen-glucoone-bg03-meter-strip-kit",
    preferredVariantId: "meter-strip-25",
    nameOverride: "DR.MOREPEN GLUCOONE BG-03 เครื่อง + แถบตรวจ 25-50 ชิ้น",
    variantLabelOverride: "เลือกได้ 25 / 50 ชิ้น",
    promoLabel: "ส่งฟรี",
    badgeLabel: "Mall",
  },
  {
    id: "shop-listing-stethoscope",
    productSlug: "dr-morepen-professionals-deluxe-stethoscope",
    preferredVariantId: "stethoscope-black",
    promoLabel: "ส่งไว",
    badgeLabel: "Mall",
  },
  {
    id: "shop-listing-test-strips",
    productSlug: "dr-morepen-glucoone-bg03-test-strips",
    preferredVariantId: "test-strips-25",
    promoLabel: "ใช้กับเครื่อง BG-03 เท่านั้น",
    variantLabelOverride: "รายการนี้มีเฉพาะแผ่นตรวจ",
    badgeLabel: "Mall",
  },
];

const ShopStorePage = ({ onNavigateToProduct = () => {} }) => {
  const [isFollowingStore, setIsFollowingStore] = useState(false);
  const [isTalkingToStore, setIsTalkingToStore] = useState(false);
  const [activeShopTab, setActiveShopTab] = useState("home");
  const [activeListingCategory, setActiveListingCategory] = useState("all-products");
  const [activeSortOption, setActiveSortOption] = useState("popular");
  const [editableContentVersion, setEditableContentVersion] = useState(0);
  const storefrontProducts = useMemo(() => {
    const products = getAllMockProducts();
    return Array.isArray(products) && products.length ? products : [mockProduct];
  }, []);
  useEffect(() => {
    const handleEditableContentSync = () => {
      setEditableContentVersion((prev) => prev + 1);
    };

    window.addEventListener(EDITABLE_CONTENT_CHANGED_EVENT, handleEditableContentSync);
    window.addEventListener("storage", handleEditableContentSync);

    return () => {
      window.removeEventListener(EDITABLE_CONTENT_CHANGED_EVENT, handleEditableContentSync);
      window.removeEventListener("storage", handleEditableContentSync);
    };
  }, []);
  const displayStorefrontProducts = useMemo(
    // Shared merged product data for storefront cards + product page.
    () => getStoredDisplayProducts(storefrontProducts),
    [editableContentVersion, storefrontProducts]
  );
  const storefrontCardProducts = useMemo(() => {
    const eligibleProducts = displayStorefrontProducts.filter(
      (product) => !EXCLUDED_STOREFRONT_PRODUCT_SLUGS.includes(product.slug)
    );

    return eligibleProducts.length ? eligibleProducts : displayStorefrontProducts;
  }, [displayStorefrontProducts]);
  const storefrontCardProductsBySlug = useMemo(
    () =>
      new Map(
        storefrontCardProducts
          .filter((product) => product?.slug || product?.id)
          .map((product) => [product.slug || product.id, product])
      ),
    [storefrontCardProducts]
  );
  const storefrontBaseProductsBySlug = useMemo(
    () =>
      new Map(
        storefrontProducts
          .filter((product) => product?.slug || product?.id)
          .map((product) => [product.slug || product.id, product])
      ),
    [storefrontProducts]
  );
  const featuredProduct = useMemo(() => {
    const featuredSourceProduct =
      displayStorefrontProducts[0] || storefrontProducts[0] || mockProduct;
    const activeVariants = Array.isArray(featuredSourceProduct.variants)
      ? featuredSourceProduct.variants.filter((variant) => variant?.active !== false)
      : [];
    const basePrices = activeVariants
      .map((variant) => variant?.price)
      .filter((price) => Number.isFinite(price));
    const compareAtPrices = activeVariants
      .map((variant) => variant?.compareAtPrice)
      .filter((price) => Number.isFinite(price));

    return {
      id: featuredSourceProduct.id,
      slug: featuredSourceProduct.slug || featuredSourceProduct.id,
      name: featuredSourceProduct.name,
      image: featuredSourceProduct.images?.[0] || "",
      price: basePrices.length ? Math.min(...basePrices) : 0,
      originalPrice: compareAtPrices.length ? Math.max(...compareAtPrices) : null,
      sold: featuredSourceProduct.soldCount || 0,
      rating: featuredSourceProduct.ratingSummary?.score || 0,
    };
  }, [displayStorefrontProducts, storefrontProducts]);

  const categoryPath = Array.isArray(mockProduct.categoryPath) ? mockProduct.categoryPath : [];
  const shop = mockProduct.shop || {};
  const shopTabItems = useMemo(
    () => [
      { id: "home", label: "หน้าแรก" },
      { id: "all-products", label: "สินค้าทั้งหมด" },
      { id: "medical", label: "เวชภัณฑ์" },
    ],
    []
  );
  const sellerOverviewItems = useMemo(
    () => [
      {
        id: "product-count",
        iconId: "products",
        label: "รายการสินค้า",
        value: "28",
      },
      {
        id: "followers",
        iconId: "followers",
        label: "ผู้ติดตาม",
        value: "20.8k",
      },
      {
        id: "following",
        iconId: "following",
        label: "กำลังติดตาม",
        value: "2",
      },
      {
        id: "rating",
        iconId: "rating",
        label: "คะแนน",
        value: "4.9",
        detail: "(การให้คะแนนทั้งหมด 55.7k)",
      },
      {
        id: "chat-performance",
        iconId: "chat",
        label: "ประสิทธิภาพการแชท",
        value: "69%",
        detail: "(ภายในไม่กี่ชั่วโมง)",
      },
      {
        id: "joined",
        iconId: "joined",
        label: "เข้าร่วมเมื่อ",
        value: "4 ปี ที่ผ่านมา",
      },
      {
        id: "registration",
        iconId: "registration",
        label: "เลขทะเบียนนิติบุคคล",
        value: "0625565000585",
      },
    ],
    []
  );
  const sellerLastActiveText = "เข้าสู่ระบบล่าสุดเมื่อ 5 นาทีที่ผ่านมา";
  const storeOverviewDetailItems = useMemo(
    () => [
      { label: "เริ่มขายเมื่อ", value: shop.joinedAt || "-" },
      { label: "เวลาตอบกลับ", value: shop.responseTime || "-" },
      { label: "แบรนด์เด่น", value: mockProduct.specs?.brand || "-" },
      { label: "หมวดหลัก", value: categoryPath[categoryPath.length - 1] || "-" },
    ],
    [categoryPath, shop.joinedAt, shop.responseTime]
  );
  const storeOverviewMetaItems = useMemo(
    () => [
      `★ ${featuredProduct.rating.toFixed(1)}`,
      `ขายแล้ว ${compactNumberFormatter.format(featuredProduct.sold)}`,
      `จัดส่งจาก ${mockProduct.specs?.shipFrom || "-"}`,
    ],
    [featuredProduct]
  );
  const secondaryOverviewMetaItems = useMemo(
    () => ["★ 4.8", "ขายแล้ว 320 ชิ้น", `จัดส่งจาก ${mockProduct.specs?.shipFrom || "-"}`],
    []
  );
  const secondaryOverviewDetailItems = useMemo(
    () => [
      { label: "ประเภทสินค้า", value: "หูฟังทางการแพทย์" },
      { label: "วัสดุ", value: "Stainless Steel + Silicone" },
      { label: "ความยาว", value: "29 นิ้ว" },
      { label: "ลักษณะหัวฟัง", value: "Dual Head" },
    ],
    []
  );
  const secondaryOverviewCategoryItems = useMemo(
    () => ["อุปกรณ์ทางการแพทย์", "คลินิกและโรงพยาบาล", "นักศึกษาแพทย์"],
    []
  );
  const recommendationProduct = useMemo(
    () => {
      const sourceProduct =
        storefrontCardProducts[1] || storefrontCardProducts[0] || mockProduct;
      const sourceProductSummary = getStorefrontProductSummary(sourceProduct);

      return buildStoreProductCardData(sourceProduct, {
        image: sourceProductSummary.image || featuredProduct.image,
        badge: "ช้อปปี้ถูกชัวร์",
        voucherLabel: "ส่วนลด ฿10 เมื่อซื้อครบ ฿399",
        soldLabel: `ขายได้ ${compactNumberFormatter.format(sourceProductSummary.soldCount)} ชิ้น`,
      });
    },
    [featuredProduct.image, storefrontCardProducts]
  );
  const topSalesProducts = useMemo(
    () =>
      STORE_TOP_SALES_CARD_CONFIGS.map((cardConfig) => {
        const sourceProduct =
          storefrontCardProductsBySlug.get(cardConfig.productSlug) ||
          storefrontCardProducts[0] ||
          mockProduct;
        const baseProduct =
          storefrontBaseProductsBySlug.get(cardConfig.productSlug) || sourceProduct;
        const shouldUseConfiguredName =
          cardConfig.nameOverride && baseProduct?.name === sourceProduct?.name;

        return buildStoreProductCardData(sourceProduct, {
          id: cardConfig.id,
          ...(shouldUseConfiguredName
            ? {
                name: cardConfig.nameOverride,
                imageAlt: cardConfig.nameOverride,
              }
            : {}),
          badge: cardConfig.badge,
          voucherLabel: cardConfig.voucherLabel,
        }, {
          imageOverride: cardConfig.imageOverride,
          preferredVariantId: cardConfig.preferredVariantId,
        });
      }),
    [storefrontBaseProductsBySlug, storefrontCardProducts, storefrontCardProductsBySlug]
  );
  const recommendationSectionTitle =
    activeShopTab === "medical" ? "เวชภัณฑ์แนะนำสำหรับคุณ" : "สินค้าแนะนำสำหรับคุณ";
  const shopListingCards = useMemo(() => {
    return STORE_SHOP_LISTING_CARD_CONFIGS.map((cardConfig) => {
      const sourceProduct =
        storefrontCardProductsBySlug.get(cardConfig.productSlug) ||
        storefrontCardProducts[0] ||
        mockProduct;
      const baseProduct =
        storefrontBaseProductsBySlug.get(cardConfig.productSlug) || sourceProduct;
      const productSummary = getStorefrontProductSummary(sourceProduct, {
        preferredVariantId: cardConfig.preferredVariantId,
        imageOverride: cardConfig.imageOverride,
      });
      const shouldUseConfiguredName =
        cardConfig.nameOverride && baseProduct?.name === sourceProduct?.name;

      return {
        id: cardConfig.id,
        slug: productSummary.slug,
        name: shouldUseConfiguredName ? cardConfig.nameOverride : productSummary.name,
        variantLabel: cardConfig.variantLabelOverride || productSummary.variantLabel,
        image: productSummary.image || featuredProduct.image,
        price: productSummary.price,
        originalPrice: productSummary.originalPrice,
        ratingLabel: productSummary.ratingLabel,
        soldLabel: `ขายแล้ว ${compactNumberFormatter.format(productSummary.soldCount)} ชิ้น`,
        promoLabel: cardConfig.promoLabel,
        badgeLabel: cardConfig.badgeLabel,
        discountLabel: getDiscountLabel(productSummary.price, productSummary.originalPrice),
      };
    });
  }, [
    featuredProduct.image,
    storefrontBaseProductsBySlug,
    storefrontCardProducts,
    storefrontCardProductsBySlug,
  ]);
  const soldOutListingCards = useMemo(
    () => {
      const soldOutSources = storefrontCardProducts.slice(4, 5);
      const fallbackSources = soldOutSources.length
        ? soldOutSources
        : storefrontCardProducts.slice(-1);

      return fallbackSources.map((product, index) => {
        const productSummary = getStorefrontProductSummary(product);

        return {
          id: `soldout-${productSummary.id}-${index}`,
          slug: productSummary.slug,
          name: `${productSummary.name} ล็อตก่อนหน้า`,
          image: productSummary.image || featuredProduct.image,
          price: productSummary.price,
          originalPrice: productSummary.originalPrice,
          ratingLabel: productSummary.ratingLabel,
          soldLabel: "หมดชั่วคราว",
        };
      });
    },
    [featuredProduct.image, storefrontCardProducts]
  );
  const activeListingCategoryLabel =
    STORE_LISTING_CATEGORY_ITEMS.find((item) => item.id === activeListingCategory)?.label ||
    "สินค้าทั้งหมด";

  return (
    <main className="store-page with-chubby-header">
      <ChubbyTopHeader />

      <div className="store-shell">
        <div className="store-container">
          <nav className="store-breadcrumbs" aria-label="เส้นทางหน้าร้าน">
            <button type="button" className="store-breadcrumb-link" onClick={onNavigateToProduct}>
              สินค้า mockup
            </button>
            <span className="store-breadcrumb-separator">/</span>
            <span className="store-breadcrumb-current">{shop.name}</span>
          </nav>

          <section className="store-overview" aria-label="ข้อมูลร้าน">
            <div className="store-overview__left">
              <div className="store-overview__bg" aria-hidden="true">
                <img
                  src={featuredProduct.image}
                  alt=""
                  className="store-overview__bg-image"
                />
              </div>
              <div className="store-overview__mask" aria-hidden="true" />

              <div className="store-overview__seller">
                <div className="store-overview__avatar-wrap">
                  <img
                    src={shop.avatarSrc}
                    alt={`โลโก้ร้าน ${shop.name}`}
                    className="store-overview__avatar"
                  />
                </div>

                <div className="store-overview__identity">
                  <div className="store-overview__badge-row">
                    <span className="store-overview__badge">Official Store</span>
                  </div>
                  <h1 className="store-overview__name">{shop.name}</h1>
                  <p className="store-overview__status">{sellerLastActiveText}</p>

                  <div className="store-overview__actions">
                    <button
                      type="button"
                      className={`store-overview__action store-overview__action--follow ${
                        isFollowingStore ? "is-active" : ""
                      }`}
                      onClick={() => setIsFollowingStore((prev) => !prev)}
                    >
                      <span className="store-overview__action-symbol">+</span>
                      {isFollowingStore ? "ติดตามแล้ว" : "ติดตาม"}
                    </button>
                    <button
                      type="button"
                      className={`store-overview__action store-overview__action--talk ${
                        isTalkingToStore ? "is-active" : ""
                      }`}
                      onClick={() => setIsTalkingToStore((prev) => !prev)}
                    >
                      {isTalkingToStore ? "เปิดแชทแล้ว" : "พูดคุย"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="store-overview__right">
              <div className="store-overview__meta-grid">
                {sellerOverviewItems.map((item) => (
                  <div className="store-overview__meta-item" key={item.id}>
                    <span className="store-overview__meta-icon">
                      <OverviewMetaIcon iconId={item.iconId} />
                    </span>
                    <div className="store-overview__meta-content">
                      <span className="store-overview__meta-label">{item.label}:</span>
                      <strong className="store-overview__meta-value">{item.value}</strong>
                      {item.detail ? (
                        <span className="store-overview__meta-detail">{item.detail}</span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <nav className="store-shop-nav" aria-label="เมนูหน้าร้าน">
            <div className="store-shop-nav__items">
              {shopTabItems.map((item) => {
                const isActive = item.id === activeShopTab;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`store-shop-nav__item ${isActive ? "is-active" : ""}`}
                    onClick={() => setActiveShopTab(item.id)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          <section className="store-voucher-strip" aria-label="คูปองร้านค้า">
            <div className="store-voucher-card">
              <div className="store-voucher-card__left">
                <div className="store-voucher-card__amount">ส่วนลด ฿10</div>
                <div className="store-voucher-card__minimum">ขั้นต่ำ ฿399</div>
                <div className="store-voucher-card__tag">ซื้อร้านนี้ครั้งแรก</div>
                <div className="store-voucher-card__expiry">ใช้ได้ถึง: 01.06.2026</div>
              </div>

              <div className="store-voucher-card__right">
                <button type="button" className="store-voucher-card__claim-btn">
                  เก็บ
                </button>
                <div className="store-voucher-card__counter">+1</div>
              </div>
            </div>
          </section>

          <section className="store-recommend-section" aria-label={recommendationSectionTitle}>
            <div className="store-recommend-section__header">
              <h2 className="store-recommend-section__title">{recommendationSectionTitle}</h2>
              <button
                type="button"
                className="store-recommend-section__more-btn"
                onClick={onNavigateToProduct}
              >
                ดูทั้งหมด
              </button>
            </div>

            <div className="store-recommend-grid">
              <StoreProductCard
                key={recommendationProduct.id}
                product={recommendationProduct}
                onNavigate={onNavigateToProduct}
              />
            </div>
          </section>

          <section className="store-banner-section" aria-label="แบนเนอร์ร้านค้า">
            <img
              src={STORE_BANNER_IMAGE_SRC}
              alt="แบนเนอร์ร้านค้ารับประกันของแท้ 100%"
              className="store-banner-section__image"
            />
          </section>

          <section
            className="store-feature-banner-grid-section"
            aria-label="ภาพโปรโมตร้านค้าเพิ่มเติม"
          >
            <div className="store-feature-banner-grid">
              {STORE_FEATURE_BANNER_GRID_IMAGES.map((item) => (
                <div key={item.id} className="store-feature-banner-grid__item">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="store-feature-banner-grid__image"
                  />
                </div>
              ))}
            </div>
          </section>

          <section className="store-top-sales-section" aria-label="สินค้าขายดีของร้าน">
            <div className="store-top-sales-section__banner">
              <img
                src={STORE_TOP_SALES_BANNER_SRC}
                alt="แบนเนอร์สินค้าขายดีประจำร้าน"
                className="store-top-sales-section__banner-image"
              />
            </div>

            <div className="store-top-sales-section__header">
              <div>
                <p className="store-eyebrow store-top-sales-section__eyebrow">Best Sellers</p>
                <h2 className="store-top-sales-section__title">ยอดขายสูงสุด</h2>
                <p className="store-top-sales-section__subtitle">
                  รวมสินค้าขายดีประจำร้านที่ลูกค้านิยมเลือกซื้อซ้ำในช่วงนี้
                </p>
              </div>
            </div>

            <div className="store-top-sales-grid">
              {topSalesProducts.map((product) => (
                <StoreProductCard
                  key={product.id}
                  product={product}
                  onNavigate={onNavigateToProduct}
                  className="store-top-sales-grid__card"
                />
              ))}
            </div>
          </section>

          <section className="store-vertical-banner-section" aria-label="แบนเนอร์โปรโมตร้านค้า">
            <img
              src={STORE_VERTICAL_BANNER_SRC}
              alt="แบนเนอร์โปรโมตร้านค้า"
              className="store-vertical-banner-section__image"
            />
          </section>

          <StoreOverviewSection
            ariaLabel="ภาพรวมร้าน"
            eyebrow="Featured Product"
            title="สินค้าที่กำลังดันในร้าน"
            buttonLabel="เปิดหน้าสินค้า"
            onButtonClick={onNavigateToProduct}
            productSlug={featuredProduct.slug}
            featuredImage={featuredProduct.image}
            featuredImageAlt={featuredProduct.name}
            badge="สินค้าไฮไลต์"
            productName={featuredProduct.name}
            description="หน้าร้านนี้จำลองรูปแบบร้านเวชภัณฑ์บน Shopee โดยดึงข้อมูลจริงจาก mock product ปัจจุบันในโปรเจค เพื่อให้คลิกจากการ์ดร้านแล้วเข้ามาดูภาพรวมร้านได้ทันที"
            price={featuredProduct.price}
            originalPrice={featuredProduct.originalPrice}
            metaItems={storeOverviewMetaItems}
            detailEyebrow="About This Shop"
            detailTitle="ข้อมูลที่ลูกค้ามักดู"
            detailItems={storeOverviewDetailItems}
            categoryTitle="หมวดหมู่ในร้าน"
            categoryItems={categoryPath}
          />

          <section className="store-vertical-banner-section" aria-label="แบนเนอร์ข้อมูลร้านเพิ่มเติม">
            <img
              src={STORE_OVERVIEW_BANNER_SRC}
              alt="แบนเนอร์ข้อมูลร้านเพิ่มเติม"
              className="store-vertical-banner-section__image"
            />
          </section>

          <section className="store-vertical-banner-section" aria-label="แบนเนอร์ข้อมูลร้านเพิ่มเติมชุดที่สอง">
            <img
              src={STORE_OVERVIEW_INSERT_BANNER_SRC}
              alt="แบนเนอร์ข้อมูลร้านเพิ่มเติมชุดที่สอง"
              className="store-vertical-banner-section__image"
            />
          </section>

          <StoreOverviewSection
            ariaLabel="ภาพรวมสินค้าแนะนำเพิ่มเติม"
            eyebrow="Product Spotlight"
            title="สินค้าที่น่าดูจากภาพแนะนำล่าสุด"
            buttonLabel="เปิดหน้าสินค้า"
            onButtonClick={onNavigateToProduct}
            productSlug="dr-morepen-professionals-deluxe-stethoscope"
            featuredImage={STORE_SECONDARY_OVERVIEW_FEATURED_IMAGE_SRC}
            featuredImageAlt="หูฟังทางการแพทย์ Dr. Morepen Professionals Deluxe Stethoscope"
            badge="สินค้าขายดี"
            productName="หูฟังทางการแพทย์ Dr. Morepen Professionals Deluxe Stethoscope"
            description="หูฟังแพทย์คุณภาพสูง ให้เสียงคมชัด แม่นยำ โครงสร้างทำจาก Stainless Steel แข็งแรง มาพร้อมหูฟังซิลิโคน 100% น้ำหนักเบา ใช้งานสบาย เหมาะสำหรับทั้งบุคลากรทางการแพทย์และผู้ใช้งานทั่วไปที่ต้องการอุปกรณ์มาตรฐานระดับมืออาชีพ"
            price={239}
            originalPrice={279}
            metaItems={secondaryOverviewMetaItems}
            detailEyebrow="Product Details"
            detailTitle="ข้อมูลสินค้า"
            detailItems={secondaryOverviewDetailItems}
            categoryTitle="เหมาะสำหรับ"
            categoryItems={secondaryOverviewCategoryItems}
          />

          <section className="store-shop-products" aria-label="สินค้าทั้งหมดในร้าน">
            <div className="store-shop-products__category-bar">
              <div>
                <p className="store-shop-products__eyebrow">หมวดหมู่</p>
                <h2 className="store-shop-products__title">{activeListingCategoryLabel}</h2>
              </div>

              <div className="store-shop-products__category-strip" aria-label="หมวดหมู่แบบย่อ">
                {STORE_LISTING_CATEGORY_ITEMS.map((item) => {
                  const isActive = item.id === activeListingCategory;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`store-shop-products__chip ${isActive ? "is-active" : ""}`}
                      onClick={() => setActiveListingCategory(item.id)}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="store-shop-products__main">
              <aside className="store-shop-products__categories" aria-label="หมวดหมู่สินค้า">
                <h3 className="store-shop-products__sidebar-title">หมวดหมู่</h3>
                <div className="store-shop-products__category-list">
                  {STORE_LISTING_CATEGORY_ITEMS.map((item) => {
                    const isActive = item.id === activeListingCategory;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`store-shop-products__category-item ${isActive ? "is-active" : ""}`}
                        onClick={() => setActiveListingCategory(item.id)}
                      >
                        <span>{item.label}</span>
                        <span className="store-shop-products__category-count">{item.count}</span>
                      </button>
                    );
                  })}
                </div>
              </aside>

              <div className="store-shop-products__content">
                <div className="store-shop-products__sortbar">
                  <div className="store-shop-products__sort-group">
                    <span className="store-shop-products__sort-label">เรียงโดย</span>
                    {STORE_LISTING_SORT_ITEMS.map((item) => {
                      const isActive = item.id === activeSortOption;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`store-shop-products__sort-button ${isActive ? "is-active" : ""}`}
                          onClick={() => setActiveSortOption(item.id)}
                        >
                          {item.label}
                          {item.id === "price" ? (
                            <span className="store-shop-products__sort-caret">▾</span>
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <span className="store-shop-products__sort-count">
                    {displayStorefrontProducts.length} รายการ
                  </span>
                </div>

                <div className="store-shop-products__grid">
                  {shopListingCards.map((item) => (
                    <a
                      className="store-shop-products__card"
                      key={item.id}
                      href={item.slug ? getProductRoute(item.slug) : PRODUCT_ROUTE}
                      onClick={(event) => {
                        if (
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
                        onNavigateToProduct(item.slug);
                      }}
                    >
                      <div className="store-shop-products__card-image-wrap">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="store-shop-products__card-image"
                        />
                        <span className="store-shop-products__card-badge">
                          {item.badgeLabel}
                        </span>
                        {item.discountLabel ? (
                          <span className="store-shop-products__card-discount">
                            {item.discountLabel}
                          </span>
                        ) : null}
                      </div>

                      <div className="store-shop-products__card-body">
                        <h3 className="store-shop-products__card-title">{item.name}</h3>

                        <div className="store-shop-products__card-price-row">
                          <strong className="store-shop-products__card-price">
                            {priceFormatter.format(item.price)}
                          </strong>
                          {Number.isFinite(item.originalPrice) ? (
                            <span className="store-shop-products__card-original-price">
                              {priceFormatter.format(item.originalPrice)}
                            </span>
                          ) : null}
                        </div>

                        <div className="store-shop-products__card-tags">
                          <span className="store-shop-products__card-tag">{item.promoLabel}</span>
                          <span className="store-shop-products__card-tag store-shop-products__card-tag--muted">
                            {item.variantLabel}
                          </span>
                        </div>

                        <div className="store-shop-products__card-meta">
                          <span>★ {item.ratingLabel}</span>
                          <span>{item.soldLabel}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <div className="store-shop-products__pagination" aria-label="เปลี่ยนหน้า">
                  {STORE_LISTING_PAGES.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`store-shop-products__page-button ${page === "1" ? "is-active" : ""}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button type="button" className="store-shop-products__page-button">
                    &gt;
                  </button>
                </div>

                <section className="store-shop-products__soldout" aria-label="สินค้าหมด">
                  <div className="store-shop-products__soldout-header">
                    <h3 className="store-shop-products__soldout-title">สินค้าหมด</h3>
                    <span className="store-shop-products__soldout-note">
                      ตัวอย่าง mock layout สำหรับสินค้ารอเติมสต็อก
                    </span>
                  </div>

                  <div className="store-shop-products__soldout-grid">
                    {soldOutListingCards.map((item) => (
                      <a
                        className="store-shop-products__card store-shop-products__card--soldout"
                        key={item.id}
                        href={item.slug ? getProductRoute(item.slug) : PRODUCT_ROUTE}
                        onClick={(event) => {
                          if (
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
                          onNavigateToProduct(item.slug);
                        }}
                      >
                        <div className="store-shop-products__card-image-wrap">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="store-shop-products__card-image"
                          />
                          <span className="store-shop-products__soldout-badge">
                            หมดชั่วคราว
                          </span>
                        </div>

                        <div className="store-shop-products__card-body">
                          <h3 className="store-shop-products__card-title">{item.name}</h3>

                          <div className="store-shop-products__card-price-row">
                            <strong className="store-shop-products__card-price">
                              {priceFormatter.format(item.price)}
                            </strong>
                            {Number.isFinite(item.originalPrice) ? (
                              <span className="store-shop-products__card-original-price">
                                {priceFormatter.format(item.originalPrice)}
                              </span>
                            ) : null}
                          </div>

                          <div className="store-shop-products__card-meta">
                            <span>★ {item.ratingLabel}</span>
                            <span>{item.soldLabel}</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </section>

          <section
            id="store-market-footer"
            className="store-market-footer"
            aria-label="ข้อมูลและส่วนท้ายร้าน"
          >
            <div className="store-market-footer__article">
              {STORE_FOOTER_ARTICLES.map((item) => (
                <article className="store-market-footer__article-block" key={item.title}>
                  <h2 className="store-market-footer__article-title">{item.title}</h2>
                  {item.paragraphs.map((paragraph) => (
                    <p className="store-market-footer__article-paragraph" key={paragraph}>
                      {paragraph}
                    </p>
                  ))}
                </article>
              ))}
            </div>

            <div className="store-market-footer__columns">
              {STORE_FOOTER_LINK_COLUMNS.map((column) => (
                <section className="store-market-footer__column" key={column.title}>
                  <h3 className="store-market-footer__column-title">{column.title}</h3>
                  <div className="store-market-footer__link-list">
                    {column.items.map((item) => (
                      <a
                        key={item}
                        href="#store-market-footer"
                        className="store-market-footer__text-link"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </section>
              ))}

              <section className="store-market-footer__column" aria-label="วิธีการชำระเงินและบริการจัดส่ง">
                <h3 className="store-market-footer__column-title">วิธีการชำระเงิน</h3>
                <div className="store-market-footer__badge-grid">
                  {STORE_FOOTER_PAYMENT_METHODS.map((item) => (
                    <span className="store-market-footer__badge" key={item}>
                      {item}
                    </span>
                  ))}
                </div>

                <h4 className="store-market-footer__subheading">บริการจัดส่ง</h4>
                <div className="store-market-footer__badge-grid store-market-footer__badge-grid--shipping">
                  {STORE_FOOTER_SHIPPING_METHODS.map((item) => (
                    <span className="store-market-footer__badge store-market-footer__badge--shipping" key={item}>
                      {item}
                    </span>
                  ))}
                </div>
              </section>

              <section className="store-market-footer__column" aria-label="ติดตามเรา">
                <h3 className="store-market-footer__column-title">ติดตามเรา</h3>
                <div className="store-market-footer__link-list">
                  {STORE_FOOTER_SOCIAL_LINKS.map((item) => (
                    <a
                      key={item}
                      href="#store-market-footer"
                      className="store-market-footer__text-link store-market-footer__text-link--social"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              </section>

              <section className="store-market-footer__column" aria-label="ดาวน์โหลดแอปพลิเคชั่น">
                <h3 className="store-market-footer__column-title">ดาวน์โหลดแอปพลิเคชั่น</h3>
                <div className="store-market-footer__download">
                  <div className="store-market-footer__qr" aria-hidden="true">
                    <span className="store-market-footer__qr-label">QR</span>
                  </div>

                  <div className="store-market-footer__app-list">
                    {STORE_FOOTER_APP_LINKS.map((item) => (
                      <a
                        key={item}
                        href="#store-market-footer"
                        className="store-market-footer__app-link"
                      >
                        {item}
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            <div className="store-market-footer__bottom">
              <span className="store-market-footer__bottom-copy">
                © 2026 Shopee. All Rights Reserved
              </span>

              <div className="store-market-footer__region-list">
                <span className="store-market-footer__bottom-label">Country &amp; Region:</span>
                {STORE_FOOTER_COUNTRIES.map((item, index) => (
                  <React.Fragment key={item}>
                    {index > 0 ? <span className="store-market-footer__region-separator">|</span> : null}
                    <a href="#store-market-footer" className="store-market-footer__region-link">
                      {item}
                    </a>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ShopStorePage;
