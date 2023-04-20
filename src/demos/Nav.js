import { NavLink } from "react-router-dom";
import { css } from "@linaria/core";
import React from "react";

const navClassname = css`
  display: flex;
  flex-direction: column;
  white-space: nowrap;

  @media (prefers-color-scheme: light) {
    border-inline-start: 4px solid hsl(210deg 50% 80%);
  }
  @media (prefers-color-scheme: dark) {
    border-inline-start: 4px solid hsl(210deg 50% 40%);
  }

  h1,
  h2 {
    margin: 8px;
  }

  a {
    color: inherit;
    font-size: 14px;
    line-height: 22px;
    text-decoration: none;
    padding-block: 0;
    padding-inline: 16px;
    transition: 0.1s background-color;

    &:hover {
      @media (prefers-color-scheme: light) {
        background-color: hsl(210deg 50% 90%);
      }
      @media (prefers-color-scheme: dark) {
        background-color: hsl(210deg 50% 30%);
      }
    }
  }
`;

const activeNavClassname = css`
  font-weight: 500;

  @media (prefers-color-scheme: light) {
    background-color: hsl(210deg 50% 80%);
  }
  @media (prefers-color-scheme: dark) {
    background-color: hsl(210deg 50% 40%);
  }

  a&:hover {
    @media (prefers-color-scheme: light) {
      background-color: hsl(210deg 50% 70%);
    }
    @media (prefers-color-scheme: dark) {
      background-color: hsl(210deg 50% 50%);
    }
  }
`;

const rtlCheckboxClassname = css`
  padding-inline-start: 8px;
`;

export default function Nav({ direction, onDirectionChange }) {
  return (
    <nav className={navClassname}>
      <h1>react-data-grid</h1>

      <h2>Demos</h2>
      <NavLink to="/all-features" end className={getActiveClassname}>
        1.Cell-wise background, Forecolor
      </NavLink>
      <NavLink to="/common-features" end className={getActiveClassname}>
        2. Common features
      </NavLink>
      <NavLink to="/cell-navigation" end className={getActiveClassname}>
        3. Cell Navigation
      </NavLink>
      <NavLink to="/column-spanning" end className={getActiveClassname}>
        4. Column Spanning
      </NavLink>
      <NavLink to="/columns-reordering" end className={getActiveClassname}>
        5. Columns Reordering
      </NavLink>
      <NavLink to="/context-menu" end className={getActiveClassname}>
        6.Context Menu
      </NavLink>
      <NavLink to="/customizable-components" end className={getActiveClassname}>
        7. Customizable Components
      </NavLink>
      <NavLink to="/grouping" end className={getActiveClassname}>
        8. Grouping
      </NavLink>
      <NavLink to="/header-filters" end className={getActiveClassname}>
        9. Header Filters
      </NavLink>
      <NavLink to="/infinite-scrolling" end className={getActiveClassname}>
        10. Infinite Scrolling
      </NavLink>
      <NavLink to="/master-detail" end className={getActiveClassname}>
        11. Master Detail
      </NavLink>
      <NavLink to="/million-cells" end className={getActiveClassname}>
        12. A Million Cells
      </NavLink>
      <NavLink to="/no-rows" end className={getActiveClassname}>
        13 Serial Number
      </NavLink>
      <NavLink to="/resizable-grid" end className={getActiveClassname}>
        14 Resizable Grid
      </NavLink>
      <NavLink to="/rows-reordering" end className={getActiveClassname}>
        15 Rows Reordering
      </NavLink>
      <NavLink to="/scroll-to-row" end className={getActiveClassname}>
        16 Scroll To Row
      </NavLink>
      <NavLink to="/tree-view" end className={getActiveClassname}>
        17 Tree View
      </NavLink>
      <NavLink to="/variable-row-height" end className={getActiveClassname}>
        18. Variable Row Height
      </NavLink>
      <NavLink to="/chnageinheight" end className={getActiveClassname}>
        19. Change In Table
      </NavLink>
      <NavLink to="/pagination-table" end className={getActiveClassname}>
        20. Table Pagination
      </NavLink>
      <NavLink to="/export" end className={getActiveClassname}>
        21. Export
      </NavLink>
      <NavLink to="/demo" end className={getActiveClassname}>
        22. Demo
      </NavLink>
      <NavLink to="/alingment" end className={getActiveClassname}>
        23. AlignmentDataTypes
      </NavLink>
      <NavLink to="/multilineheader" end className={getActiveClassname}>
        24. MultilineHeader
      </NavLink>
      <h2>Direction</h2>
      <label className={rtlCheckboxClassname}>
        <input
          type="checkbox"
          checked={direction === "rtl"}
          onChange={() =>
            onDirectionChange(direction === "rtl" ? "ltr" : "rtl")
          }
        />
        Right to left
      </label>
    </nav>
  );
}

function getActiveClassname({ isActive }) {
  return isActive ? activeNavClassname : "";
}
