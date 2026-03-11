import React, { useEffect, useMemo, useState } from "react";

let customVariantSequence = 0;

const createCustomVariantId = () => {
  customVariantSequence += 1;
  return `custom-variant-${Date.now()}-${customVariantSequence}`;
};

const toSafeNumber = (value) => {
  const parsed = Number.parseFloat(String(value).replace(/,/g, "").trim());
  if (!Number.isFinite(parsed)) {
    return null;
  }
  return Math.max(Math.round(parsed), 0);
};

const createDraftRow = () => ({
  id: createCustomVariantId(),
  label: "",
  priceInput: "0",
  active: true,
});

const toDraftRows = (rows = []) => {
  const normalizedRows = rows.map((row) => ({
    id: typeof row?.id === "string" && row.id.trim() ? row.id : createCustomVariantId(),
    label: typeof row.label === "string" ? row.label : "",
    priceInput: String(Number.isFinite(row.price) ? Math.max(Math.round(row.price), 0) : 0),
    active: typeof row.active === "boolean" ? row.active : !row.disabled,
  }));

  return normalizedRows.length ? normalizedRows : [createDraftRow()];
};

const VariantPriceEditor = ({
  variants = [],
  onSave = () => {},
  onRestoreDefault,
}) => {
  const safeVariants = Array.isArray(variants) ? variants : [];
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftRows, setDraftRows] = useState(() => toDraftRows(safeVariants));
  const [error, setError] = useState("");

  const normalizedSourceRows = useMemo(() => toDraftRows(safeVariants), [safeVariants]);

  useEffect(() => {
    if (!isEditorOpen) {
      setDraftRows(normalizedSourceRows);
      setError("");
    }
  }, [isEditorOpen, normalizedSourceRows]);

  const handleOpenEditor = () => {
    setDraftRows(normalizedSourceRows);
    setError("");
    setIsEditorOpen(true);
  };

  const handleCancel = () => {
    setDraftRows(normalizedSourceRows);
    setError("");
    setIsEditorOpen(false);
  };

  const handleChangeRow = (index, key, nextValue) => {
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

  const handleAddRow = () => {
    setDraftRows((prev) => [...prev, createDraftRow()]);
    setError("");
  };

  const handleRemoveRow = (index) => {
    setDraftRows((prev) => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter((_, rowIndex) => rowIndex !== index);
    });
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!draftRows.length) {
      setError("ต้องมีอย่างน้อย 1 ตัวเลือกสินค้า");
      return;
    }

    const nextRows = [];
    for (const row of draftRows) {
      const nextLabel = typeof row.label === "string" ? row.label.trim() : "";
      const nextPrice = toSafeNumber(row.priceInput);
      const nextActive = Boolean(row.active);

      if (!nextLabel) {
        setError("กรุณากรอกชื่อตัวเลือกสินค้าให้ครบทุกแถว");
        return;
      }
      if (nextPrice === null) {
        setError("กรุณากรอกราคาเป็นตัวเลขที่ถูกต้อง");
        return;
      }

      nextRows.push({
        id: row.id,
        label: nextLabel,
        price: nextPrice,
        active: nextActive,
      });
    }

    onSave(nextRows);
    setError("");
    setIsEditorOpen(false);
  };

  const handleRestoreDefault = () => {
    onRestoreDefault?.();
    setError("");
    setIsEditorOpen(false);
  };

  return (
    <div className={`ae-region ae-variant-price-region ${isEditorOpen ? "is-editor-open" : ""}`}>
      <button
        type="button"
        className="ae-region-trigger ae-variant-price-edit-trigger"
        onClick={handleOpenEditor}
        aria-label="แก้ไขตัวเลือกและราคา"
      >
        ✎
      </button>

      {isEditorOpen ? (
        <div
          className="ae-editor-panel ae-variant-price-editor is-popover"
          role="dialog"
          aria-label="แก้ไขตัวเลือกและราคา"
        >
          <div className="ae-editor-header">
            <h4 className="ae-editor-title">แก้ไขตัวเลือกและราคา</h4>
          </div>

          <form className="ae-editor-form" onSubmit={handleSubmit}>
            <div className="ae-variant-editor-header">
              <span>สถานะ</span>
              <span>ตัวเลือก</span>
              <span>ราคา (บาท)</span>
              <span>จัดการ</span>
            </div>
            <div className="ae-variant-editor-grid">
              {draftRows.map((row, index) => (
                <div
                  className={`ae-variant-editor-row ${row.active ? "" : "is-inactive"}`}
                  key={row.id || `variant-${index}`}
                >
                  <label className="ae-variant-status-cell">
                    <input
                      type="checkbox"
                      className="ae-variant-toggle"
                      checked={row.active}
                      onChange={(event) => handleChangeRow(index, "active", event.target.checked)}
                    />
                    <span className="ae-variant-status-text">{row.active ? "เปิดขาย" : "ปิดการขาย"}</span>
                  </label>
                  <div className="ae-variant-label-cell">
                    <input
                      type="text"
                      className="ae-editor-input"
                      value={row.label}
                      onChange={(event) => handleChangeRow(index, "label", event.target.value)}
                      placeholder="ชื่อตัวเลือกสินค้า"
                    />
                    {!row.active ? <span className="ae-variant-disabled-tag">ปิดการขาย</span> : null}
                  </div>
                  <input
                    type="number"
                    className="ae-editor-input"
                    min={0}
                    step={1}
                    value={row.priceInput}
                    onChange={(event) => handleChangeRow(index, "priceInput", event.target.value)}
                    placeholder="ราคา"
                  />
                  <div className="ae-variant-actions-cell">
                    <button
                      type="button"
                      className="ae-btn ae-btn-danger ae-btn-variant-remove"
                      onClick={() => handleRemoveRow(index)}
                      disabled={draftRows.length <= 1}
                      aria-label={`ลบตัวเลือกที่ ${index + 1}`}
                    >
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="ae-variant-editor-tools">
              <button
                type="button"
                className="ae-btn ae-btn-secondary ae-btn-variant-add"
                onClick={handleAddRow}
              >
                + เพิ่มตัวเลือก
              </button>
              <span className="ae-editor-help">ต้องมีอย่างน้อย 1 ตัวเลือกสินค้า</span>
            </div>

            {error ? <p className="ae-editor-error">{error}</p> : null}

            <div className="ae-editor-actions">
              {onRestoreDefault ? (
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
  );
};

export default VariantPriceEditor;
