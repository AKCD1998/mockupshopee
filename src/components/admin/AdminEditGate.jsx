import React from "react";

const AdminEditGate = ({
  isEditMode = false,
  onOpenAuth = () => {},
  onExitEditMode = () => {},
  onResetEditableContent,
}) => {
  return (
    <div className="ae-gate" role="region" aria-label="Admin edit controls">
      {!isEditMode ? (
        <button type="button" className="ae-gate-trigger" onClick={onOpenAuth}>
          Admin Edit
        </button>
      ) : (
        <div className="ae-gate-panel">
          <div className="ae-gate-status">
            <span className="ae-gate-dot" />
            โหมดแก้ไขเปิดอยู่
          </div>
          <div className="ae-gate-actions">
            {onResetEditableContent ? (
              <button
                type="button"
                className="ae-gate-btn ae-gate-btn-ghost"
                onClick={onResetEditableContent}
              >
                รีเซ็ตข้อมูล
              </button>
            ) : null}
            <button
              type="button"
              className="ae-gate-btn ae-gate-btn-danger"
              onClick={onExitEditMode}
            >
              ปิดโหมดแก้ไข
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEditGate;
