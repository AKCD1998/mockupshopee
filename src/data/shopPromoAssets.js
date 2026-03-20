const SHOP_PROMO_ASSET_BASE = "/mockupshopeeImages";

// Keep public URLs browser-safe while serving files from Thai-named folders.
const getShopPromoAssetSrc = (relativePath) =>
  `${SHOP_PROMO_ASSET_BASE}/${encodeURI(relativePath).replace(/%5C/g, "/")}`;

export const SHOP_PROMO_BANNER_IMAGES = {
  storefrontHero: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_1.jpg"),
  featureGridTopLeft: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_2.jpg"),
  featureGridTopRight: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_3.jpg"),
  featureGridBottomLeft: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_4.jpg"),
  featureGridBottomRight: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_5.jpg"),
  topSales: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_6.jpg"),
  overviewInsert: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_7.jpg"),
  vertical: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_8.jpg"),
  overview: getShopPromoAssetSrc("banner/LINE_ALBUM_Banner_260319_9.jpg"),
};

export const SHOP_PROMO_PRODUCT_IMAGES = {
  usageSteps: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_1.jpg"),
  meterBox: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_2.jpg"),
  meterOnly: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_3.jpg"),
  meterStrip25: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_4.jpg"),
  meterStrip50: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_5.jpg"),
  testStrips25: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_6.jpg"),
  testStrips50: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_7.jpg"),
  stethoscope: getShopPromoAssetSrc("แนะนำสินค้า/LINE_ALBUM_แนะนำสินค้า_260319_8.jpg"),
};
