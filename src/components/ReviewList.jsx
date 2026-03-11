import React, { useEffect, useMemo, useState } from "react";

const PAGE_SIZE = 4;

const renderStars = (count) => {
  return "★".repeat(count) + "☆".repeat(Math.max(0, 5 - count));
};

const maskUsername = (name) => {
  const normalized = `${name || ""}`.trim();
  if (!normalized) {
    return "ผู้ใช้ไม่ระบุชื่อ";
  }
  if (normalized.includes("*")) {
    return normalized;
  }
  if (normalized.length <= 2) {
    return `${normalized.charAt(0)}*`;
  }
  return `${normalized.charAt(0)}${"*".repeat(
    Math.max(2, normalized.length - 2)
  )}${normalized.charAt(normalized.length - 1)}`;
};

const formatDate = (isoDate) => {
  return new Date(isoDate).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ReviewList = ({ reviews = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(Math.ceil(reviews.length / PAGE_SIZE), 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [reviews]);

  const pagedReviews = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return reviews.slice(start, start + PAGE_SIZE);
  }, [currentPage, reviews]);

  return (
    <section className="pm-review-list" aria-label="รีวิวลูกค้า">
      <h3 className="pm-subtitle">รีวิวจากผู้ซื้อ ({reviews.length})</h3>
      <div className="pm-review-items">
        {pagedReviews.length ? (
          pagedReviews.map((review) => (
            <article className="pm-review-card" key={review.id}>
              <div className="pm-review-header">
                <strong>{maskUsername(review.userName)}</strong>
                <span className="pm-review-rating">{renderStars(review.rating)}</span>
              </div>
              <div className="pm-review-meta">
                {formatDate(review.date)} | ตัวเลือก: {review.variantLabel}
              </div>
              <p className="pm-review-comment">
                {review.comment && review.comment.trim()
                  ? review.comment
                  : "ไม่ได้ระบุความคิดเห็นเพิ่มเติม"}
              </p>
              <div className="pm-review-like">ถูกใจ {review.likes}</div>
              <div className="pm-review-actions">
                <span>มีประโยชน์กับคุณ?</span>
                <button type="button" className="pm-help-btn">
                  ใช่
                </button>
                <button type="button" className="pm-help-btn">
                  ไม่
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="pm-review-empty">ไม่พบรีวิวตามตัวกรองที่เลือก</div>
        )}
      </div>

      <div className="pm-pagination">
        <button
          type="button"
          className="pm-page-btn"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
        >
          ก่อนหน้า
        </button>
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          return (
            <button
              key={page}
              type="button"
              className={`pm-page-btn ${currentPage === page ? "is-active" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          );
        })}
        <button
          type="button"
          className="pm-page-btn"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          ถัดไป
        </button>
      </div>
    </section>
  );
};

export default ReviewList;
