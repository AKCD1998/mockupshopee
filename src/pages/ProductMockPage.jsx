import React, { useCallback, useEffect, useMemo, useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import ProductGallery from "../components/ProductGallery";
import ProductInfoPanel from "../components/ProductInfoPanel";
import ShopSummaryCard from "../components/ShopSummaryCard";
import ProductSpecs from "../components/ProductSpecs";
import ProductDescription from "../components/ProductDescription";
import RatingSummary from "../components/RatingSummary";
import ReviewList from "../components/ReviewList";
import SameShopCarousel from "../components/SameShopCarousel";
import ChubbyTopHeader from "../components/header/ChubbyTopHeader";
import AdminEditGate from "../components/admin/AdminEditGate";
import AdminPasswordModal from "../components/admin/AdminPasswordModal";
import EditableRegion from "../components/admin/EditableRegion";
import GalleryEditorModal from "../components/admin/GalleryEditorModal";
import { getDefaultMockProduct, getProductBySlug } from "../data/mockProduct";
import useAdminEdit from "../hooks/useAdminEdit";
import useEditableContent from "../hooks/useEditableContent";
import {
  VARIANT_OVERRIDE_MODE_FULL_LIST,
  buildEditableContentExport,
} from "../utils/publishProduct";
import { buildDisplayProductFromEditableContent } from "../utils/displayProduct";
import {
  getEditableContentStorageKey,
  getLegacyEditableContentStorageKeys,
} from "../utils/editableContentStorage";
import { PRODUCT_ROUTE, matchProductRoute } from "../utils/appRoutes";
import "../styles/product-mock.css";
import "../styles/chubby-header.css";
import "../styles/admin-edit.css";

const FALLBACK_IMAGE = "https://picsum.photos/seed/mock-product-fallback/900/900";

const toComparableVariantRow = (variant, index = 0) => {
  const fallbackId = `variant-${index + 1}`;
  const fallbackLabel = `ตัวเลือก ${index + 1}`;

  const rowId =
    typeof variant?.id === "string" && variant.id.trim() ? variant.id.trim() : fallbackId;
  const rowLabel =
    typeof variant?.label === "string" && variant.label.trim()
      ? variant.label.trim()
      : fallbackLabel;
  const rowPrice = Number.isFinite(variant?.price) ? Math.max(Math.round(variant.price), 0) : 0;
  const rowActive =
    typeof variant?.active === "boolean" ? variant.active : !variant?.disabled;

  return {
    id: rowId,
    label: rowLabel,
    price: rowPrice,
    active: rowActive,
    compareAtPrice: Number.isFinite(variant?.compareAtPrice)
      ? Math.max(Math.round(variant.compareAtPrice), 0)
      : null,
    stock: Number.isFinite(variant?.stock) ? Math.max(Math.round(variant.stock), 0) : 0,
    sku: typeof variant?.sku === "string" && variant.sku.trim() ? variant.sku.trim() : "-",
  };
};

const areVariantRowsEqual = (leftRows = [], rightRows = []) => {
  if (leftRows.length !== rightRows.length) {
    return false;
  }

  return leftRows.every((row, index) => {
    const target = rightRows[index];
    if (!target) {
      return false;
    }

    return (
      row.id === target.id &&
      row.label === target.label &&
      row.price === target.price &&
      row.active === target.active &&
      row.compareAtPrice === target.compareAtPrice &&
      row.stock === target.stock &&
      row.sku === target.sku
    );
  });
};

const normalizeProduct = (rawProduct = {}) => {
  const variants =
    Array.isArray(rawProduct.variants) && rawProduct.variants.length
      ? rawProduct.variants.map((variant, index) => {
          const stock = Number.isFinite(variant?.stock) ? Math.max(variant.stock, 0) : 0;
          const active =
            typeof variant?.active === "boolean"
              ? variant.active
              : typeof variant?.disabled === "boolean"
                ? !variant.disabled
                : true;
          return {
            id: variant?.id || `variant-${index + 1}`,
            label: variant?.label || `ตัวเลือก ${index + 1}`,
            price: Number.isFinite(variant?.price) ? variant.price : 0,
            compareAtPrice: Number.isFinite(variant?.compareAtPrice)
              ? variant.compareAtPrice
              : null,
            stock,
            active,
            disabled: !active,
            sku: variant?.sku || "-",
          };
        })
      : [
          {
            id: "default-variant",
            label: "ตัวเลือกมาตรฐาน",
            price: 0,
            compareAtPrice: null,
            stock: 0,
            active: false,
            disabled: true,
            sku: "-",
          },
        ];

  const images =
    Array.isArray(rawProduct.images) && rawProduct.images.length
      ? rawProduct.images.filter(Boolean)
      : [FALLBACK_IMAGE];

  const categoryPath =
    Array.isArray(rawProduct.categoryPath) && rawProduct.categoryPath.length
      ? rawProduct.categoryPath.filter(Boolean)
      : ["หมวดหมู่สินค้า"];

  const specRows =
    Array.isArray(rawProduct.specRows) && rawProduct.specRows.length
      ? rawProduct.specRows
          .map((row, index) => ({
            id: row?.id || `spec-row-${index + 1}`,
            label: row?.label || `หัวข้อ ${index + 1}`,
            value: row?.value || "-",
          }))
          .filter((row) => row.label && row.value)
      : [];

  return {
    id: rawProduct.id || "mock-product",
    slug: rawProduct.slug || "",
    name: rawProduct.name || "สินค้าตัวอย่างสำหรับการนำเสนอ",
    internalNotice: {
      badge: rawProduct.internalNotice?.badge || "Mockup สำหรับพิจารณาภายใน",
      ctaNote:
        rawProduct.internalNotice?.ctaNote ||
        "หน้านี้เป็นตัวอย่างการแสดงผล ยังไม่เชื่อมต่อระบบขายจริง",
    },
    categoryPath,
    soldCount: Number.isFinite(rawProduct.soldCount) ? rawProduct.soldCount : 0,
    favoriteCount: Number.isFinite(rawProduct.favoriteCount) ? rawProduct.favoriteCount : 0,
    variants,
    images,
    shop: {
      name: rawProduct.shop?.name || "ร้านค้าตัวอย่าง",
      avatarSrc: rawProduct.shop?.avatarSrc || "",
      onlineStatus: rawProduct.shop?.onlineStatus || "ออนไลน์ล่าสุดเมื่อไม่นานนี้",
      score: Number.isFinite(rawProduct.shop?.score) ? rawProduct.shop.score : 0,
      responseRate: rawProduct.shop?.responseRate || "-",
      joinedAt: rawProduct.shop?.joinedAt || "-",
      productCount: Number.isFinite(rawProduct.shop?.productCount)
        ? rawProduct.shop.productCount
        : 0,
      responseTime: rawProduct.shop?.responseTime || "-",
      followers: rawProduct.shop?.followers || "-",
    },
    specs: {
      brand: rawProduct.specs?.brand || "-",
      warranty: rawProduct.specs?.warranty || "-",
      shelfLife: rawProduct.specs?.shelfLife || "-",
      licenseNumber: rawProduct.specs?.licenseNumber || "-",
      shipFrom: rawProduct.specs?.shipFrom || "-",
    },
    specRows,
    description: rawProduct.description || {
      intro: "รายละเอียดสินค้าอยู่ระหว่างเตรียมข้อมูล",
      highlights: [],
      inBox: [],
      notes: [],
    },
    descriptionHtml: rawProduct.descriptionHtml || "",
    trustIndicators:
      Array.isArray(rawProduct.trustIndicators) && rawProduct.trustIndicators.length
        ? rawProduct.trustIndicators
        : ["จัดส่งจากกรุงเทพฯ", "สินค้าแท้", "มีใบอนุญาต", "รับประกันโดยผู้ผลิต"],
    promoHighlights:
      Array.isArray(rawProduct.promoHighlights) && rawProduct.promoHighlights.length
        ? rawProduct.promoHighlights
        : ["ส่วนลดพิเศษ", "ส่งไว", "ร้านค้าตอบแชทเร็ว"],
    ratingSummary: {
      score: Number.isFinite(rawProduct.ratingSummary?.score)
        ? rawProduct.ratingSummary.score
        : 0,
      totalRatings: Number.isFinite(rawProduct.ratingSummary?.totalRatings)
        ? rawProduct.ratingSummary.totalRatings
        : 0,
      totalReviews: Number.isFinite(rawProduct.ratingSummary?.totalReviews)
        ? rawProduct.ratingSummary.totalReviews
        : 0,
      breakdown: Array.isArray(rawProduct.ratingSummary?.breakdown)
        ? rawProduct.ratingSummary.breakdown
        : [
            { star: 5, count: 0 },
            { star: 4, count: 0 },
            { star: 3, count: 0 },
            { star: 2, count: 0 },
            { star: 1, count: 0 },
          ],
    },
    reviews: Array.isArray(rawProduct.reviews)
      ? rawProduct.reviews.map((review, index) => ({
          id: review?.id || `review-${index + 1}`,
          userName: review?.userName || "ผู้ใช้ไม่ระบุชื่อ",
          rating: Number.isFinite(review?.rating) ? review.rating : 0,
          date: review?.date || "2026-01-01",
          variantLabel: review?.variantLabel || "ตัวเลือกมาตรฐาน",
          comment: review?.comment || "",
          likes: Number.isFinite(review?.likes) ? review.likes : 0,
          hasMedia: Boolean(review?.hasMedia),
        }))
      : [],
    sameShopItems: Array.isArray(rawProduct.sameShopItems)
      ? rawProduct.sameShopItems.map((item, index) => ({
          id: item?.id || `shop-item-${index + 1}`,
          slug: item?.slug || "",
          name: item?.name || "สินค้าจากร้านเดียวกัน",
          price: Number.isFinite(item?.price) ? item.price : 0,
          originalPrice: Number.isFinite(item?.originalPrice) ? item.originalPrice : 0,
          rating: Number.isFinite(item?.rating) ? item.rating : 0,
          sold: Number.isFinite(item?.sold) ? item.sold : 0,
          image: item?.image || FALLBACK_IMAGE,
        }))
      : [],
  };
};

const ProductMockPage = ({
  onNavigateToShop = null,
  onNavigateToProduct = null,
  currentPath = PRODUCT_ROUTE,
}) => {
  const routeMatch = useMemo(() => matchProductRoute(currentPath), [currentPath]);
  const requestedProductSlug = routeMatch?.slug || "";
  const requestedProduct = useMemo(
    () => (requestedProductSlug ? getProductBySlug(requestedProductSlug) : null),
    [requestedProductSlug]
  );
  const fallbackProduct = useMemo(() => getDefaultMockProduct() || {}, []);
  const rawProduct = requestedProduct || fallbackProduct;
  const baseProduct = useMemo(() => normalizeProduct(rawProduct), [rawProduct]);
  const isMissingProduct = Boolean(requestedProductSlug) && !requestedProduct;
  const isUnknownRoute = !routeMatch;
  const routeNotice = useMemo(() => {
    if (isMissingProduct) {
      return {
        title: "ไม่พบสินค้าที่ต้องการ",
        message: `ไม่พบสินค้า slug "${requestedProductSlug}" กำลังแสดงสินค้าตัวอย่างแทน`,
      };
    }

    if (isUnknownRoute) {
      return {
        title: "ไม่พบเส้นทางที่ร้องขอ",
        message: "เส้นทางนี้ยังไม่รองรับใน mock SPA ปัจจุบัน กำลังแสดงสินค้าตัวอย่างแทน",
      };
    }

    return null;
  }, [isMissingProduct, isUnknownRoute, requestedProductSlug]);
  const initialEditableContent = useMemo(
    () => ({
      productTitle: baseProduct.name || "สินค้าตัวอย่างสำหรับการนำเสนอ",
      productGalleryOverrides: {},
      productVariantsOverrides: {},
      shopName: baseProduct.shop.name || "ร้านค้าตัวอย่าง",
      shopAvatarOverride: baseProduct.shop.avatarSrc || "",
      productDescriptionHtml: baseProduct.descriptionHtml || "",
      productSpecsOverrides: {},
    }),
    [baseProduct.descriptionHtml, baseProduct.name, baseProduct.shop.avatarSrc, baseProduct.shop.name]
  );
  const editableContentStorageKey = useMemo(
    () => getEditableContentStorageKey(baseProduct),
    [baseProduct.id, baseProduct.slug]
  );
  const legacyEditableContentStorageKeys = useMemo(
    () => getLegacyEditableContentStorageKeys(baseProduct),
    [baseProduct.id, baseProduct.slug]
  );

  const { editableContent, setField, restoreField, resetEditableContent } = useEditableContent(
    initialEditableContent,
    editableContentStorageKey,
    legacyEditableContentStorageKeys
  );
  // Shared display product shape for product page + storefront cards.
  const displayProduct = useMemo(
    () =>
      normalizeProduct(buildDisplayProductFromEditableContent(rawProduct, editableContent)),
    [editableContent, rawProduct]
  );
  const {
    isEditMode,
    isPasswordModalOpen,
    authError,
    openPasswordModal,
    closePasswordModal,
    submitPassword,
    exitEditMode,
  } = useAdminEdit();

  const [selectedImage, setSelectedImage] = useState(0);
  const [isGalleryEditorOpen, setIsGalleryEditorOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [toastState, setToastState] = useState({ show: false, message: "" });

  const defaultProductSpecsRows = useMemo(
    () =>
      Array.isArray(baseProduct.specRows) && baseProduct.specRows.length
        ? baseProduct.specRows
        : [
            {
              id: "category",
              label: "หมวดหมู่",
              value: Array.isArray(baseProduct.categoryPath) ? baseProduct.categoryPath.join(" > ") : "-",
            },
            { id: "brand", label: "แบรนด์", value: baseProduct.specs.brand || "-" },
            { id: "warranty", label: "การรับประกัน", value: baseProduct.specs.warranty || "-" },
            { id: "shelfLife", label: "อายุสินค้า", value: baseProduct.specs.shelfLife || "-" },
            {
              id: "licenseNumber",
              label: "เลขที่ใบอนุญาต/จดแจ้ง",
              value: baseProduct.specs.licenseNumber || "-",
            },
            { id: "shipFrom", label: "จัดส่งจาก", value: baseProduct.specs.shipFrom || "-" },
          ],
    [
      baseProduct.categoryPath,
      baseProduct.specRows,
      baseProduct.specs.brand,
      baseProduct.specs.licenseNumber,
      baseProduct.specs.shelfLife,
      baseProduct.specs.shipFrom,
      baseProduct.specs.warranty,
    ]
  );

  const galleryOverrides = useMemo(() => {
    const source = editableContent.productGalleryOverrides;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return {};
    }

    const sanitized = {};
    Object.entries(source).forEach(([slotKey, imageSrc]) => {
      const slotIndex = Number(slotKey);
      if (
        Number.isInteger(slotIndex) &&
        slotIndex >= 0 &&
        slotIndex < baseProduct.images.length
      ) {
        if (imageSrc === null) {
          sanitized[slotIndex] = null;
          return;
        }
        if (typeof imageSrc === "string" && imageSrc.trim()) {
          sanitized[slotIndex] = imageSrc.trim();
        }
      }
    });
    return sanitized;
  }, [baseProduct.images.length, editableContent.productGalleryOverrides]);

  const selectedVariant = useMemo(() => {
    return displayProduct.variants.find((variant) => variant.id === selectedVariantId) || null;
  }, [displayProduct.variants, selectedVariantId]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") {
      return displayProduct.reviews;
    }
    if (reviewFilter.startsWith("star-")) {
      const star = Number(reviewFilter.replace("star-", ""));
      return displayProduct.reviews.filter((review) => review.rating === star);
    }
    if (reviewFilter === "comment") {
      return displayProduct.reviews.filter((review) => review.comment && review.comment.trim());
    }
    if (reviewFilter === "media") {
      return displayProduct.reviews.filter((review) => review.hasMedia);
    }
    return displayProduct.reviews;
  }, [displayProduct.reviews, reviewFilter]);

  useEffect(() => {
    if (!toastState.show) {
      return undefined;
    }
    const timer = setTimeout(() => {
      setToastState((prev) => ({ ...prev, show: false }));
    }, 2200);
    return () => clearTimeout(timer);
  }, [toastState.show]);

  useEffect(() => {
    setSelectedImage((prev) => Math.min(prev, Math.max(displayProduct.images.length - 1, 0)));
  }, [displayProduct.images.length]);

  useEffect(() => {
    if (!isEditMode) {
      setIsGalleryEditorOpen(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!selectedVariantId) {
      return;
    }
    const selected = displayProduct.variants.find((variant) => variant.id === selectedVariantId);
    if (!selected || selected.active === false) {
      setSelectedVariantId(null);
      setQuantity(1);
    }
  }, [displayProduct.variants, selectedVariantId]);

  const handleVariantChange = (variantId) => {
    const targetVariant = displayProduct.variants.find((variant) => variant.id === variantId);
    if (!targetVariant || targetVariant.active === false) {
      return;
    }
    setSelectedVariantId((prev) => (prev === variantId ? null : variantId));
    setQuantity(1);
  };

  const handleQuantityInputChange = (value) => {
    if (!selectedVariant) {
      setQuantity(1);
      return;
    }
    const maxStock = Math.max(selectedVariant.stock, 1);
    if (!Number.isFinite(value)) {
      setQuantity(1);
      return;
    }
    const nextValue = Math.min(Math.max(value, 1), maxStock);
    setQuantity(nextValue);
  };

  const handleDecreaseQuantity = () => {
    if (!selectedVariant) {
      setQuantity(1);
      return;
    }
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleIncreaseQuantity = () => {
    if (!selectedVariant) {
      setQuantity(1);
      return;
    }
    const maxStock = Math.max(selectedVariant.stock, 1);
    setQuantity((prev) => Math.min(prev + 1, maxStock));
  };

  const showMockToast = () => {
    setToastState({
      show: true,
      message: "นี่คือ mockup page ยังไม่มี backend จริง",
    });
  };

  const handleExportEditableContent = useCallback(() => {
    const exportPayload = buildEditableContentExport({
      productId: baseProduct.id,
      productSlug: baseProduct.slug,
      storageKey: editableContentStorageKey,
      editableContent,
    });
    const exportDate = new Date().toISOString().slice(0, 10);
    const productFileStem = baseProduct.slug || baseProduct.id;
    const fileName = `pm-editable-content-${productFileStem}-${exportDate}.json`;
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);

    setToastState({
      show: true,
      message: `ส่งออกไฟล์แล้ว ใช้ npm run publish:product -- "<path>\\${fileName}"`,
    });
  }, [baseProduct.id, baseProduct.slug, editableContent, editableContentStorageKey]);

  const handleSaveProductVariants = useCallback(
    (nextRows) => {
      if (!Array.isArray(nextRows) || !nextRows.length) {
        return;
      }

      const defaultVariantRows = baseProduct.variants.map((variant, index) =>
        toComparableVariantRow(variant, index)
      );
      const defaultVariantMap = Object.fromEntries(
        defaultVariantRows.map((variant) => [variant.id, variant])
      );
      const fallbackStock =
        defaultVariantRows.find((variant) => variant.stock > 0)?.stock || 1;

      const normalizedRows = [];
      nextRows.forEach((row, index) => {
        const rowId = typeof row?.id === "string" && row.id.trim()
          ? row.id.trim()
          : `custom-variant-${index + 1}`;
        const normalizedLabel = typeof row?.label === "string" ? row.label.trim() : "";
        const normalizedPrice = Number.isFinite(row?.price)
          ? Math.max(Math.round(row.price), 0)
          : null;
        const normalizedActive = typeof row?.active === "boolean" ? row.active : true;
        if (!normalizedLabel || normalizedPrice === null) {
          return;
        }

        const defaultVariant = defaultVariantMap[rowId];
        normalizedRows.push({
          id: rowId,
          label: normalizedLabel,
          price: normalizedPrice,
          active: normalizedActive,
          compareAtPrice: defaultVariant ? defaultVariant.compareAtPrice : null,
          stock: defaultVariant ? defaultVariant.stock : fallbackStock,
          sku: defaultVariant ? defaultVariant.sku : `CUSTOM-${index + 1}`,
        });
      });

      if (!normalizedRows.length) {
        return;
      }

      if (areVariantRowsEqual(normalizedRows, defaultVariantRows)) {
        restoreField("productVariantsOverrides");
        return;
      }

      setField("productVariantsOverrides", {
        mode: VARIANT_OVERRIDE_MODE_FULL_LIST,
        rows: normalizedRows,
      });
    },
    [baseProduct.variants, restoreField, setField]
  );

  const handleSaveShopHeader = useCallback(
    (nextHeader) => {
      const nextName = typeof nextHeader?.name === "string" ? nextHeader.name.trim() : "";
      const nextAvatarSrc =
        typeof nextHeader?.avatarSrc === "string" ? nextHeader.avatarSrc.trim() : "";
      const defaultShopName =
        typeof baseProduct.shop.name === "string" ? baseProduct.shop.name.trim() : "";

      if (nextName && nextName !== defaultShopName) {
        setField("shopName", nextName);
      } else {
        restoreField("shopName");
      }

      if (nextAvatarSrc) {
        setField("shopAvatarOverride", nextAvatarSrc);
      } else {
        restoreField("shopAvatarOverride");
      }
    },
    [baseProduct.shop.name, restoreField, setField]
  );

  const handleSaveProductSpecsRows = useCallback(
    (nextRows) => {
      if (!Array.isArray(nextRows) || !nextRows.length) {
        restoreField("productSpecsOverrides");
        return;
      }

      const defaultRowMap = Object.fromEntries(defaultProductSpecsRows.map((row) => [row.id, row]));
      const nextOverrides = {};

      nextRows.forEach((row) => {
        const rowId = typeof row?.id === "string" ? row.id : "";
        const defaultRow = defaultRowMap[rowId];
        if (!defaultRow) {
          return;
        }

        const normalizedLabel = typeof row.label === "string" ? row.label.trim() : "";
        const normalizedValue = typeof row.value === "string" ? row.value.trim() : "";

        const changedLabel = normalizedLabel && normalizedLabel !== defaultRow.label;
        const changedValue = normalizedValue && normalizedValue !== defaultRow.value;
        if (!changedLabel && !changedValue) {
          return;
        }

        nextOverrides[rowId] = {};
        if (changedLabel) {
          nextOverrides[rowId].label = normalizedLabel;
        }
        if (changedValue) {
          nextOverrides[rowId].value = normalizedValue;
        }
      });

      if (Object.keys(nextOverrides).length) {
        setField("productSpecsOverrides", nextOverrides);
      } else {
        restoreField("productSpecsOverrides");
      }
    },
    [defaultProductSpecsRows, restoreField, setField]
  );

  return (
    <main className="product-mock-page with-chubby-header">
      <ChubbyTopHeader />

      <div className="pm-content-shell">
        <div className="pm-container">
          <div className="pm-page-badge-row">
            <span className="pm-demo-badge">{displayProduct.internalNotice.badge}</span>
          </div>
          {routeNotice ? (
            <section className="pm-section-card" aria-live="polite">
              <h2 className="pm-section-title">{routeNotice.title}</h2>
              <p className="pm-shop-status">{routeNotice.message}</p>
            </section>
          ) : null}
          <Breadcrumbs items={displayProduct.categoryPath} />

          <section className="pm-main-section">
            <ProductGallery
              images={displayProduct.images}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              productName={displayProduct.name}
              isEditMode={isEditMode}
              onOpenGalleryEditor={() => setIsGalleryEditorOpen(true)}
            />
            <ProductInfoPanel
              productName={displayProduct.name}
              titleSlot={
                <EditableRegion
                  regionId="product-title"
                  label="ชื่อสินค้า"
                  isEditMode={isEditMode}
                  value={displayProduct.name}
                  editor="text"
                  editorPlacement="inline"
                  openOnRegionClick
                  placeholder="กรอกชื่อสินค้า"
                  onSave={(nextTitle) => setField("productTitle", nextTitle)}
                  onRestoreDefault={() => restoreField("productTitle")}
                >
                  <h1 className="pm-product-title">{displayProduct.name}</h1>
                </EditableRegion>
              }
              soldCount={displayProduct.soldCount}
              favoriteCount={displayProduct.favoriteCount}
              totalRatings={displayProduct.ratingSummary.totalRatings}
              averageRating={displayProduct.ratingSummary.score}
              variants={displayProduct.variants}
              selectedVariantId={selectedVariantId}
              selectedVariant={selectedVariant}
              isEditMode={isEditMode}
              quantity={quantity}
              internalNote={displayProduct.internalNotice.ctaNote}
              onSaveVariantRows={handleSaveProductVariants}
              onRestoreDefaultVariantRows={() => restoreField("productVariantsOverrides")}
              onVariantChange={handleVariantChange}
              onDecreaseQuantity={handleDecreaseQuantity}
              onIncreaseQuantity={handleIncreaseQuantity}
              onQuantityInputChange={handleQuantityInputChange}
              onAddToCart={showMockToast}
              onBuyNow={showMockToast}
            />
          </section>

          <ShopSummaryCard
            shop={baseProduct.shop}
            isEditMode={isEditMode}
            shopName={displayProduct.shop.name}
            shopAvatarSrc={displayProduct.shop.avatarSrc}
            onOpenShop={onNavigateToShop}
            onSaveShopHeader={handleSaveShopHeader}
          />
          <ProductSpecs
            specs={baseProduct.specs}
            categoryPath={baseProduct.categoryPath}
            rows={displayProduct.specRows}
            isEditMode={isEditMode}
            onSaveRows={handleSaveProductSpecsRows}
            onRestoreDefaultRows={() => restoreField("productSpecsOverrides")}
          />
          <ProductDescription
            description={displayProduct.description}
            isEditMode={isEditMode}
            htmlContent={displayProduct.descriptionHtml}
            onSaveHtml={(nextHtml) => setField("productDescriptionHtml", nextHtml)}
            onRestoreDefault={() => restoreField("productDescriptionHtml")}
          />

          <section className="pm-section-card pm-reviews-card">
            <h2 className="pm-section-title">คะแนนและรีวิวสินค้า</h2>
            <RatingSummary
              summary={displayProduct.ratingSummary}
              selectedFilter={reviewFilter}
              onFilterChange={setReviewFilter}
            />
            <ReviewList reviews={filteredReviews} />
          </section>

          <SameShopCarousel
            items={displayProduct.sameShopItems}
            onNavigateToProduct={onNavigateToProduct}
          />
        </div>
      </div>
      <AdminEditGate
        isEditMode={isEditMode}
        onOpenAuth={openPasswordModal}
        onExitEditMode={exitEditMode}
        onExportEditableContent={handleExportEditableContent}
        onResetEditableContent={resetEditableContent}
      />
      <AdminPasswordModal
        open={isPasswordModalOpen}
        onClose={closePasswordModal}
        onSubmit={submitPassword}
        errorMessage={authError}
      />
      <GalleryEditorModal
        open={isGalleryEditorOpen}
        defaultImages={baseProduct.images}
        overrides={galleryOverrides}
        onSave={(nextOverrides) => setField("productGalleryOverrides", nextOverrides)}
        onClose={() => setIsGalleryEditorOpen(false)}
      />
      <div className={`pm-toast ${toastState.show ? "show" : ""}`}>{toastState.message}</div>
    </main>
  );
};

export default ProductMockPage;
