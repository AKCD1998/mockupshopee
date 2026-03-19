import React, { useCallback, useEffect, useState } from "react";
import ProductMockPage from "./pages/ProductMockPage";
import ShopStorePage from "./pages/ShopStorePage";
import { PRODUCT_ROUTE, SHOP_ROUTE, getProductRoute, matchProductRoute } from "./utils/appRoutes";

const readCurrentPath = () => window.location.pathname || PRODUCT_ROUTE;

function App() {
  const [currentPath, setCurrentPath] = useState(() => readCurrentPath());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(readCurrentPath());
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = useCallback((nextPath) => {
    if (!nextPath || nextPath === readCurrentPath()) {
      return;
    }

    window.history.pushState({}, "", nextPath);
    setCurrentPath(nextPath);
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
