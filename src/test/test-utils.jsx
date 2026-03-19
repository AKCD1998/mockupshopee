import React from "react";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import ProductMockPage from "../pages/ProductMockPage";
import ShopStorePage from "../pages/ShopStorePage";
import { getDefaultMockProduct, getProductBySlug } from "../data/mockProduct";
import { getEditableContentStorageKey } from "../utils/editableContentStorage";
import { getProductRoute } from "../utils/appRoutes";

export * from "@testing-library/react";

export const getMockProduct = (slug = "") => {
  if (typeof slug === "string" && slug.trim()) {
    return getProductBySlug(slug) || getDefaultMockProduct();
  }

  return getDefaultMockProduct();
};

export const seedEditableContent = (productOrSlug, editableContent = {}) => {
  const product =
    typeof productOrSlug === "string" ? getMockProduct(productOrSlug) : productOrSlug;
  const storageKey = getEditableContentStorageKey(product);

  localStorage.setItem(storageKey, JSON.stringify(editableContent));

  return {
    product,
    storageKey,
  };
};

export const renderWithUser = (ui, options = {}) => ({
  user: userEvent.setup(),
  ...render(ui, options),
});

export const renderProductMockPage = ({
  slug = "",
  editableContent = null,
  currentPath,
  onNavigateToShop = vi.fn(),
  onNavigateToProduct = vi.fn(),
} = {}) => {
  const product = getMockProduct(slug);

  if (editableContent) {
    seedEditableContent(product, editableContent);
  }

  return {
    product,
    ...renderWithUser(
      <ProductMockPage
        currentPath={currentPath || getProductRoute(product.slug || product.id)}
        onNavigateToShop={onNavigateToShop}
        onNavigateToProduct={onNavigateToProduct}
      />
    ),
  };
};

export const renderShopStorePage = ({
  onNavigateToProduct = vi.fn(),
} = {}) => ({
  onNavigateToProduct,
  ...renderWithUser(<ShopStorePage onNavigateToProduct={onNavigateToProduct} />),
});
