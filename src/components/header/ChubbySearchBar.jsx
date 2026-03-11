import React, { useState } from "react";

const defaultKeywords = [
  "เครื่องวัดน้ำตาล",
  "วิตามินดูแลผู้สูงอายุ",
  "อุปกรณ์สุขภาพ",
  "ผ้าอ้อมผู้ใหญ่",
  "เครื่องวัดความดัน",
];

const ChubbySearchBar = ({
  placeholder = "ค้นหาสินค้าและร้านค้าบน Chubby",
  quickKeywords = defaultKeywords,
}) => {
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="chb-search-block">
      <form className="chb-search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chb-search-input"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder={placeholder}
          aria-label="ค้นหาสินค้า"
        />
        <button type="submit" className="chb-search-button" aria-label="ค้นหา">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M10.4 3.4a7 7 0 1 1 0 14 7 7 0 0 1 0-14Zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm8.8 12.4 2.9 2.9-1.4 1.4-2.9-2.9 1.4-1.4Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>

      <div className="chb-quick-keywords">
        {quickKeywords.map((item, index) => (
          <a key={`${item}-${index}`} href="#" className="chb-keyword-link">
            {item}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ChubbySearchBar;

