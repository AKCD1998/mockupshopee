import React from "react";
import ShopHeaderEditor from "./admin/ShopHeaderEditor";

const ShopSummaryCard = ({
  shop,
  isEditMode = false,
  shopName = "",
  shopAvatarSrc = "",
  onOpenShop = null,
  onSaveShopHeader = () => {},
}) => {
  const displayShopName =
    typeof shopName === "string" && shopName.trim() ? shopName.trim() : shop.name;

  const stats = [
    { label: "คะแนน", value: shop.score.toFixed(1) },
    { label: "อัตราการตอบกลับ", value: shop.responseRate },
    { label: "เข้าร่วมเมื่อ", value: shop.joinedAt },
    { label: "รายการสินค้า", value: shop.productCount.toLocaleString("th-TH") },
    { label: "เวลาในการตอบกลับ", value: shop.responseTime },
    { label: "ผู้ติดตาม", value: shop.followers },
  ];

  return (
    <section className="pm-section-card pm-shop-card" aria-label="ข้อมูลร้านค้า">
      <ShopHeaderEditor
        isEditMode={isEditMode}
        defaultName={shop.name}
        name={displayShopName}
        status={shop.onlineStatus}
        avatarSrc={shopAvatarSrc}
        onNavigate={onOpenShop}
        onSave={onSaveShopHeader}
      />

      <div className="pm-shop-stat-grid">
        {stats.map((item) => (
          <div className="pm-stat-item" key={item.label}>
            <span className="pm-stat-label">{item.label}</span>
            <span className="pm-stat-value">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ShopSummaryCard;
