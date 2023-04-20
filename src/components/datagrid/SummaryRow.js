import React,{memo} from "react";

import clsx from "clsx";
import { css } from "@linaria/core";

import { cell, cellFrozen, rowClassname, rowSelectedClassname } from "./style";
import { getColSpan, getRowStyle } from "./utils";
import SummaryCell from "./SummaryCell";

const summaryRow = css`
  @layer rdg.SummaryRow {
    line-height: var(--rdg-sumary-row-height);

    > .${cell} {
      position: sticky;
    }
  }
`;

const topSummaryRow = css`
  @layer rdg.SummaryRow {
    > .${cell} {
      z-index: 1;
    }

    > .${cellFrozen} {
      z-index: 2;
    }
  }
`;

const topSummaryRowBorderClassname = css`
  @layer rdg.SummaryRow {
    > .${cell} {
      border-block-end: 2px solid var(--rdg-summary-border-color);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

const bottomSummaryRowBorderClassname = css`
  @layer rdg.SummaryRow {
    > .${cell} {
      border-block-start: 2px solid var(--rdg-summary-border-color);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
`;

const summaryRowClassname = `rdg-summary-row ${summaryRow}`;

const topSummaryRowClassname = `rdg-top-summary-row ${topSummaryRow}`;

function SummaryRow({
  rowIdx,
  gridRowStart,
  row,
  viewportColumns,
  top,
  bottom,
  lastFrozenColumnIndex,
  selectedCellIdx,
  lastTopRowIdx,
  selectCell,
  "aria-rowindex": ariaRowIndex,
}) {
  const cells = [];
  for (let index = 0; index < viewportColumns.length; index++) {
    const column = viewportColumns[index];
    const colSpan = getColSpan(column, lastFrozenColumnIndex, {
      type: "SUMMARY",
      row,
    });
    if (colSpan !== undefined) {
      index += colSpan - 1;
    }

    const isCellSelected = selectedCellIdx === column.idx;

    cells.push(
      <SummaryCell
        key={`${column.key}`}
        column={column}
        colSpan={colSpan}
        row={row}
        isCellSelected={isCellSelected}
        selectCell={selectCell}
      />
    );
  }

  const isTop = lastTopRowIdx !== undefined;

  return (
    <div
      role="row"
      aria-rowindex={ariaRowIndex}
      className={clsx(
        rowClassname,
        `rdg-row-summary-row-${rowIdx % 2 === 0 ? "even" : "odd"}`,
        summaryRowClassname,
        {
          [rowSelectedClassname]: selectedCellIdx === -1,
          [topSummaryRowClassname]: isTop,
          [topSummaryRowBorderClassname]: isTop && lastTopRowIdx === rowIdx,
          [bottomSummaryRowBorderClassname]: !isTop && rowIdx === 0,
          "rdg-bottom-summary-row": !isTop,
        }
      )}
      style={{
        ...getRowStyle(gridRowStart),
        "--rdg-summary-row-top": top !== undefined ? `${top}px` : undefined,
        "--rdg-summary-row-bottom":
          bottom !== undefined ? `${bottom}px` : undefined,
      }}>
      {cells}
    </div>
  );
}

export default memo(SummaryRow);
