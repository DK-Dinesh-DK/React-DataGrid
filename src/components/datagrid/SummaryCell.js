import React,{memo} from "react";
import { css } from "@linaria/core";

import { getCellStyle, getCellClassname } from "./utils";
import { useRovingCellRef } from "./hooks/useRovingCellRef";

export const summaryCellClassname = css`
  @layer rdg.SummaryCell {
    inset-block-start: var(--rdg-summary-row-top);
    inset-block-end: var(--rdg-summary-row-bottom);
  }
`;

function SummaryCell({ column, colSpan, row, isCellSelected, selectCell }) {
  const { ref, tabIndex, onFocus } = useRovingCellRef(isCellSelected);
  const { summaryCellClass } = column;
  const className = getCellClassname(
    column,
    summaryCellClassname,
    `rdg-summary-column-${column.idx % 2 === 0 ? "even" : "odd"}`,
    typeof summaryCellClass === "function"
      ? summaryCellClass(row)
      : summaryCellClass
  );

  function onClick() {
    selectCell(row, column);
  }

  return (
    // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
    <div
      role="gridcell"
      aria-colindex={column.idx + 1}
      aria-colspan={colSpan}
      aria-selected={isCellSelected}
      ref={ref}
      tabIndex={tabIndex}
      className={className}
      style={getCellStyle(column, colSpan)}
      onClick={onClick}
      onFocus={onFocus}>
      {column.summaryFormatter?.({ column, row, isCellSelected })}
    </div>
  );
}

export default memo(SummaryCell);
