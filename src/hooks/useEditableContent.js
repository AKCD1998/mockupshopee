import { useCallback, useEffect, useState } from "react";

const readStoredContent = (storageKey) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
};

const useEditableContent = (initialContent, storageKey = "pm_editable_content_v1") => {
  const [overrides, setOverrides] = useState(() => readStoredContent(storageKey));

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(overrides));
    } catch (error) {
      // no-op: localStorage may be unavailable in restricted environments
    }
  }, [overrides, storageKey]);

  const editableContent = { ...initialContent, ...overrides };

  const setField = useCallback((fieldKey, nextValue) => {
    setOverrides((prev) => ({
      ...prev,
      [fieldKey]: nextValue,
    }));
  }, []);

  const restoreField = useCallback((fieldKey) => {
    setOverrides((prev) => {
      if (!(fieldKey in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  }, []);

  const resetEditableContent = useCallback(() => {
    setOverrides({});
  }, []);

  return {
    editableContent,
    setField,
    restoreField,
    resetEditableContent,
  };
};

export default useEditableContent;
