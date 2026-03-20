import { normalizeStoredAssetSrc } from "./publicAsset";

export const VARIANT_OVERRIDE_MODE_FULL_LIST = "full-list-v1";

const trimString = (value) => (typeof value === "string" ? value.trim() : "");

const sanitizeVariantRow = (variant, index = 0) => {
  const fallbackId = `variant-${index + 1}`;
  const fallbackLabel = `ตัวเลือก ${index + 1}`;

  return {
    id: trimString(variant?.id) || fallbackId,
    label: trimString(variant?.label) || fallbackLabel,
    price: Number.isFinite(variant?.price) ? Math.max(Math.round(variant.price), 0) : 0,
    compareAtPrice: Number.isFinite(variant?.compareAtPrice)
      ? Math.max(Math.round(variant.compareAtPrice), 0)
      : null,
    stock: Number.isFinite(variant?.stock) ? Math.max(Math.round(variant.stock), 0) : 0,
    active: typeof variant?.active === "boolean" ? variant.active : !variant?.disabled,
    sku: trimString(variant?.sku) || "-",
  };
};

const buildDefaultSpecRows = (product = {}) => {
  const sourceRows =
    Array.isArray(product.specRows) && product.specRows.length
      ? product.specRows
      : [
          {
            id: "category",
            label: "หมวดหมู่",
            value: Array.isArray(product.categoryPath) ? product.categoryPath.join(" > ") : "-",
          },
          { id: "brand", label: "แบรนด์", value: product.specs?.brand || "-" },
          { id: "warranty", label: "การรับประกัน", value: product.specs?.warranty || "-" },
          { id: "shelfLife", label: "อายุสินค้า", value: product.specs?.shelfLife || "-" },
          {
            id: "licenseNumber",
            label: "เลขที่ใบอนุญาต/จดแจ้ง",
            value: product.specs?.licenseNumber || "-",
          },
          { id: "shipFrom", label: "จัดส่งจาก", value: product.specs?.shipFrom || "-" },
        ];

  return sourceRows
    .map((row, index) => ({
      id: trimString(row?.id) || `spec-row-${index + 1}`,
      label: trimString(row?.label) || `หัวข้อ ${index + 1}`,
      value: trimString(row?.value) || "-",
    }))
    .filter((row) => row.label && row.value);
};

const applyGalleryOverrides = (defaultImages = [], overrides = {}) => {
  const safeImages = Array.isArray(defaultImages)
    ? defaultImages.map((image) => normalizeStoredAssetSrc(image)).filter(Boolean)
    : [];
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    return safeImages;
  }

  return safeImages.reduce((result, defaultImage, index) => {
    const hasOverride = Object.prototype.hasOwnProperty.call(overrides, index);
    if (!hasOverride) {
      result.push(defaultImage);
      return result;
    }

    const overrideValue = overrides[index];
    if (typeof overrideValue === "string" && overrideValue.trim()) {
      result.push(normalizeStoredAssetSrc(overrideValue));
    }
    return result;
  }, []);
};

const applyVariantOverrides = (defaultVariants = [], overrides = {}) => {
  const baseVariants = Array.isArray(defaultVariants)
    ? defaultVariants.map((variant, index) => sanitizeVariantRow(variant, index))
    : [];

  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    return baseVariants;
  }

  if (overrides.mode === VARIANT_OVERRIDE_MODE_FULL_LIST && Array.isArray(overrides.rows)) {
    return overrides.rows
      .map((row, index) => sanitizeVariantRow(row, index))
      .filter((row) => row.label);
  }

  return baseVariants.map((variant) => {
    const override = overrides[variant.id];
    if (!override || typeof override !== "object" || Array.isArray(override)) {
      return variant;
    }

    const nextLabel = trimString(override.label);
    return {
      ...variant,
      label: nextLabel || variant.label,
      price: Number.isFinite(override.price) ? Math.max(Math.round(override.price), 0) : variant.price,
      active: typeof override.active === "boolean" ? override.active : variant.active,
    };
  });
};

const applySpecOverrides = (product = {}, overrides = {}) => {
  const baseRows = buildDefaultSpecRows(product);
  if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) {
    return baseRows;
  }

  return baseRows.map((row) => {
    const override = overrides[row.id];
    if (!override || typeof override !== "object" || Array.isArray(override)) {
      return row;
    }

    const nextLabel = trimString(override.label);
    const nextValue = trimString(override.value);
    return {
      ...row,
      label: nextLabel || row.label,
      value: nextValue || row.value,
    };
  });
};

const parseCategoryPath = (value) => {
  const normalized = trimString(value);
  if (!normalized || normalized === "-") {
    return [];
  }

  return normalized
    .split(">")
    .map((segment) => segment.trim())
    .filter(Boolean);
};

export const buildPublishedProduct = (baseProduct = {}, editableContent = {}) => {
  const nextProduct = {
    ...baseProduct,
    shop: {
      ...(baseProduct.shop || {}),
    },
    specs: {
      ...(baseProduct.specs || {}),
    },
  };

  const nextTitle = trimString(editableContent.productTitle);
  if (nextTitle) {
    nextProduct.name = nextTitle;
  }

  nextProduct.images = applyGalleryOverrides(baseProduct.images, editableContent.productGalleryOverrides);
  nextProduct.variants = applyVariantOverrides(baseProduct.variants, editableContent.productVariantsOverrides);

  const nextShopName = trimString(editableContent.shopName);
  if (nextShopName) {
    nextProduct.shop.name = nextShopName;
  }

  const nextAvatarSrc = trimString(editableContent.shopAvatarOverride);
  if (nextAvatarSrc) {
    nextProduct.shop.avatarSrc = normalizeStoredAssetSrc(nextAvatarSrc);
  } else if (trimString(baseProduct.shop?.avatarSrc)) {
    nextProduct.shop.avatarSrc = normalizeStoredAssetSrc(baseProduct.shop.avatarSrc);
  } else {
    delete nextProduct.shop.avatarSrc;
  }

  const nextDescriptionHtml =
    typeof editableContent.productDescriptionHtml === "string"
      ? editableContent.productDescriptionHtml.trim()
      : "";
  if (nextDescriptionHtml) {
    nextProduct.descriptionHtml = editableContent.productDescriptionHtml;
  } else if (trimString(baseProduct.descriptionHtml)) {
    nextProduct.descriptionHtml = baseProduct.descriptionHtml;
  } else {
    delete nextProduct.descriptionHtml;
  }

  const nextSpecRows = applySpecOverrides(baseProduct, editableContent.productSpecsOverrides);
  if (nextSpecRows.length) {
    nextProduct.specRows = nextSpecRows;
  } else {
    delete nextProduct.specRows;
  }

  const categoryRow = nextSpecRows.find((row) => row.id === "category");
  const parsedCategoryPath = parseCategoryPath(categoryRow?.value || "");
  if (parsedCategoryPath.length) {
    nextProduct.categoryPath = parsedCategoryPath;
  }

  const specRowMap = Object.fromEntries(nextSpecRows.map((row) => [row.id, row.value]));
  if (specRowMap.brand) {
    nextProduct.specs.brand = specRowMap.brand;
  }
  if (specRowMap.warranty) {
    nextProduct.specs.warranty = specRowMap.warranty;
  }
  if (specRowMap.shelfLife) {
    nextProduct.specs.shelfLife = specRowMap.shelfLife;
  }
  if (specRowMap.licenseNumber) {
    nextProduct.specs.licenseNumber = specRowMap.licenseNumber;
  }
  if (specRowMap.shipFrom) {
    nextProduct.specs.shipFrom = specRowMap.shipFrom;
  }

  return nextProduct;
};

export const buildEditableContentExport = (productIdentityOrId, editableContentArg) => {
  const identity =
    productIdentityOrId && typeof productIdentityOrId === "object" && !Array.isArray(productIdentityOrId)
      ? productIdentityOrId
      : {
          productId: productIdentityOrId,
          editableContent: editableContentArg,
        };

  return {
    format: "pm-editable-content-export-v1",
    productId: trimString(identity.productId),
    productSlug: trimString(identity.productSlug),
    storageKey: trimString(identity.storageKey),
    generatedAt: new Date().toISOString(),
    editableContent:
      identity.editableContent && typeof identity.editableContent === "object"
        ? identity.editableContent
        : {},
  };
};
