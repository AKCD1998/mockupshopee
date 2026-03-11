import React, { useMemo } from "react";
import RichTextEditableRegion from "./admin/RichTextEditableRegion";

const escapeHtml = (value) => {
  const safeText = typeof value === "string" ? value : "";
  return safeText
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

const toListMarkup = (items = [], cssClass = "") => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  const classNamePart = cssClass ? ` class="${cssClass}"` : "";
  const content = safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  return `<ul${classNamePart}>${content}</ul>`;
};

const buildDefaultDescriptionHtml = (description = {}) => {
  const intro = escapeHtml(description?.intro || "").replaceAll("\n", "<br>");
  const highlights = toListMarkup(description?.highlights, "pm-list");
  const inBox = toListMarkup(description?.inBox, "pm-list");
  const notes = toListMarkup(description?.notes, "pm-list note");

  return `
    <p class="pm-description-intro">${intro}</p>
    <h3 class="pm-subtitle">จุดเด่นสินค้า</h3>
    ${highlights}
    <h3 class="pm-subtitle">ภายในกล่อง</h3>
    ${inBox}
    <h3 class="pm-subtitle">หมายเหตุ</h3>
    ${notes}
  `;
};

const sanitizeDisplayHtml = (html) => {
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
      const isUnsafeHref =
        (attrName === "href" || attrName === "src") && attrValue.startsWith("javascript:");
      if (isEventHandler || isUnsafeHref) {
        element.removeAttribute(attribute.name);
      }
    });
  });

  return root.innerHTML;
};

const ProductDescription = ({
  description,
  isEditMode = false,
  htmlContent = "",
  onSaveHtml = () => {},
  onRestoreDefault,
}) => {
  const defaultHtml = useMemo(() => buildDefaultDescriptionHtml(description), [description]);
  const displayHtml = useMemo(() => {
    const hasOverride = typeof htmlContent === "string" && htmlContent.trim();
    return sanitizeDisplayHtml(hasOverride ? htmlContent : defaultHtml);
  }, [defaultHtml, htmlContent]);

  return (
    <section className="pm-section-card pm-description-card" aria-label="คำอธิบายสินค้า">
      <h2 className="pm-section-title">คำอธิบายสินค้า</h2>
      <RichTextEditableRegion
        regionId="product-description"
        label="คำอธิบายสินค้า"
        isEditMode={isEditMode}
        value={displayHtml}
        onSave={onSaveHtml}
        onRestoreDefault={onRestoreDefault}
        helpText="ระบบจะบันทึกข้อมูลนี้ไว้ในเครื่องผ่าน localStorage"
      >
        <div
          className="pm-description-rich-content"
          dangerouslySetInnerHTML={{ __html: displayHtml }}
        />
      </RichTextEditableRegion>
    </section>
  );
};

export default ProductDescription;
