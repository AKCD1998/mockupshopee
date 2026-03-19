export const PRODUCT_ROUTE_PREFIX = "/product";
export const DEFAULT_PRODUCT_SLUG = "dr-morepen-glucoone-bg03";
export const PRODUCT_ROUTE = `${PRODUCT_ROUTE_PREFIX}/${DEFAULT_PRODUCT_SLUG}`;
export const SHOP_ROUTE = "/shop/dr-morepen-medical-th";

const normalizePathname = (pathname = "") => {
  if (typeof pathname !== "string" || !pathname.trim()) {
    return PRODUCT_ROUTE;
  }

  const [cleanPath] = pathname.trim().split(/[?#]/, 1);
  if (!cleanPath) {
    return PRODUCT_ROUTE;
  }

  if (cleanPath === "/") {
    return cleanPath;
  }

  return cleanPath.replace(/\/+$/, "");
};

export const getProductRoute = (slug = DEFAULT_PRODUCT_SLUG) => {
  const safeSlug = typeof slug === "string" && slug.trim() ? slug.trim() : DEFAULT_PRODUCT_SLUG;
  return `${PRODUCT_ROUTE_PREFIX}/${encodeURIComponent(safeSlug)}`;
};

export const matchProductRoute = (pathname = "") => {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") {
    return {
      slug: DEFAULT_PRODUCT_SLUG,
      pathname: normalizedPath,
      isLegacyRoute: true,
    };
  }

  const match = normalizedPath.match(/^\/product\/([^/]+)$/);
  if (!match) {
    return null;
  }

  let slug = match[1];
  try {
    slug = decodeURIComponent(slug);
  } catch {
    slug = match[1];
  }

  return {
    slug,
    pathname: normalizedPath,
    isLegacyRoute: false,
  };
};
