import React from "react";

const Breadcrumbs = ({ items = [] }) => {
  return (
    <nav className="pm-breadcrumbs" aria-label="หมวดหมู่สินค้า">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={`${item}-${index}`}>
            {isLast ? (
              <span className="pm-breadcrumb-current">{item}</span>
            ) : (
              <a href="#" className="pm-breadcrumb-link">
                {item}
              </a>
            )}
            {!isLast && <span className="pm-breadcrumb-sep"> &gt; </span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
