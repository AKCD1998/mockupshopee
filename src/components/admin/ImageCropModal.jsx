import React, { useEffect, useMemo, useRef, useState } from "react";
import { cropImageToDataUrl } from "../../utils/cropImage";

const MIN_CROP_SIZE = 20;

const clamp = (value, min, max) => {
  return Math.min(Math.max(value, min), max);
};

const ImageCropModal = ({ open, imageSrc, onClose, onApply }) => {
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const [imageMeta, setImageMeta] = useState({ naturalWidth: 0, naturalHeight: 0 });
  const [selection, setSelection] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!open) {
      setSelection(null);
      setDragStart(null);
      setErrorMessage("");
      setIsSaving(false);
    }
  }, [open]);

  const setCenteredSelection = () => {
    const container = containerRef.current;
    if (!container) {
      return;
    }
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) {
      return;
    }
    setSelection({
      x: width * 0.1,
      y: height * 0.1,
      width: width * 0.8,
      height: height * 0.8,
    });
  };

  const handleImageLoad = () => {
    if (!imageRef.current) {
      return;
    }
    setImageMeta({
      naturalWidth: imageRef.current.naturalWidth,
      naturalHeight: imageRef.current.naturalHeight,
    });
    setCenteredSelection();
  };

  const getLocalPoint = (event) => {
    const container = containerRef.current;
    if (!container) {
      return { x: 0, y: 0 };
    }
    const rect = container.getBoundingClientRect();
    return {
      x: clamp(event.clientX - rect.left, 0, rect.width),
      y: clamp(event.clientY - rect.top, 0, rect.height),
    };
  };

  const handlePointerDown = (event) => {
    if (!containerRef.current) {
      return;
    }
    event.preventDefault();
    const point = getLocalPoint(event);
    setDragStart(point);
    setSelection({ x: point.x, y: point.y, width: 0, height: 0 });
  };

  const handlePointerMove = (event) => {
    if (!dragStart || !containerRef.current) {
      return;
    }
    const point = getLocalPoint(event);
    const nextX = Math.min(dragStart.x, point.x);
    const nextY = Math.min(dragStart.y, point.y);
    const nextWidth = Math.abs(point.x - dragStart.x);
    const nextHeight = Math.abs(point.y - dragStart.y);
    setSelection({
      x: nextX,
      y: nextY,
      width: nextWidth,
      height: nextHeight,
    });
  };

  const handlePointerUp = () => {
    setDragStart(null);
  };

  const canSaveCrop = useMemo(() => {
    return (
      selection &&
      selection.width >= MIN_CROP_SIZE &&
      selection.height >= MIN_CROP_SIZE &&
      imageMeta.naturalWidth > 0 &&
      imageMeta.naturalHeight > 0
    );
  }, [selection, imageMeta.naturalHeight, imageMeta.naturalWidth]);

  const handleApply = async () => {
    if (!canSaveCrop || !imageRef.current || !selection) {
      setErrorMessage("กรุณาวาดพื้นที่ครอปให้กว้างและสูงอย่างน้อย 20px");
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const renderWidth = imageRef.current.clientWidth;
      const renderHeight = imageRef.current.clientHeight;
      const scaleX = imageMeta.naturalWidth / renderWidth;
      const scaleY = imageMeta.naturalHeight / renderHeight;

      const croppedDataUrl = await cropImageToDataUrl(imageSrc, {
        x: selection.x * scaleX,
        y: selection.y * scaleY,
        width: selection.width * scaleX,
        height: selection.height * scaleY,
      });

      onApply?.(croppedDataUrl);
    } catch (error) {
      setErrorMessage("ไม่สามารถครอปรูปได้ กรุณาลองใหม่");
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div className="ae-modal-backdrop" onClick={onClose}>
      <div className="ae-crop-modal" onClick={(event) => event.stopPropagation()}>
        <div className="ae-crop-header">
          <h3 className="ae-modal-title">ครอปรูปภาพ</h3>
          <p className="ae-modal-subtitle">ลากเมาส์เพื่อเลือกพื้นที่ที่ต้องการใช้</p>
        </div>

        <div className="ae-crop-canvas-wrap">
          <div
            className="ae-crop-stage"
            ref={containerRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="ภาพสำหรับครอป"
              className="ae-crop-image"
              onLoad={handleImageLoad}
            />
            <div className="ae-crop-overlay" />
            {selection ? (
              <div
                className="ae-crop-selection"
                style={{
                  left: `${selection.x}px`,
                  top: `${selection.y}px`,
                  width: `${selection.width}px`,
                  height: `${selection.height}px`,
                }}
              />
            ) : null}
          </div>
        </div>

        <p className="ae-crop-hint">
          เริ่มลากใหม่ได้ทันทีหากต้องการเปลี่ยนพื้นที่ครอป และควรเลือกพื้นที่ให้ครบวัตถุหลัก
        </p>
        {errorMessage ? <p className="ae-editor-error">{errorMessage}</p> : null}

        <div className="ae-modal-actions">
          <button type="button" className="ae-btn ae-btn-secondary" onClick={onClose}>
            ยกเลิก
          </button>
          <button
            type="button"
            className="ae-btn ae-btn-primary"
            onClick={handleApply}
            disabled={isSaving}
          >
            {isSaving ? "กำลังประมวลผล..." : "บันทึกครอป"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;

