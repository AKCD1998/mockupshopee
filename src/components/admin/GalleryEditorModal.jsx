import React, { useEffect, useRef, useState } from "react";
import ImageCropModal from "./ImageCropModal";

const GalleryEditorModal = ({
  open,
  defaultImages = [],
  overrides = {},
  onSave,
  onClose,
}) => {
  const fileInputRef = useRef(null);
  const pendingUploadsRef = useRef({});
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [draftOverrides, setDraftOverrides] = useState({});
  const [pendingUploads, setPendingUploads] = useState({});
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isReadingUpload, setIsReadingUpload] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const revokeAllPendingUploads = (uploads) => {
    Object.values(uploads || {}).forEach((item) => {
      if (item?.objectUrl) {
        URL.revokeObjectURL(item.objectUrl);
      }
    });
  };

  useEffect(() => {
    pendingUploadsRef.current = pendingUploads;
  }, [pendingUploads]);

  useEffect(() => {
    if (!open) {
      setStatusMessage("");
      return;
    }
    revokeAllPendingUploads(pendingUploads);
    setPendingUploads({});
    setDraftOverrides(overrides || {});
    setSelectedSlot((prev) => Math.min(prev, Math.max(defaultImages.length - 1, 0)));
    setIsReadingUpload(false);
    setStatusMessage("");
  }, [defaultImages.length, open, overrides]);

  useEffect(() => {
    return () => {
      revokeAllPendingUploads(pendingUploadsRef.current);
    };
  }, []);

  const updatePendingUpload = (slot, nextUpload) => {
    setPendingUploads((prev) => {
      const current = prev[slot];
      if (current?.objectUrl) {
        URL.revokeObjectURL(current.objectUrl);
      }

      if (!nextUpload) {
        const next = { ...prev };
        delete next[slot];
        return next;
      }

      return {
        ...prev,
        [slot]: nextUpload,
      };
    });
  };

  const safeDefaultImages = Array.isArray(defaultImages) ? defaultImages : [];
  const slotCount = safeDefaultImages.length;
  const hasSlotOverride = (slotIndex) =>
    Object.prototype.hasOwnProperty.call(draftOverrides, slotIndex);
  const isSlotRemoved = (slotIndex) => hasSlotOverride(slotIndex) && draftOverrides[slotIndex] === null;
  const selectedDefaultImage = safeDefaultImages[selectedSlot] || "";
  const selectedPending = pendingUploads[selectedSlot];
  const selectedCustom = hasSlotOverride(selectedSlot) ? draftOverrides[selectedSlot] : undefined;
  const selectedPreviewImage =
    selectedPending?.objectUrl ||
    (typeof selectedCustom === "string" ? selectedCustom : "") ||
    (!hasSlotOverride(selectedSlot) ? selectedDefaultImage : "") ||
    "";

  const getSlotPreview = (slotIndex) => {
    if (pendingUploads[slotIndex]?.objectUrl) {
      return pendingUploads[slotIndex].objectUrl;
    }
    if (hasSlotOverride(slotIndex)) {
      const overrideValue = draftOverrides[slotIndex];
      return typeof overrideValue === "string" ? overrideValue : "";
    }
    return safeDefaultImages[slotIndex] || "";
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const slotAtUpload = selectedSlot;
    const objectUrl = URL.createObjectURL(file);
    updatePendingUpload(slotAtUpload, {
      objectUrl,
      fileName: file.name,
    });
    setIsReadingUpload(true);
    setStatusMessage(`กำลังเตรียมไฟล์: ${file.name}`);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (dataUrl) {
        setDraftOverrides((prev) => ({
          ...prev,
          [slotAtUpload]: dataUrl,
        }));
        setStatusMessage("อัปโหลดแล้ว สามารถบันทึกได้ทันที หรือกดครอปรูปเพิ่มเติม");
      } else {
        setStatusMessage("ไม่สามารถอ่านไฟล์รูปได้ กรุณาลองใหม่");
      }
      setIsReadingUpload(false);
    };
    reader.onerror = () => {
      setStatusMessage("ไม่สามารถอ่านไฟล์รูปได้ กรุณาลองใหม่");
      updatePendingUpload(slotAtUpload, null);
      setIsReadingUpload(false);
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleApplyCrop = (croppedDataUrl) => {
    setDraftOverrides((prev) => ({
      ...prev,
      [selectedSlot]: croppedDataUrl,
    }));
    updatePendingUpload(selectedSlot, null);
    setIsCropOpen(false);
    setStatusMessage("ครอปรูปเรียบร้อยแล้ว กดบันทึกเพื่อใช้งาน");
  };

  const handleRestoreSlot = () => {
    setDraftOverrides((prev) => {
      if (!(selectedSlot in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[selectedSlot];
      return next;
    });
    updatePendingUpload(selectedSlot, null);
    setStatusMessage("คืนค่าเริ่มต้นรูปนี้แล้ว");
  };

  const handleRestoreAll = () => {
    setDraftOverrides({});
    revokeAllPendingUploads(pendingUploads);
    setPendingUploads({});
    setIsReadingUpload(false);
    setStatusMessage("คืนค่าแกลเลอรีทั้งหมดแล้ว");
  };

  const handleDeleteSlot = () => {
    if (isSlotRemoved(selectedSlot)) {
      setStatusMessage("ช่องนี้ถูกลบอยู่แล้ว");
      return;
    }

    updatePendingUpload(selectedSlot, null);
    setDraftOverrides((prev) => ({
      ...prev,
      [selectedSlot]: null,
    }));
    setStatusMessage("ลบรูปในช่องนี้แล้ว กดบันทึกเพื่อใช้งาน");
  };

  const handleSave = () => {
    if (isReadingUpload) {
      setStatusMessage("กำลังเตรียมไฟล์รูป กรุณารอสักครู่แล้วค่อยบันทึก");
      return;
    }
    onSave?.(draftOverrides);
    onClose?.();
  };

  const handleClose = () => {
    revokeAllPendingUploads(pendingUploads);
    setPendingUploads({});
    setIsReadingUpload(false);
    onClose?.();
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div className="ae-modal-backdrop" onClick={handleClose}>
        <div className="ae-gallery-modal" onClick={(event) => event.stopPropagation()}>
          <div className="ae-gallery-header">
            <h3 className="ae-modal-title">แก้ไขแกลเลอรีสินค้า</h3>
            <p className="ae-modal-subtitle">
              เลือกช่องภาพด้านซ้าย แล้วอัปโหลดรูปใหม่ได้ทันที (ครอปเป็นตัวเลือกเสริม)
            </p>
          </div>

          <div className="ae-gallery-body">
            <aside className="ae-gallery-slots">
              {safeDefaultImages.map((_, index) => {
                const slotImage = getSlotPreview(index);
                const isActive = index === selectedSlot;
                const hasOverride =
                  hasSlotOverride(index) &&
                  typeof draftOverrides[index] === "string" &&
                  Boolean(draftOverrides[index]);
                const hasPending = Boolean(pendingUploads[index]);
                const hasRemoved = isSlotRemoved(index);
                return (
                  <button
                    key={`slot-${index}`}
                    type="button"
                    className={`ae-gallery-slot ${isActive ? "is-active" : ""}`}
                    onClick={() => setSelectedSlot(index)}
                  >
                    {slotImage ? (
                      <img src={slotImage} alt={`ช่องรูปที่ ${index + 1}`} />
                    ) : (
                      <div className="ae-slot-empty">ลบรูปแล้ว</div>
                    )}
                    <span className="ae-slot-label">รูป {index + 1}</span>
                    {hasPending ? <span className="ae-slot-tag pending">พร้อมครอป</span> : null}
                    {!hasPending && hasRemoved ? (
                      <span className="ae-slot-tag deleted">ลบแล้ว</span>
                    ) : null}
                    {!hasPending && hasOverride ? (
                      <span className="ae-slot-tag custom">กำหนดเอง</span>
                    ) : null}
                  </button>
                );
              })}
            </aside>

            <section className="ae-gallery-editor">
              <div className="ae-gallery-preview-wrap">
                {selectedPreviewImage ? (
                  <img
                    src={selectedPreviewImage}
                    alt={`พรีวิวรูปที่ ${selectedSlot + 1}`}
                    className="ae-gallery-preview-image"
                  />
                ) : (
                  <div className="ae-gallery-preview-empty">
                    {isSlotRemoved(selectedSlot)
                      ? "รูปในช่องนี้ถูกลบแล้ว (กดบันทึกเพื่อยืนยัน)"
                      : "ไม่พบรูปพรีวิว"}
                  </div>
                )}
              </div>

              <div className="ae-gallery-meta">
                <span>ช่องรูป: {selectedSlot + 1}</span>
                {selectedPending?.fileName ? (
                  <span className="ae-upload-file-name">ไฟล์ล่าสุด: {selectedPending.fileName}</span>
                ) : isSlotRemoved(selectedSlot) ? (
                  <span className="ae-upload-file-name">รูปนี้ถูกลบแล้ว (รอบันทึก)</span>
                ) : (
                  <span className="ae-upload-file-name">ยังไม่มีไฟล์ใหม่ในช่องนี้</span>
                )}
              </div>

              <div className="ae-gallery-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="ae-file-input"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="ae-btn ae-btn-secondary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  อัปโหลดรูปใหม่
                </button>
                <button
                  type="button"
                  className="ae-btn ae-btn-primary"
                  disabled={!selectedPending}
                  onClick={() => setIsCropOpen(true)}
                >
                  ครอปรูป
                </button>
                <button
                  type="button"
                  className="ae-btn ae-btn-danger"
                  disabled={isSlotRemoved(selectedSlot)}
                  onClick={handleDeleteSlot}
                >
                  ลบรูปนี้
                </button>
                <button
                  type="button"
                  className="ae-btn ae-btn-reset"
                  onClick={handleRestoreSlot}
                >
                  คืนค่าเริ่มต้นรูปนี้
                </button>
              </div>
            </section>
          </div>

          <div className="ae-gallery-footer">
            <button type="button" className="ae-btn ae-btn-reset" onClick={handleRestoreAll}>
              คืนค่าแกลเลอรีทั้งหมด
            </button>
            <div className="ae-gallery-footer-actions">
              <button type="button" className="ae-btn ae-btn-secondary" onClick={handleClose}>
                ยกเลิก
              </button>
              <button type="button" className="ae-btn ae-btn-primary" onClick={handleSave}>
                {isReadingUpload ? "กำลังเตรียมไฟล์..." : "บันทึก"}
              </button>
            </div>
          </div>

          {statusMessage ? <p className="ae-gallery-status">{statusMessage}</p> : null}
          {slotCount === 0 ? <p className="ae-editor-error">ไม่พบรูปเริ่มต้นในแกลเลอรี</p> : null}
        </div>
      </div>

      <ImageCropModal
        open={isCropOpen}
        imageSrc={selectedPending?.objectUrl}
        onClose={() => setIsCropOpen(false)}
        onApply={handleApplyCrop}
      />
    </>
  );
};

export default GalleryEditorModal;
