import { buildPublishedProduct } from "./publishProduct";
import { readEditableContentFromStorage } from "./editableContentStorage";

// Shared merge layer for product page + storefront cards.
export const buildDisplayProductFromEditableContent = (baseProduct = {}, editableContent = {}) =>
  buildPublishedProduct(baseProduct, editableContent);

export const getStoredDisplayProduct = (baseProduct = {}) =>
  buildDisplayProductFromEditableContent(baseProduct, readEditableContentFromStorage(baseProduct));

export const getStoredDisplayProducts = (products = []) =>
  (Array.isArray(products) ? products : []).map((product) => getStoredDisplayProduct(product));
