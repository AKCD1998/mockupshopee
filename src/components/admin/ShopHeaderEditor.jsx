import React, { useRef, useState } from "react";
import "../../styles/shop-header-editor.css";

const normalizeText = (value) => {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
};

const toInitial = (value, fallback = "A") => {
  const normalized = normalizeText(value);
  if (!normalized) {
    return fallback;
  }
  return normalized.charAt(0).toUpperCase();
};

const ShopHeaderEditor = ({
  isEditMode = false,
  defaultName = "ร้านค้าตัวอย่าง",
  name = "",
  status = "",
  avatarSrc = "",
  onNavigate = null,
  onSave = () => {},
}) => {
  const fileInputRef = useRef(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [draftAvatarSrc, setDraftAvatarSrc] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [error, setError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const safeDefaultName = normalizeText(defaultName) || "ร้านค้าตัวอย่าง";
  const safeDisplayName = normalizeText(name) || safeDefaultName;
  const safeAvatarSrc = normalizeText(avatarSrc);
  const avatarInitial = toInitial(safeDisplayName);
  const previewInitial = toInitial(draftName, avatarInitial);
  const canNavigateToShop = !isEditMode && typeof onNavigate === "function";

  const handleOpenEditor = () => {
    setDraftName(safeDisplayName);
    setDraftAvatarSrc(safeAvatarSrc);
    setUploadedFileName("");
    setError("");
    setStatusMessage("");
    setIsEditorOpen(true);
  };

  const handleCancel = () => {
    setDraftName(safeDisplayName);
    setDraftAvatarSrc(safeAvatarSrc);
    setUploadedFileName("");
    setError("");
    setStatusMessage("");
    setIsEditorOpen(false);
  };

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (!dataUrl) {
        setStatusMessage("ไม่สามารถอ่านไฟล์รูปได้ กรุณาลองใหม่");
        return;
      }
      setDraftAvatarSrc(dataUrl);
      setUploadedFileName(file.name);
      setStatusMessage(`อัปโหลดรูปแล้ว: ${file.name}`);
      setError("");
    };
    reader.onerror = () => {
      setStatusMessage("ไม่สามารถอ่านไฟล์รูปได้ กรุณาลองใหม่");
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetAvatarDraft = () => {
    setDraftAvatarSrc("");
    setUploadedFileName("");
    setStatusMessage("ลบรูปที่อัปโหลดและคืนค่าเริ่มต้นแล้ว");
    setError("");
  };

  const handleResetNameDraft = () => {
    setDraftName(safeDefaultName);
    setStatusMessage("คืนค่าชื่อร้านเริ่มต้นแล้ว");
    setError("");
  };

  const handleRestoreAllDraft = () => {
    setDraftName(safeDefaultName);
    setDraftAvatarSrc("");
    setUploadedFileName("");
    setStatusMessage("คืนค่าเริ่มต้นทั้งหมดแล้ว");
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextName = normalizeText(draftName);
    if (!nextName) {
      setError("กรุณากรอกชื่อร้าน");
      return;
    }

    onSave({
      name: nextName,
      avatarSrc: normalizeText(draftAvatarSrc),
    });
    setError("");
    setStatusMessage("");
    setIsEditorOpen(false);
  };

  const headerBody = (
    <div className="pm-shop-header">
      <div className={`pm-shop-avatar ${safeAvatarSrc ? "has-image" : ""}`}>
        {safeAvatarSrc ? (
          <img
            src={safeAvatarSrc}
            alt={`โลโก้ร้าน ${safeDisplayName}`}
            className="pm-shop-avatar-image"
          />
        ) : (
          <span className="pm-shop-avatar-fallback">{avatarInitial}</span>
        )}
      </div>
      <div>
        <h2 className="pm-shop-name">{safeDisplayName}</h2>
        <p className="pm-shop-status">{status}</p>
      </div>
    </div>
  );

  const headerContent = canNavigateToShop ? (
    <button
      type="button"
      className="pm-shop-header-button"
      onClick={onNavigate}
      aria-label={`เปิดหน้าร้าน ${safeDisplayName}`}
    >
      {headerBody}
    </button>
  ) : (
    headerBody
  );

  if (!isEditMode) {
    return headerContent;
  }

  return (
    <div
      className={`ae-region ae-shop-header-region ${isEditorOpen ? "is-editor-open" : ""}`}
      data-region-id="shop-header"
    >
      <div className="ae-region-content">{headerContent}</div>
      <button
        type="button"
        className="ae-region-trigger"
        onClick={handleOpenEditor}
        aria-label="แก้ไขส่วนหัวร้านค้า"
      >
        ✎
      </button>

      {isEditorOpen ? (
        <div className="ae-editor-panel ae-shop-header-editor is-popover" role="dialog" aria-label="แก้ไขส่วนหัวร้านค้า">
          <div className="ae-editor-header">
            <h4 className="ae-editor-title">แก้ไขข้อมูลร้านค้า</h4>
          </div>

          <form className="ae-editor-form" onSubmit={handleSubmit}>
            <div className="ae-shop-header-editor-grid">
              <div className="ae-shop-avatar-preview-wrap">
                <div className={`pm-shop-avatar ae-shop-avatar-preview ${draftAvatarSrc ? "has-image" : ""}`}>
                  {draftAvatarSrc ? (
                    <img
                      src={draftAvatarSrc}
                      alt="ตัวอย่างรูปโปรไฟล์ร้าน"
                      className="pm-shop-avatar-image"
                    />
                  ) : (
                    <span className="pm-shop-avatar-fallback">{previewInitial}</span>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="ae-shop-avatar-input"
                  onChange={handleAvatarFileChange}
                />

                <div className="ae-shop-avatar-actions">
                  <button
                    type="button"
                    className="ae-btn ae-btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    อัปโหลดรูป
                  </button>
                  <button
                    type="button"
                    className="ae-btn ae-btn-reset"
                    onClick={handleResetAvatarDraft}
                    disabled={!draftAvatarSrc}
                  >
                    ลบรูปที่อัปโหลด / คืนค่าเริ่มต้น
                  </button>
                </div>
              </div>

              <div className="ae-shop-name-editor">
                <label className="ae-shop-field-label" htmlFor="ae-shop-name-input">
                  ชื่อร้าน
                </label>
                <input
                  id="ae-shop-name-input"
                  className="ae-editor-input"
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  placeholder="กรอกชื่อร้าน"
                  autoFocus
                />
                <p className="ae-editor-help">สถานะออนไลน์ยังไม่เปิดแก้ไขในรอบนี้</p>
                <button
                  type="button"
                  className="ae-btn ae-btn-reset ae-shop-name-restore"
                  onClick={handleResetNameDraft}
                >
                  คืนค่าชื่อร้านเริ่มต้น
                </button>
              </div>
            </div>

            {uploadedFileName ? (
              <p className="ae-upload-file-name">ไฟล์ล่าสุด: {uploadedFileName}</p>
            ) : null}
            {statusMessage ? <p className="ae-gallery-status">{statusMessage}</p> : null}
            {error ? <p className="ae-editor-error">{error}</p> : null}

            <div className="ae-editor-actions">
              <button
                type="button"
                className="ae-btn ae-btn-reset"
                onClick={handleRestoreAllDraft}
              >
                คืนค่าเริ่มต้นทั้งหมด
              </button>
              <button
                type="button"
                className="ae-btn ae-btn-secondary"
                onClick={handleCancel}
              >
                ยกเลิก
              </button>
              <button type="submit" className="ae-btn ae-btn-primary">
                บันทึก
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default ShopHeaderEditor;
