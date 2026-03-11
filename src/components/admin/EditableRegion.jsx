import React, { useEffect, useMemo, useState } from "react";

const toDefaultInputValue = (value) => {
  if (Array.isArray(value)) {
    return value.join("\n");
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
};

const EditableRegion = ({
  regionId = "",
  label = "ข้อมูล",
  isEditMode = false,
  value = "",
  onSave = () => {},
  onRestoreDefault,
  editor = "text",
  editorPlacement = "popover",
  openOnRegionClick = false,
  placeholder = "",
  helpText = "",
  rows = 5,
  toInputValue,
  fromInputValue,
  children,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const serializedValue = useMemo(() => {
    if (typeof toInputValue === "function") {
      return toInputValue(value);
    }
    return toDefaultInputValue(value);
  }, [toInputValue, value]);

  useEffect(() => {
    if (!isEditorOpen) {
      setDraft(serializedValue);
      setError("");
    }
  }, [isEditorOpen, serializedValue]);

  useEffect(() => {
    if (!isEditMode && isEditorOpen) {
      setIsEditorOpen(false);
      setError("");
    }
  }, [isEditMode, isEditorOpen]);

  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleOpenEditor = () => {
    setDraft(serializedValue);
    setError("");
    setIsEditorOpen(true);
  };

  const handleCancel = () => {
    setDraft(serializedValue);
    setError("");
    setIsEditorOpen(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const parsedValue =
      typeof fromInputValue === "function"
        ? fromInputValue(draft)
        : editor === "text"
          ? draft.trim()
          : draft;

    if (editor === "text" && !String(parsedValue || "").trim()) {
      setError("กรุณากรอกข้อมูล");
      return;
    }

    onSave(parsedValue);
    setError("");
    setIsEditorOpen(false);
  };

  const handleRestoreDefault = () => {
    onRestoreDefault?.();
    setError("");
    setIsEditorOpen(false);
  };

  const handleContentClick = (event) => {
    if (!openOnRegionClick || isEditorOpen) {
      return;
    }
    const target = event.target;
    if (target instanceof Element && target.closest("button,a,input,textarea,select,label")) {
      return;
    }
    handleOpenEditor();
  };

  const handleContentKeyDown = (event) => {
    if (!openOnRegionClick || isEditorOpen) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpenEditor();
    }
  };

  const isInlinePanel = editorPlacement === "inline";

  return (
    <div
      className={`ae-region ${isEditorOpen ? "is-editor-open" : ""} ${
        openOnRegionClick ? "is-openable" : ""
      } ${isInlinePanel ? "is-inline" : ""}`}
      data-region-id={regionId || label}
    >
      <div
        className="ae-region-content"
        onClick={handleContentClick}
        onKeyDown={handleContentKeyDown}
        role={openOnRegionClick ? "button" : undefined}
        tabIndex={openOnRegionClick ? 0 : undefined}
      >
        {children}
      </div>
      <button
        type="button"
        className="ae-region-trigger"
        onClick={handleOpenEditor}
        aria-label={`แก้ไข ${label}`}
      >
        ✎
      </button>

      {isEditorOpen ? (
        <div
          className={`ae-editor-panel ${isInlinePanel ? "is-inline" : "is-popover"}`}
          role="dialog"
          aria-label={`แก้ไข ${label}`}
        >
          <div className="ae-editor-header">
            <h4 className="ae-editor-title">แก้ไข{label}</h4>
          </div>

          <form className="ae-editor-form" onSubmit={handleSubmit}>
            {editor === "text" ? (
              <input
                className="ae-editor-input"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                autoFocus
              />
            ) : (
              <textarea
                className="ae-editor-textarea"
                value={draft}
                rows={rows}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={placeholder}
                autoFocus
              />
            )}

            {helpText ? <p className="ae-editor-help">{helpText}</p> : null}
            {error ? <p className="ae-editor-error">{error}</p> : null}

            <div className="ae-editor-actions">
              {onRestoreDefault ? (
                <button
                  type="button"
                  className="ae-btn ae-btn-reset"
                  onClick={handleRestoreDefault}
                >
                  คืนค่าเริ่มต้น
                </button>
              ) : null}
              <button type="button" className="ae-btn ae-btn-secondary" onClick={handleCancel}>
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

export default EditableRegion;
