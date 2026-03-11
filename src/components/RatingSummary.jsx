import React from "react";

const filterChips = [
  { key: "all", label: "ทั้งหมด" },
  { key: "star-5", label: "5 ดาว" },
  { key: "star-4", label: "4 ดาว" },
  { key: "star-3", label: "3 ดาว" },
  { key: "star-2", label: "2 ดาว" },
  { key: "star-1", label: "1 ดาว" },
  { key: "comment", label: "ความคิดเห็น" },
  { key: "media", label: "มีรูปภาพ/วิดีโอ" },
];

const RatingSummary = ({ summary, selectedFilter, onFilterChange }) => {
  const maxCount = Math.max(...summary.breakdown.map((item) => item.count), 1);

  return (
    <section aria-label="สรุปคะแนน">
      <div className="pm-rating-summary">
        <div className="pm-rating-score-box">
          <div className="pm-rating-score">{summary.score.toFixed(1)}</div>
          <div className="pm-rating-stars">{"★".repeat(5)}</div>
          <div className="pm-rating-total">
            {summary.totalRatings.toLocaleString("th-TH")} คะแนน
          </div>
        </div>

        <div className="pm-rating-bars">
          {summary.breakdown.map((item) => {
            const width = (item.count / maxCount) * 100;
            return (
              <div className="pm-rating-bar-row" key={item.star}>
                <span className="pm-rating-bar-label">{item.star} ดาว</span>
                <div className="pm-rating-bar-track">
                  <div className="pm-rating-bar-fill" style={{ width: `${width}%` }} />
                </div>
                <span className="pm-rating-bar-count">{item.count}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="pm-rating-filters">
        {filterChips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            className={`pm-filter-chip ${selectedFilter === chip.key ? "is-active" : ""}`}
            onClick={() => onFilterChange(chip.key)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
};

export default RatingSummary;
