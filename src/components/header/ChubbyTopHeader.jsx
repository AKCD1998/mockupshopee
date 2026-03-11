import React from "react";
import ChubbyUtilityBar from "./ChubbyUtilityBar";
import ChubbyLogo from "./ChubbyLogo";
import ChubbySearchBar from "./ChubbySearchBar";
import ChubbyCartButton from "./ChubbyCartButton";

const utilityLeftLinks = [
  { label: "Seller Centre", href: "#" },
  { label: "เปิดร้านค้า", href: "#" },
  { label: "ดาวน์โหลด", href: "#" },
];

const utilitySocialLinks = [
  { label: "f", href: "#", title: "Facebook" },
  { label: "ig", href: "#", title: "Instagram" },
  { label: "ln", href: "#", title: "LINE" },
];

const utilityRightLinks = [
  { label: "การแจ้งเตือน", href: "#" },
  { label: "ช่วยเหลือ", href: "#" },
];

const quickKeywords = [
  "Gluco One",
  "แผ่นแปะสิว",
  "วิตามินดูแลผู้สูงอายุ",
  "แผ่นตรวจน้ำตาล",
  "Dr.Morepen",
  "Fixomull Stretch",
];

const ChubbyTopHeader = () => {
  return (
    <header className="chb-header-shell">
      <div className="chb-utility-shell">
        <div className="chb-container">
          <ChubbyUtilityBar
            leftLinks={utilityLeftLinks}
            socialLinks={utilitySocialLinks}
            rightLinks={utilityRightLinks}
            language="ไทย"
            userName="chubby.demo"
          />
        </div>
      </div>

      <div className="chb-main-shell">
        <div className="chb-container">
          <div className="chb-main-row">
            <ChubbyLogo />
            <ChubbySearchBar quickKeywords={quickKeywords} />
            <ChubbyCartButton count={2} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChubbyTopHeader;

