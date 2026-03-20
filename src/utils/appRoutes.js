export const PRODUCT_ROUTE_PREFIX = "/product";
export const DEFAULT_PRODUCT_SLUG = "dr-morepen-glucoone-bg03";
export const PRODUCT_ROUTE_PATH = `${PRODUCT_ROUTE_PREFIX}/${DEFAULT_PRODUCT_SLUG}`;
export const SHOP_ROUTE_PATH = "/shop/dr-morepen-medical-th";
export const PRODUCT_ROUTE = `#${PRODUCT_ROUTE_PATH}`;
export const SHOP_ROUTE = `#${SHOP_ROUTE_PATH}`;

const normalizePathname = (pathname = "") => {
  if (typeof pathname !== "string" || !pathname.trim()) {
    return PRODUCT_ROUTE_PATH;
  }

  const trimmedPath = pathname.trim();
  const hashPath =
    trimmedPath.startsWith("#") || trimmedPath.includes("#")
      ? trimmedPath.slice(trimmedPath.indexOf("#") + 1)
      : trimmedPath;
  const [cleanPath] = hashPath.split(/[?#]/, 1);
  if (!cleanPath) {
    return PRODUCT_ROUTE_PATH;
  }

  if (cleanPath === "/") {
    return cleanPath;
  }

  const normalizedPath = cleanPath.replace(/\/+$/, "");
  return normalizedPath.startsWith("/") ? normalizedPath : `/${normalizedPath}`;
};

export const normalizeRoute = (pathname = "") => {
  const normalizedPath = normalizePathname(pathname);
  return normalizedPath === "/" ? PRODUCT_ROUTE : `#${normalizedPath}`;
};

export const readCurrentRoute = (locationLike) => {
  const safeLocation =
    locationLike ||
    (typeof window !== "undefined" && window.location ? window.location : { hash: "", pathname: "" });
  const hashRoute = typeof safeLocation.hash === "string" ? safeLocation.hash.trim() : "";

  if (hashRoute && hashRoute !== "#") {
    return normalizeRoute(hashRoute);
  }

  const pathname = typeof safeLocation.pathname === "string" ? safeLocation.pathname.trim() : "";
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/" || !pathname) {
    return PRODUCT_ROUTE;
  }

  return normalizeRoute(normalizedPath);
};

export const getProductRoute = (slug = DEFAULT_PRODUCT_SLUG) => {
  const safeSlug = typeof slug === "string" && slug.trim() ? slug.trim() : DEFAULT_PRODUCT_SLUG;
  return `#${PRODUCT_ROUTE_PREFIX}/${encodeURIComponent(safeSlug)}`;
};

export const matchProductRoute = (pathname = "") => {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === "/") {
    return {
      slug: DEFAULT_PRODUCT_SLUG,
      pathname: normalizedPath,
      route: PRODUCT_ROUTE,
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
    route: normalizeRoute(normalizedPath),
    isLegacyRoute: false,
  };
};
