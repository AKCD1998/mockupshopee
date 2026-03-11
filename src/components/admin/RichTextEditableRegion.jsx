import React, { useEffect, useMemo, useRef, useState } from "react";

const EDITOR_MIN_FONT_SIZE = 12;
const EDITOR_MAX_FONT_SIZE = 40;
const EDITOR_FONT_STEP = 2;

const sanitizeRichHtml = (html) => {
  if (typeof html !== "string") {
    return "";
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) {
    return "";
  }

  root.querySelectorAll("script,style,iframe,object,embed,link,meta,form").forEach((node) => {
    node.remove();
  });

  root.querySelectorAll("*").forEach((element) => {
    [...element.attributes].forEach((attribute) => {
      const attrName = attribute.name.toLowerCase();
      const attrValue = attribute.value.toLowerCase();
      const isEventHandler = attrName.startsWith("on");
      const isUnsafeHref = (attrName === "href" || attrName === "src") && attrValue.startsWith("javascript:");
      if (isEventHandler || isUnsafeHref) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return root.innerHTML;
};

const getSelectionAnchorElement = (editorElement) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return editorElement;
  }

  const anchorNode = selection.anchorNode;
  if (!anchorNode) {
    return editorElement;
  }

  const anchorElement =
    anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentElement;

  if (!(anchorElement instanceof Element)) {
    return editorElement;
  }

  return editorElement.contains(anchorElement) ? anchorElement : editorElement;
};

const insertAtCaret = (text) => {
  if (document.queryCommandSupported?.("insertText")) {
    document.execCommand("insertText", false, text);
    return;
  }

  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }
  const range = selection.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
};

const RichTextEditableRegion = ({
  regionId = "",
  label = "ข้อมูล",
  isEditMode = false,
  value = "",
  onSave = () => {},
  onRestoreDefault,
  helpText = "",
  children,
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [draftHtml, setDraftHtml] = useState("");
  const [error, setError] = useState("");
  const editorRef = useRef(null);

  const safeValue = useMemo(() => sanitizeRichHtml(value), [value]);

  useEffect(() => {
    if (!isEditorOpen) {
      setDraftHtml(safeValue);
      setError("");
      return;
    }
    if (editorRef.current && editorRef.current.innerHTML !== draftHtml) {
      editorRef.current.innerHTML = draftHtml;
    }
  }, [draftHtml, isEditorOpen, safeValue]);

  useEffect(() => {
    if (!isEditMode && isEditorOpen) {
      setIsEditorOpen(false);
      setError("");
    }
  }, [isEditMode, isEditorOpen]);

  if (!isEditMode) {
    return <>{children}</>;
  }

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const applySimpleCommand = (command) => {
    focusEditor();
    document.execCommand(command, false);
  };

  const changeSelectionFontSize = (direction) => {
    if (!editorRef.current) {
      return;
    }

    focusEditor();
    const baseElement = getSelectionAnchorElement(editorRef.current);
    const currentFontSize =
      Number.parseFloat(window.getComputedStyle(baseElement).fontSize) || 16;
    const nextFontSize = Math.min(
      Math.max(currentFontSize + direction * EDITOR_FONT_STEP, EDITOR_MIN_FONT_SIZE),
      EDITOR_MAX_FONT_SIZE
    );

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    if (!editorRef.current.contains(range.commonAncestorContainer)) {
      return;
    }

    const styledSpan = document.createElement("span");
    styledSpan.style.fontSize = `${nextFontSize}px`;

    if (range.collapsed) {
      const zeroWidthSpace = document.createTextNode("\u200B");
      styledSpan.appendChild(zeroWidthSpace);
      range.insertNode(styledSpan);
      range.setStart(zeroWidthSpace, 1);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      return;
    }

    try {
      range.surroundContents(styledSpan);
    } catch {
      const extracted = range.extractContents();
      styledSpan.appendChild(extracted);
      range.insertNode(styledSpan);
    }

    const nextRange = document.createRange();
    nextRange.selectNodeContents(styledSpan);
    nextRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(nextRange);
  };

  const handleOpenEditor = () => {
    setDraftHtml(safeValue);
    setError("");
    setIsEditorOpen(true);
  };

  const handleCancel = () => {
    setDraftHtml(safeValue);
    setError("");
    setIsEditorOpen(false);
  };

  const handleEditorInput = () => {
    setDraftHtml(editorRef.current?.innerHTML || "");
  };

  const handleEditorKeyDown = (event) => {
    const isModifierPressed = event.ctrlKey || event.metaKey;
    const key = event.key.toLowerCase();

    if (event.key === "Tab") {
      event.preventDefault();
      insertAtCaret("\u00A0\u00A0\u00A0\u00A0");
      return;
    }

    if (!isModifierPressed) {
      return;
    }

    if (key === "b") {
      event.preventDefault();
      applySimpleCommand("bold");
      return;
    }

    if (key === "u") {
      event.preventDefault();
      applySimpleCommand("underline");
      return;
    }

    if (event.shiftKey && (event.key === "<" || event.key === ",")) {
      event.preventDefault();
      changeSelectionFontSize(-1);
      return;
    }

    if (event.shiftKey && (event.key === ">" || event.key === ".")) {
      event.preventDefault();
      changeSelectionFontSize(1);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const rawHtml = editorRef.current?.innerHTML || "";
    const cleanedHtml = sanitizeRichHtml(rawHtml).replace(/\u200B/g, "").trim();
    const plainText = cleanedHtml.replace(/<[^>]*>/g, "").replace(/\u00A0/g, " ").trim();

    if (!plainText) {
      setError("กรุณากรอกข้อมูลคำอธิบาย");
      return;
    }

    onSave(cleanedHtml);
    setDraftHtml(cleanedHtml);
    setError("");
    setIsEditorOpen(false);
  };

  const handleRestoreDefault = () => {
    onRestoreDefault?.();
    setDraftHtml("");
    setError("");
    setIsEditorOpen(false);
  };

  return (
    <div className={`ae-region ${isEditorOpen ? "is-editor-open" : ""}`} data-region-id={regionId || label}>
      <div className="ae-region-content">{children}</div>
      <button
        type="button"
        className="ae-region-trigger"
        onClick={handleOpenEditor}
        aria-label={`แก้ไข ${label}`}
      >
        ✎
      </button>

      {isEditorOpen ? (
        <div className="ae-editor-panel ae-rich-editor-panel is-popover" role="dialog" aria-label={`แก้ไข ${label}`}>
          <div className="ae-editor-header">
            <h4 className="ae-editor-title">แก้ไข{label}</h4>
          </div>

          <form className="ae-editor-form" onSubmit={handleSubmit}>
            <div className="ae-rich-toolbar">
              <button
                type="button"
                className="ae-rich-toolbar-btn"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applySimpleCommand("bold")}
                title="ตัวหนา (Ctrl+B)"
              >
                B
              </button>
              <button
                type="button"
                className="ae-rich-toolbar-btn"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applySimpleCommand("underline")}
                title="ขีดเส้นใต้ (Ctrl+U)"
              >
                U
              </button>
              <button
                type="button"
                className="ae-rich-toolbar-btn"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => changeSelectionFontSize(-1)}
                title="ลดขนาดตัวอักษร (Ctrl+Shift+<)"
              >
                A-
              </button>
              <button
                type="button"
                className="ae-rich-toolbar-btn"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => changeSelectionFontSize(1)}
                title="เพิ่มขนาดตัวอักษร (Ctrl+Shift+>)"
              >
                A+
              </button>
            </div>

            <div
              ref={editorRef}
              className="ae-rich-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              onKeyDown={handleEditorKeyDown}
            />

            <p className="ae-editor-help ae-rich-help-shortcuts">
              คีย์ลัด: Ctrl+B ตัวหนา, Ctrl+U ขีดเส้นใต้, Ctrl+Shift+&lt;/&gt; ปรับขนาดตัวอักษร, Tab ย่อหน้า
            </p>
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

export default RichTextEditableRegion;
