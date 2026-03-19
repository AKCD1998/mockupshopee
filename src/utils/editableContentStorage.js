export const EDITABLE_CONTENT_STORAGE_KEY_PREFIX = "pm_editable_content_v2";
export const LEGACY_EDITABLE_CONTENT_STORAGE_KEY_PREFIX = "pm_editable_content";
export const DEFAULT_EDITABLE_CONTENT_STORAGE_KEY = "pm_editable_content_v1";
export const EDITABLE_CONTENT_CHANGED_EVENT = "pm:editable-content-changed";

const normalizeStorageScope = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getEditableContentStorageScope = (productOrScope = "") => {
  if (typeof productOrScope === "string") {
    return normalizeStorageScope(productOrScope) || "mock-product";
  }

  const productSlug = normalizeStorageScope(productOrScope?.slug);
  const productId = normalizeStorageScope(productOrScope?.id);
  return productSlug || productId || "mock-product";
};

export const getEditableContentStorageKey = (productOrScope = "") =>
  `${EDITABLE_CONTENT_STORAGE_KEY_PREFIX}:${getEditableContentStorageScope(productOrScope)}`;

export const getLegacyEditableContentStorageKeys = (productOrScope = "") => {
  if (typeof productOrScope === "string") {
    const scope = normalizeStorageScope(productOrScope);
    return scope ? [`${LEGACY_EDITABLE_CONTENT_STORAGE_KEY_PREFIX}_${scope}`] : [];
  }

  const productId = normalizeStorageScope(productOrScope?.id);
  const productSlug = normalizeStorageScope(productOrScope?.slug);
  return [...new Set([productId, productSlug].filter(Boolean))].map(
    (scope) => `${LEGACY_EDITABLE_CONTENT_STORAGE_KEY_PREFIX}_${scope}`
  );
};

export const getEditableContentStorageKeys = (productOrScope = "", additionalKeys = []) => {
  const storageKeys = [];

  if (typeof productOrScope === "string" && productOrScope.includes(":")) {
    storageKeys.push(productOrScope);
  } else {
    storageKeys.push(getEditableContentStorageKey(productOrScope));
    storageKeys.push(...getLegacyEditableContentStorageKeys(productOrScope));
  }

  if (Array.isArray(additionalKeys)) {
    storageKeys.push(...additionalKeys);
  }

  return [...new Set(storageKeys.filter((key) => typeof key === "string" && key.trim()))];
};

export const readEditableContentFromStorageKeys = (storageKeys = []) => {
  try {
    for (const storageKey of storageKeys) {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        continue;
      }

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return {
          overrides: parsed,
          sourceKey: storageKey,
        };
      }
    }
  } catch (error) {
    // no-op: localStorage may be unavailable or contain malformed JSON
  }

  return {
    overrides: {},
    sourceKey: null,
  };
};

export const readEditableContentFromStorage = (productOrScope = "") =>
  readEditableContentFromStorageKeys(getEditableContentStorageKeys(productOrScope)).overrides;

export const emitEditableContentChanged = (detail = {}) => {
  if (typeof window === "undefined" || typeof window.dispatchEvent !== "function") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(EDITABLE_CONTENT_CHANGED_EVENT, {
      detail,
    })
  );
};
