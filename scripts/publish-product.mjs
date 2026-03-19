import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mockProduct from "../src/data/mockProduct.js";
import { buildPublishedProduct } from "../src/utils/publishProduct.js";

const EXPORT_FORMAT = "pm-editable-content-export-v1";
const DATA_URL_PATTERN = /^data:(image\/[a-zA-Z0-9.+-]+);base64,([\s\S]+)$/;
const MIME_EXTENSION_MAP = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputFilePath = path.join(repoRoot, "src", "data", "mockProduct.js");

const toPosixPath = (value) => value.split(path.sep).join("/");

const sanitizeFileStem = (value) =>
  String(value || "asset")
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "asset";

const parseDataUrl = (value) => {
  if (typeof value !== "string") {
    return null;
  }

  const match = value.match(DATA_URL_PATTERN);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  const base64Payload = match[2].replace(/\s+/g, "");
  return {
    mimeType,
    buffer: Buffer.from(base64Payload, "base64"),
    extension: MIME_EXTENSION_MAP[mimeType] || "bin",
  };
};

const materializeImageAsset = async (sourceValue, assetDir, publicPrefix, fileStem) => {
  const parsed = parseDataUrl(sourceValue);
  if (!parsed) {
    return sourceValue;
  }

  await fs.mkdir(assetDir, { recursive: true });
  const fileName = `${sanitizeFileStem(fileStem)}.${parsed.extension}`;
  const absoluteFilePath = path.join(assetDir, fileName);
  await fs.writeFile(absoluteFilePath, parsed.buffer);
  return toPosixPath(path.posix.join(publicPrefix, fileName));
};

const materializeProductAssets = async (product) => {
  const productId = sanitizeFileStem(product?.id || "mock-product");
  const assetDir = path.join(repoRoot, "public", "generated-assets", productId);
  const publicPrefix = `/generated-assets/${productId}`;
  const nextProduct = structuredClone(product);

  if (Array.isArray(nextProduct.images)) {
    nextProduct.images = await Promise.all(
      nextProduct.images.map((imageSrc, index) =>
        materializeImageAsset(imageSrc, assetDir, publicPrefix, `gallery-${index + 1}`)
      )
    );
  }

  if (typeof nextProduct.shop?.avatarSrc === "string" && nextProduct.shop.avatarSrc.trim()) {
    nextProduct.shop.avatarSrc = await materializeImageAsset(
      nextProduct.shop.avatarSrc,
      assetDir,
      publicPrefix,
      "shop-avatar"
    );
  }

  if (Array.isArray(nextProduct.sameShopItems)) {
    nextProduct.sameShopItems = await Promise.all(
      nextProduct.sameShopItems.map(async (item, index) => ({
        ...item,
        image: await materializeImageAsset(
          item?.image,
          assetDir,
          publicPrefix,
          `same-shop-${index + 1}`
        ),
      }))
    );
  }

  return nextProduct;
};

const usage = () => {
  console.error(
    [
      "Usage:",
      '  npm run publish:product -- "<path-to-exported-json>"',
      "",
      "The JSON file should come from the in-app 'ส่งออกไฟล์ publish' button.",
    ].join("\n")
  );
};

const main = async () => {
  const exportPathArg = process.argv[2];
  if (!exportPathArg) {
    usage();
    process.exitCode = 1;
    return;
  }

  const absoluteExportPath = path.resolve(process.cwd(), exportPathArg);
  const exportFileRaw = await fs.readFile(absoluteExportPath, "utf8");
  const exportPayload = JSON.parse(exportFileRaw);

  if (exportPayload?.format !== EXPORT_FORMAT || typeof exportPayload?.editableContent !== "object") {
    throw new Error("ไฟล์ export ไม่ถูกต้องหรือ format ไม่รองรับ");
  }

  if (exportPayload.productId && exportPayload.productId !== mockProduct.id) {
    console.warn(
      `Warning: export productId (${exportPayload.productId}) does not match source productId (${mockProduct.id}).`
    );
  }

  const publishedProduct = buildPublishedProduct(mockProduct, exportPayload.editableContent);
  const productWithAssets = await materializeProductAssets(publishedProduct);
  const fileContents = `const mockProduct = ${JSON.stringify(productWithAssets, null, 2)};\n\nexport default mockProduct;\n`;

  await fs.writeFile(outputFilePath, fileContents, "utf8");

  console.log(`Updated ${path.relative(repoRoot, outputFilePath)}`);
  console.log(`Processed export: ${absoluteExportPath}`);
  console.log("If you want a clean state after publishing, reset editable content in the UI or clear localStorage.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
