const normalizeBaseUrl = (baseUrl = "/") => {
  const normalized = String(baseUrl || "/").trim() || "/";
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

const normalizeRelativePath = (relativePath = "") =>
  String(relativePath || "")
    .trim()
    .replace(/\\/g, "/")
    .replace(/^(\.\/)+/, "")
    .replace(/^\/+/, "");

const decodePathIfNeeded = (relativePath = "") => {
  try {
    return decodeURI(relativePath);
  } catch {
    return relativePath;
  }
};

export const getPublicAssetSrc = (relativePath = "") => {
  const normalizedPath = normalizeRelativePath(relativePath);
  if (!normalizedPath) {
    return normalizeBaseUrl(import.meta.env.BASE_URL);
  }

  return `${normalizeBaseUrl(import.meta.env.BASE_URL)}${encodeURI(normalizedPath)}`;
};

export const normalizeStoredAssetSrc = (value) => {
  const trimmedValue = typeof value === "string" ? value.trim() : "";
  if (!trimmedValue) {
    return "";
  }

  if (/^(data:|blob:|https?:|\/\/)/i.test(trimmedValue)) {
    return trimmedValue;
  }

  const normalizedPath = normalizeRelativePath(trimmedValue);
  if (
    normalizedPath.startsWith("generated-assets/") ||
    normalizedPath.startsWith("mockupshopeeImages/")
  ) {
    return getPublicAssetSrc(decodePathIfNeeded(normalizedPath));
  }

  return trimmedValue;
};
