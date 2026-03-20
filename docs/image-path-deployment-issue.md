# Issue: Broken Storefront Images After GitHub Pages Deploy

## Summary

Some storefront images render as broken after deployment, even though the image files exist in the repository and were pushed to `origin`.

This affected:

- feature banner grid images
- top sales card images
- some product/store images restored from saved editable content

## Symptoms

- image placeholders or broken-image icons appear in the storefront
- DevTools shows image URLs such as:

```txt
./generated-assets/dr-morepen-glucoone-bg03/store-overview-feature-8.jpg
```

- broken images appear more often on nested routes such as:

```txt
/shop/...
/product/...
```

## Root Cause

There were two separate issues:

### 1. Legacy image paths from saved editable content

Some image URLs were still being loaded from `localStorage` through editable-content overrides.

Those saved values used relative paths like:

```txt
./generated-assets/...
```

On nested routes, those paths resolve incorrectly and the browser requests the wrong URL.

### 2. GitHub Pages base-path mismatch

The deploy workflow was building with:

```txt
--base=./
```

For GitHub Pages project sites, assets should resolve under the repository path:

```txt
/mockupshopee/...
```

Without a repo-aware base path, public asset URLs can break after deployment.

## Fix Applied

### Runtime path normalization

Added a shared helper to normalize public asset URLs and convert stored legacy paths into deploy-safe paths:

- `src/utils/publicAsset.js`

Updated product publishing/merge logic so image overrides and avatar overrides are normalized before rendering:

- `src/utils/publishProduct.js`

### Shared asset mapping

Updated promo/shop asset sources to use base-aware public URLs:

- `src/data/shopPromoAssets.js`
- `src/data/mockProducts.js`

### GitHub Pages workflow

Updated the Pages build command to use the repository name as the base path:

- `.github/workflows/deploy.yml`

Changed from:

```txt
npm run build -- --base=./
```

Changed to:

```txt
npm run build -- --base=/${{ github.event.repository.name }}/
```

### Regression coverage

Added a test to ensure legacy stored paths like `./generated-assets/...` are normalized correctly:

- `src/pages/__tests__/ShopStorePage.test.jsx`

## Verification

Verified successfully with:

```txt
npm test
npm run build -- --base=/mockupshopee/
```

Results:

- tests passed
- build passed
- built output resolves assets under `/mockupshopee/...`

## Remaining Operational Note

If a browser still shows broken images after the fix is deployed, the browser may still have old editable-content overrides in `localStorage`.

Clear keys matching:

```txt
pm_editable_content_v2:*
```

for the deployed site and hard-refresh the page.

## Impact

- deployed storefront can show broken images despite valid repo assets
- local editable-content overrides can silently override fixed source paths
- nested route rendering is especially vulnerable when stored image paths are relative

## Recommended Prevention

- always generate public asset URLs through a shared helper
- never store route-relative asset paths like `./generated-assets/...`
- keep GitHub Pages builds repo-base-aware
- retain regression tests for legacy stored image-path normalization
