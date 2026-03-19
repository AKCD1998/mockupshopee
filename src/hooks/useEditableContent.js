import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_EDITABLE_CONTENT_STORAGE_KEY,
  EDITABLE_CONTENT_CHANGED_EVENT,
  EDITABLE_CONTENT_STORAGE_KEY_PREFIX,
  emitEditableContentChanged,
  getEditableContentStorageKey,
  getEditableContentStorageScope,
  getLegacyEditableContentStorageKeys,
  readEditableContentFromStorageKeys,
} from "../utils/editableContentStorage";

export {
  EDITABLE_CONTENT_CHANGED_EVENT,
  EDITABLE_CONTENT_STORAGE_KEY_PREFIX,
  getEditableContentStorageKey,
  getEditableContentStorageScope,
  getLegacyEditableContentStorageKeys,
} from "../utils/editableContentStorage";

const toStorageKeyList = (storageKey, fallbackStorageKeys = []) => {
  const nextKeys = [storageKey];
  if (Array.isArray(fallbackStorageKeys)) {
    nextKeys.push(...fallbackStorageKeys);
  }

  return [...new Set(nextKeys.filter((key) => typeof key === "string" && key.trim()))];
};

const useEditableContent = (
  initialContent,
  storageKey = DEFAULT_EDITABLE_CONTENT_STORAGE_KEY,
  fallbackStorageKeys = []
) => {
  const storageKeys = useMemo(
    () => toStorageKeyList(storageKey, fallbackStorageKeys),
    [fallbackStorageKeys, storageKey]
  );
  const [overrides, setOverrides] = useState(
    () => readEditableContentFromStorageKeys(storageKeys).overrides
  );

  useEffect(() => {
    const { overrides: nextOverrides, sourceKey } = readEditableContentFromStorageKeys(storageKeys);
    setOverrides(nextOverrides);

    if (!sourceKey || sourceKey === storageKey) {
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextOverrides));
      storageKeys.forEach((key) => {
        if (key !== storageKey) {
          localStorage.removeItem(key);
        }
      });
      emitEditableContentChanged({
        storageKey,
        sourceKey,
      });
    } catch (error) {
      // no-op: localStorage may be unavailable in restricted environments
    }
  }, [storageKey, storageKeys]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(overrides));
      emitEditableContentChanged({
        storageKey,
      });
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
    try {
      storageKeys.forEach((key) => localStorage.removeItem(key));
      emitEditableContentChanged({
        storageKey,
      });
    } catch (error) {
      // no-op: localStorage may be unavailable in restricted environments
    }
  }, [storageKey, storageKeys]);

  return {
    editableContent,
    setField,
    restoreField,
    resetEditableContent,
  };
};

export default useEditableContent;
