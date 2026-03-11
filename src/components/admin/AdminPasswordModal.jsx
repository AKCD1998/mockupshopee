import React, { useEffect, useState } from "react";

const AdminPasswordModal = ({ open, onClose, onSubmit, errorMessage = "" }) => {
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit?.(password);
  };

  return (
    <div className="ae-modal-backdrop" onClick={onClose}>
      <div className="ae-modal" onClick={(event) => event.stopPropagation()}>
        <h3 className="ae-modal-title">Admin Edit</h3>
        <p className="ae-modal-subtitle">กรอกรหัสผ่านเพื่อเปิดโหมดแก้ไข</p>

        <form onSubmit={handleSubmit} className="ae-modal-form">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="ae-password-input"
            placeholder="Password"
            autoFocus
          />
          {errorMessage ? <p className="ae-modal-error">{errorMessage}</p> : null}

          <div className="ae-modal-actions">
            <button type="button" className="ae-btn ae-btn-secondary" onClick={onClose}>
              ยกเลิก
            </button>
            <button type="submit" className="ae-btn ae-btn-primary">
              เข้าสู่โหมดแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPasswordModal;
