import React, { useCallback, useEffect, useState } from "react";
import ProductMockPage from "./pages/ProductMockPage";
import ShopStorePage from "./pages/ShopStorePage";
import {
  PRODUCT_ROUTE,
  SHOP_ROUTE,
  getProductRoute,
  matchProductRoute,
  normalizeRoute,
  readCurrentRoute,
} from "./utils/appRoutes";

const readCurrentPath = () => readCurrentRoute();

function App() {
  const [currentPath, setCurrentPath] = useState(() => readCurrentPath());

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(readCurrentPath());
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigate = useCallback((nextPath) => {
    const normalizedNextPath = normalizeRoute(nextPath);

    if (!normalizedNextPath || normalizedNextPath === readCurrentPath()) {
      return;
    }

    window.location.hash = normalizedNextPath.slice(1);
    setCurrentPath(normalizedNextPath);
    window.scrollTo({ top: 0, left: 0 });
  }, []);

  const productRouteMatch = matchProductRoute(currentPath);

  if (currentPath === SHOP_ROUTE) {
    return <ShopStorePage onNavigateToProduct={(slug) => navigate(getProductRoute(slug))} />;
  }

  return (
    <ProductMockPage
      key={productRouteMatch?.slug || currentPath}
      currentPath={currentPath}
      onNavigateToShop={() => navigate(SHOP_ROUTE)}
      onNavigateToProduct={(slug) => navigate(getProductRoute(slug))}
    />
  );
}

export default App;
