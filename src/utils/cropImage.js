const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("ไม่สามารถโหลดรูปภาพสำหรับครอปได้"));
    image.src = src;
  });

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

export const cropImageToDataUrl = async (
  imageSrc,
  cropRect,
  options = { type: "image/jpeg", quality: 0.92 }
) => {
  if (!imageSrc) {
    throw new Error("ไม่พบรูปภาพที่ต้องการครอป");
  }

  const image = await loadImage(imageSrc);
  const safeX = clamp(Math.round(cropRect.x || 0), 0, Math.max(image.naturalWidth - 1, 0));
  const safeY = clamp(Math.round(cropRect.y || 0), 0, Math.max(image.naturalHeight - 1, 0));
  const safeWidth = clamp(
    Math.round(cropRect.width || image.naturalWidth),
    1,
    image.naturalWidth - safeX
  );
  const safeHeight = clamp(
    Math.round(cropRect.height || image.naturalHeight),
    1,
    image.naturalHeight - safeY
  );

  const canvas = document.createElement("canvas");
  canvas.width = safeWidth;
  canvas.height = safeHeight;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("ไม่สามารถเตรียมพื้นที่วาดรูปได้");
  }

  context.drawImage(
    image,
    safeX,
    safeY,
    safeWidth,
    safeHeight,
    0,
    0,
    safeWidth,
    safeHeight
  );

  return canvas.toDataURL(options.type || "image/jpeg", options.quality ?? 0.92);
};

