import { useEffect, useState } from "react";

const ADMIN_PASSWORD = "S123123c";
const ADMIN_EDIT_STORAGE_KEY = "pm_admin_edit_mode";

const getStoredEditMode = () => {
  try {
    return localStorage.getItem(ADMIN_EDIT_STORAGE_KEY) === "true";
  } catch (error) {
    return false;
  }
};

const useAdminEdit = () => {
  const [isEditMode, setIsEditMode] = useState(getStoredEditMode);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_EDIT_STORAGE_KEY, String(isEditMode));
    } catch (error) {
      // no-op: localStorage may be unavailable in restricted environments
    }
  }, [isEditMode]);

  const openPasswordModal = () => {
    setAuthError("");
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    setAuthError("");
    setIsPasswordModalOpen(false);
  };

  const submitPassword = (inputPassword) => {
    if (inputPassword === ADMIN_PASSWORD) {
      setIsEditMode(true);
      setAuthError("");
      setIsPasswordModalOpen(false);
      return true;
    }
    setAuthError("รหัสผ่านไม่ถูกต้อง");
    return false;
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    setAuthError("");
  };

  return {
    isEditMode,
    isPasswordModalOpen,
    authError,
    openPasswordModal,
    closePasswordModal,
    submitPassword,
    exitEditMode,
  };
};

export default useAdminEdit;
