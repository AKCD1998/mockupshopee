import React, { useEffect, useMemo, useState } from "react";

const ProductSpecs = ({
  specs,
  categoryPath,
  rows,
  isEditMode = false,
  onSaveRows = () => {},
  onRestoreDefaultRows,
}) => {
  const fallbackRows = useMemo(
    () => [
      { id: "category", label: "หมวดหมู่", value: categoryPath.join(" > ") },
      { id: "brand", label: "แบรนด์", value: specs.brand },
      { id: "warranty", label: "การรับประกัน", value: specs.warranty },
      { id: "shelfLife", label: "อายุสินค้า", value: specs.shelfLife },
      { id: "licenseNumber", label: "เลขที่ใบอนุญาต/จดแจ้ง", value: specs.licenseNumber },
      { id: "shipFrom", label: "จัดส่งจาก", value: specs.shipFrom },
    ],
    [categoryPath, specs]
  );

  const displayRows = Array.isArray(rows) && rows.length ? rows : fallbackRows;
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftRows, setDraftRows] = useState(displayRows);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditorOpen) {
      setDraftRows(displayRows);
      setError("");
    }
  }, [displayRows, isEditorOpen]);

  useEffect(() => {
    if (!isEditMode && isEditorOpen) {
      setIsEditorOpen(false);
      setError("");
    }
  }, [isEditMode, isEditorOpen]);

  const handleOpenEditor = () => {
    setDraftRows(displayRows);
    setError("");
    setIsEditorOpen(true);
  };

  const handleCancel = () => {
    setDraftRows(displayRows);
    setError("");
    setIsEditorOpen(false);
  };

  const handleDraftFieldChange = (index, key, nextValue) => {
    setDraftRows((prev) =>
      prev.map((row, rowIndex) => {
        if (rowIndex !== index) {
          return row;
        }
        return {
          ...row,
          [key]: nextValue,
        };
      })
    );
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const normalizedRows = draftRows.map((row) => ({
      ...row,
      label: typeof row.label === "string" ? row.label.trim() : "",
      value: typeof row.value === "string" ? row.value.trim() : "",
    }));

    const hasEmptyCell = normalizedRows.some((row) => !row.label || !row.value);
    if (hasEmptyCell) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    onSaveRows(normalizedRows);
    setError("");
    setIsEditorOpen(false);
  };

  const handleRestoreDefault = () => {
    onRestoreDefaultRows?.();
    setError("");
    setIsEditorOpen(false);
  };

  const sectionContent = (
    <>
      <h2 className="pm-section-title">รายละเอียดสินค้า</h2>
      <div className="pm-specs-table">
        {displayRows.map((row, index) => (
          <div className="pm-spec-row" key={row.id || `${row.label}-${index}`}>
            <div className="pm-spec-label">{row.label}</div>
            <div className="pm-spec-value">{row.value}</div>
          </div>
        ))}
      </div>
    </>
  );

  if (!isEditMode) {
    return (
      <section className="pm-section-card pm-specs-card" aria-label="รายละเอียดสินค้า">
        {sectionContent}
      </section>
    );
  }

  return (
    <section className="pm-section-card pm-specs-card ae-specs-region" aria-label="รายละเอียดสินค้า">
      <div className={`ae-region ${isEditorOpen ? "is-editor-open" : ""}`} data-region-id="product-specs">
        <div className="ae-region-content">{sectionContent}</div>
        <button
          type="button"
          className="ae-region-trigger"
          onClick={handleOpenEditor}
          aria-label="แก้ไขรายละเอียดสินค้า"
        >
          ✎
        </button>

        {isEditorOpen ? (
          <div className="ae-editor-panel ae-specs-editor is-popover" role="dialog" aria-label="แก้ไขรายละเอียดสินค้า">
            <div className="ae-editor-header">
              <h4 className="ae-editor-title">แก้ไขรายละเอียดสินค้า</h4>
            </div>

            <form className="ae-editor-form" onSubmit={handleSubmit}>
              <div className="ae-specs-editor-header">
                <span>คอลัมน์ซ้าย (หัวข้อ)</span>
                <span>คอลัมน์ขวา (ค่า)</span>
              </div>
              <div className="ae-specs-editor-grid">
                {draftRows.map((row, index) => (
                  <div className="ae-specs-editor-row" key={row.id || `draft-row-${index}`}>
                    <input
                      type="text"
                      className="ae-editor-input"
                      value={row.label}
                      onChange={(event) => handleDraftFieldChange(index, "label", event.target.value)}
                      placeholder="หัวข้อแถว"
                    />
                    <input
                      type="text"
                      className="ae-editor-input"
                      value={row.value}
                      onChange={(event) => handleDraftFieldChange(index, "value", event.target.value)}
                      placeholder="ค่าในแถว"
                    />
                  </div>
                ))}
              </div>

              {error ? <p className="ae-editor-error">{error}</p> : null}

              <div className="ae-editor-actions">
                {onRestoreDefaultRows ? (
                  <button type="button" className="ae-btn ae-btn-reset" onClick={handleRestoreDefault}>
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
    </section>
  );
};

export default ProductSpecs;
