import React from "react";

const defaultLeftLinks = [
  { label: "Seller Centre", href: "#" },
  { label: "เปิดร้านค้า", href: "#" },
  { label: "ดาวน์โหลด", href: "#" },
];

const defaultSocialLinks = [
  { label: "f", href: "#", title: "Facebook" },
  { label: "ig", href: "#", title: "Instagram" },
  { label: "ln", href: "#", title: "LINE" },
];

const defaultRightLinks = [
  { label: "การแจ้งเตือน", href: "#" },
  { label: "ช่วยเหลือ", href: "#" },
];

const ChubbyUtilityBar = ({
  leftLinks = defaultLeftLinks,
  socialLinks = defaultSocialLinks,
  rightLinks = defaultRightLinks,
  language = "ไทย",
  userName = "chubby.user",
}) => {
  return (
    <div className="chb-utility-bar">
      <div className="chb-utility-left">
        {leftLinks.map((item, index) => (
          <a key={`${item.label}-${index}`} href={item.href} className="chb-utility-link">
            {item.label}
          </a>
        ))}

        <span className="chb-utility-follow">ติดตามเราบน</span>
        <div className="chb-social-list">
          {socialLinks.map((item, index) => (
            <a
              key={`${item.label}-${index}`}
              href={item.href}
              className="chb-social-pill"
              title={item.title}
              aria-label={item.title}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="chb-utility-right">
        {rightLinks.map((item, index) => (
          <a key={`${item.label}-${index}`} href={item.href} className="chb-utility-link is-right">
            {item.label}
          </a>
        ))}

        <button type="button" className="chb-lang-button" aria-label="เลือกภาษา">
          {language}
          <span className="chb-caret">▾</span>
        </button>

        <button type="button" className="chb-account-button" aria-label="บัญชีผู้ใช้งาน">
          <span className="chb-account-avatar">C</span>
          <span className="chb-account-name">{userName}</span>
        </button>
      </div>
    </div>
  );
};

export default ChubbyUtilityBar;

