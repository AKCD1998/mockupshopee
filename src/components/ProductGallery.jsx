import React, { useRef, useState } from "react";

const FALLBACK_IMAGE = "https://picsum.photos/seed/gallery-fallback/900/900";

const ProductGallery = ({
  images = [],
  selectedImage = 0,
  onSelectImage = () => {},
  productName = "สินค้า",
  isEditMode = false,
  onOpenGalleryEditor,
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbTrackRef = useRef(null);
  const safeImages = Array.isArray(images) && images.length ? images : [FALLBACK_IMAGE];
  const safeSelectedIndex = Math.min(Math.max(selectedImage, 0), safeImages.length - 1);
  const currentImage = safeImages[safeSelectedIndex];
  const canScrollThumbs = safeImages.length > 5;

  const handleThumbScroll = (direction) => {
    if (!thumbTrackRef.current) {
      return;
    }
    const offset = direction === "left" ? -260 : 260;
    thumbTrackRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  const handleLightboxNavigate = (direction) => {
    if (!safeImages.length) {
      return;
    }
    const nextIndex =
      direction === "next"
        ? (safeSelectedIndex + 1) % safeImages.length
        : (safeSelectedIndex - 1 + safeImages.length) % safeImages.length;
    onSelectImage(nextIndex);
  };

  const handleMainImageClick = () => {
    if (isEditMode && typeof onOpenGalleryEditor === "function") {
      onOpenGalleryEditor();
      return;
    }
    setIsLightboxOpen(true);
  };

  return (
    <section
      className={`pm-gallery ${isEditMode ? "ae-gallery-editable" : ""}`}
      aria-label="แกลเลอรีสินค้า"
    >
      <div className="pm-gallery-main">
        <button
          type="button"
          className="pm-gallery-main-btn"
          onClick={handleMainImageClick}
        >
          <img src={currentImage} alt={`${productName} รูปหลัก`} />
        </button>
        {isEditMode ? (
          <button
            type="button"
            className="ae-gallery-edit-button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenGalleryEditor?.();
            }}
            aria-label="แก้ไขแกลเลอรีสินค้า"
          >
            ✎ แก้ไขรูป
          </button>
        ) : null}
        <div className="pm-gallery-meta-overlay">
          <span className="pm-gallery-count">
            {safeSelectedIndex + 1} / {safeImages.length}
          </span>
        </div>
      </div>

      <div className={`pm-gallery-thumbs-wrap ${canScrollThumbs ? "" : "no-controls"}`}>
        {canScrollThumbs && (
          <button
            type="button"
            className="pm-thumb-nav"
            aria-label="เลื่อนรูปย่อยไปทางซ้าย"
            onClick={() => handleThumbScroll("left")}
          >
            ‹
          </button>
        )}
        <div className="pm-gallery-thumbs" ref={thumbTrackRef}>
          {safeImages.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              className={`pm-thumb-btn ${safeSelectedIndex === index ? "is-active" : ""}`}
              onClick={() => onSelectImage(index)}
              aria-label={`เลือกรูปที่ ${index + 1}`}
            >
              <img src={image} alt={`${productName} รูปที่ ${index + 1}`} />
            </button>
          ))}
        </div>
        {canScrollThumbs && (
          <button
            type="button"
            className="pm-thumb-nav"
            aria-label="เลื่อนรูปย่อยไปทางขวา"
            onClick={() => handleThumbScroll("right")}
          >
            ›
          </button>
        )}
      </div>

      {isLightboxOpen && (
        <div
          className="pm-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="pm-lightbox-panel" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              className="pm-lightbox-close"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="ปิดแกลเลอรี"
            >
              ×
            </button>
            <button
              type="button"
              className="pm-lightbox-nav is-left"
              onClick={() => handleLightboxNavigate("prev")}
              aria-label="รูปก่อนหน้า"
            >
              ‹
            </button>
            <img src={currentImage} alt={`${productName} ภาพขยาย`} className="pm-lightbox-image" />
            <button
              type="button"
              className="pm-lightbox-nav is-right"
              onClick={() => handleLightboxNavigate("next")}
              aria-label="รูปถัดไป"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductGallery;
