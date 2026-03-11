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
import mockProduct from "../data/mockProduct";
import useAdminEdit from "../hooks/useAdminEdit";
import useEditableContent from "../hooks/useEditableContent";
import "../styles/product-mock.css";
import "../styles/chubby-header.css";
import "../styles/admin-edit.css";

const FALLBACK_IMAGE = "https://picsum.photos/seed/mock-product-fallback/900/900";
const VARIANT_OVERRIDE_MODE_FULL_LIST = "full-list-v1";

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

  return {
    id: rawProduct.id || "mock-product",
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
    description: rawProduct.description || {
      intro: "รายละเอียดสินค้าอยู่ระหว่างเตรียมข้อมูล",
      highlights: [],
      inBox: [],
      notes: [],
    },
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

const ProductMockPage = () => {
  const product = useMemo(() => normalizeProduct(mockProduct), []);
  const initialEditableContent = useMemo(
    () => ({
      productTitle: product.name || "สินค้าตัวอย่างสำหรับการนำเสนอ",
      productGalleryOverrides: {},
      productVariantsOverrides: {},
      shopName: product.shop.name || "ร้านค้าตัวอย่าง",
      shopAvatarOverride: "",
      productDescriptionHtml: "",
      productSpecsOverrides: {},
    }),
    [product.name, product.shop.name]
  );

  const { editableContent, setField, restoreField, resetEditableContent } = useEditableContent(
    initialEditableContent,
    `pm_editable_content_${product.id}`
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

  const displayProductTitle = useMemo(() => {
    const editableTitle =
      typeof editableContent.productTitle === "string" ? editableContent.productTitle.trim() : "";
    return editableTitle || product.name || "สินค้าตัวอย่างสำหรับการนำเสนอ";
  }, [editableContent.productTitle, product.name]);

  const displayShopName = useMemo(() => {
    const editableShopName =
      typeof editableContent.shopName === "string" ? editableContent.shopName.trim() : "";
    return editableShopName || product.shop.name || "ร้านค้าตัวอย่าง";
  }, [editableContent.shopName, product.shop.name]);

  const displayShopAvatar = useMemo(() => {
    const editableAvatar =
      typeof editableContent.shopAvatarOverride === "string"
        ? editableContent.shopAvatarOverride.trim()
        : "";
    return editableAvatar || "";
  }, [editableContent.shopAvatarOverride]);

  const displayDescriptionHtml = useMemo(() => {
    return typeof editableContent.productDescriptionHtml === "string"
      ? editableContent.productDescriptionHtml
      : "";
  }, [editableContent.productDescriptionHtml]);

  const productVariantsOverrides = useMemo(() => {
    const source = editableContent.productVariantsOverrides;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return {
        mode: "legacy-map",
        overridesById: {},
      };
    }

    if (source.mode === VARIANT_OVERRIDE_MODE_FULL_LIST && Array.isArray(source.rows)) {
      const rows = source.rows
        .map((row, index) => {
          if (!row || typeof row !== "object" || Array.isArray(row)) {
            return null;
          }
          const normalizedRow = toComparableVariantRow(row, index);
          if (!normalizedRow.label) {
            return null;
          }
          return normalizedRow;
        })
        .filter(Boolean);

      if (rows.length) {
        return {
          mode: "full-list",
          rows,
        };
      }

      return {
        mode: "legacy-map",
        overridesById: {},
      };
    }

    const sanitized = {};
    Object.entries(source).forEach(([variantId, override]) => {
      if (!override || typeof override !== "object" || Array.isArray(override)) {
        return;
      }

      const nextOverride = {};
      if (typeof override.label === "string" && override.label.trim()) {
        nextOverride.label = override.label.trim();
      }
      if (Number.isFinite(override.price) && override.price >= 0) {
        nextOverride.price = Math.round(override.price);
      }
      if (typeof override.active === "boolean") {
        nextOverride.active = override.active;
      }

      if (Object.keys(nextOverride).length) {
        sanitized[variantId] = nextOverride;
      }
    });
    return {
      mode: "legacy-map",
      overridesById: sanitized,
    };
  }, [editableContent.productVariantsOverrides]);

  const displayProductVariants = useMemo(() => {
    if (productVariantsOverrides.mode === "full-list") {
      return productVariantsOverrides.rows.map((row, index) => {
        const normalizedRow = toComparableVariantRow(row, index);
        return {
          ...normalizedRow,
          disabled: !normalizedRow.active,
        };
      });
    }

    return product.variants.map((variant) => {
      const normalizedVariant = toComparableVariantRow(variant);
      const override = productVariantsOverrides.overridesById[variant.id];
      const active =
        typeof override?.active === "boolean"
          ? override.active
          : normalizedVariant.active;
      return {
        ...normalizedVariant,
        label: override?.label || normalizedVariant.label,
        price: Number.isFinite(override?.price) ? override.price : normalizedVariant.price,
        active,
        disabled: !active,
      };
    });
  }, [product.variants, productVariantsOverrides]);

  const defaultProductSpecsRows = useMemo(
    () => [
      {
        id: "category",
        label: "หมวดหมู่",
        value: Array.isArray(product.categoryPath) ? product.categoryPath.join(" > ") : "-",
      },
      { id: "brand", label: "แบรนด์", value: product.specs.brand || "-" },
      { id: "warranty", label: "การรับประกัน", value: product.specs.warranty || "-" },
      { id: "shelfLife", label: "อายุสินค้า", value: product.specs.shelfLife || "-" },
      {
        id: "licenseNumber",
        label: "เลขที่ใบอนุญาต/จดแจ้ง",
        value: product.specs.licenseNumber || "-",
      },
      { id: "shipFrom", label: "จัดส่งจาก", value: product.specs.shipFrom || "-" },
    ],
    [product.categoryPath, product.specs.brand, product.specs.licenseNumber, product.specs.shelfLife, product.specs.shipFrom, product.specs.warranty]
  );

  const productSpecsOverrides = useMemo(() => {
    const source = editableContent.productSpecsOverrides;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return {};
    }

    const sanitized = {};
    Object.entries(source).forEach(([rowId, overrideRow]) => {
      if (!overrideRow || typeof overrideRow !== "object" || Array.isArray(overrideRow)) {
        return;
      }
      const nextRow = {};
      if (typeof overrideRow.label === "string" && overrideRow.label.trim()) {
        nextRow.label = overrideRow.label.trim();
      }
      if (typeof overrideRow.value === "string" && overrideRow.value.trim()) {
        nextRow.value = overrideRow.value.trim();
      }
      if (Object.keys(nextRow).length) {
        sanitized[rowId] = nextRow;
      }
    });
    return sanitized;
  }, [editableContent.productSpecsOverrides]);

  const displayProductSpecsRows = useMemo(() => {
    return defaultProductSpecsRows.map((row) => ({
      ...row,
      label: productSpecsOverrides[row.id]?.label || row.label,
      value: productSpecsOverrides[row.id]?.value || row.value,
    }));
  }, [defaultProductSpecsRows, productSpecsOverrides]);

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
        slotIndex < product.images.length
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
  }, [editableContent.productGalleryOverrides, product.images.length]);

  const displayProductImages = useMemo(() => {
    return product.images.reduce((result, defaultImage, index) => {
      const hasOverride = Object.prototype.hasOwnProperty.call(galleryOverrides, index);
      if (!hasOverride) {
        result.push(defaultImage);
        return result;
      }

      const overrideValue = galleryOverrides[index];
      if (typeof overrideValue === "string" && overrideValue.trim()) {
        result.push(overrideValue);
      }
      return result;
    }, []);
  }, [galleryOverrides, product.images]);

  const selectedVariant = useMemo(() => {
    return displayProductVariants.find((variant) => variant.id === selectedVariantId) || null;
  }, [displayProductVariants, selectedVariantId]);

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") {
      return product.reviews;
    }
    if (reviewFilter.startsWith("star-")) {
      const star = Number(reviewFilter.replace("star-", ""));
      return product.reviews.filter((review) => review.rating === star);
    }
    if (reviewFilter === "comment") {
      return product.reviews.filter((review) => review.comment && review.comment.trim());
    }
    if (reviewFilter === "media") {
      return product.reviews.filter((review) => review.hasMedia);
    }
    return product.reviews;
  }, [product.reviews, reviewFilter]);

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
    setSelectedImage((prev) => Math.min(prev, Math.max(displayProductImages.length - 1, 0)));
  }, [displayProductImages.length]);

  useEffect(() => {
    if (!isEditMode) {
      setIsGalleryEditorOpen(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (!selectedVariantId) {
      return;
    }
    const selected = displayProductVariants.find((variant) => variant.id === selectedVariantId);
    if (!selected || selected.active === false) {
      setSelectedVariantId(null);
      setQuantity(1);
    }
  }, [displayProductVariants, selectedVariantId]);

  const handleVariantChange = (variantId) => {
    const targetVariant = displayProductVariants.find((variant) => variant.id === variantId);
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

  const handleSaveProductVariants = useCallback(
    (nextRows) => {
      if (!Array.isArray(nextRows) || !nextRows.length) {
        return;
      }

      const defaultVariantRows = product.variants.map((variant, index) =>
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
    [product.variants, restoreField, setField]
  );

  const handleSaveShopHeader = useCallback(
    (nextHeader) => {
      const nextName = typeof nextHeader?.name === "string" ? nextHeader.name.trim() : "";
      const nextAvatarSrc =
        typeof nextHeader?.avatarSrc === "string" ? nextHeader.avatarSrc.trim() : "";
      const defaultShopName = typeof product.shop.name === "string" ? product.shop.name.trim() : "";

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
    [product.shop.name, restoreField, setField]
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
            <span className="pm-demo-badge">{product.internalNotice.badge}</span>
          </div>
          <Breadcrumbs items={product.categoryPath} />

          <section className="pm-main-section">
            <ProductGallery
              images={displayProductImages}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImage}
              productName={displayProductTitle}
              isEditMode={isEditMode}
              onOpenGalleryEditor={() => setIsGalleryEditorOpen(true)}
            />
            <ProductInfoPanel
              productName={displayProductTitle}
              titleSlot={
                <EditableRegion
                  regionId="product-title"
                  label="ชื่อสินค้า"
                  isEditMode={isEditMode}
                  value={displayProductTitle}
                  editor="text"
                  editorPlacement="inline"
                  openOnRegionClick
                  placeholder="กรอกชื่อสินค้า"
                  onSave={(nextTitle) => setField("productTitle", nextTitle)}
                  onRestoreDefault={() => restoreField("productTitle")}
                >
                  <h1 className="pm-product-title">{displayProductTitle}</h1>
                </EditableRegion>
              }
              soldCount={product.soldCount}
              favoriteCount={product.favoriteCount}
              totalRatings={product.ratingSummary.totalRatings}
              averageRating={product.ratingSummary.score}
              variants={displayProductVariants}
              selectedVariantId={selectedVariantId}
              selectedVariant={selectedVariant}
              isEditMode={isEditMode}
              quantity={quantity}
              internalNote={product.internalNotice.ctaNote}
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
            shop={product.shop}
            isEditMode={isEditMode}
            shopName={displayShopName}
            shopAvatarSrc={displayShopAvatar}
            onSaveShopHeader={handleSaveShopHeader}
          />
          <ProductSpecs
            specs={product.specs}
            categoryPath={product.categoryPath}
            rows={displayProductSpecsRows}
            isEditMode={isEditMode}
            onSaveRows={handleSaveProductSpecsRows}
            onRestoreDefaultRows={() => restoreField("productSpecsOverrides")}
          />
          <ProductDescription
            description={product.description}
            isEditMode={isEditMode}
            htmlContent={displayDescriptionHtml}
            onSaveHtml={(nextHtml) => setField("productDescriptionHtml", nextHtml)}
            onRestoreDefault={() => restoreField("productDescriptionHtml")}
          />

          <section className="pm-section-card pm-reviews-card">
            <h2 className="pm-section-title">คะแนนและรีวิวสินค้า</h2>
            <RatingSummary
              summary={product.ratingSummary}
              selectedFilter={reviewFilter}
              onFilterChange={setReviewFilter}
            />
            <ReviewList reviews={filteredReviews} />
          </section>

          <SameShopCarousel items={product.sameShopItems} />
        </div>
      </div>
      <AdminEditGate
        isEditMode={isEditMode}
        onOpenAuth={openPasswordModal}
        onExitEditMode={exitEditMode}
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
        defaultImages={product.images}
        overrides={galleryOverrides}
        onSave={(nextOverrides) => setField("productGalleryOverrides", nextOverrides)}
        onClose={() => setIsGalleryEditorOpen(false)}
      />
      <div className={`pm-toast ${toastState.show ? "show" : ""}`}>{toastState.message}</div>
    </main>
  );
};

export default ProductMockPage;
