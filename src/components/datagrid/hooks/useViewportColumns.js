
import React, { useMemo } from "react";

import { getColSpan } from "../utils";

export function useViewportColumns({
  columns,
  colSpanColumns,
  rows,
  topSummaryRows,
  bottomSummaryRows,
  colOverscanStartIdx,
  colOverscanEndIdx,
  lastFrozenColumnIndex,
  rowOverscanStartIdx,
  rowOverscanEndIdx,
  columnWidths,
  isGroupRow,
}) {
  // find the column that spans over a column within the visible columns range and adjust colOverscanStartIdx
  const startIdx = useMemo(() => {
    if (colOverscanStartIdx === 0) return 0;

    let startIdx = colOverscanStartIdx;

    const updateStartIdx = (colIdx, colSpan) => {
      if (colSpan !== undefined && colIdx + colSpan > colOverscanStartIdx) {
        startIdx = colIdx;
        return true;
      }
      return false;
    };

    for (const column of colSpanColumns) {
      // check header row
      const colIdx = column.idx;
      if (colIdx >= startIdx) break;
      if (
        updateStartIdx(
          colIdx,
          getColSpan(column, lastFrozenColumnIndex, { type: "HEADER" })
        )
      ) {
        break;
      }

      // check viewport rows
      for (
        let rowIdx = rowOverscanStartIdx;
        rowIdx <= rowOverscanEndIdx;
        rowIdx++
      ) {
        const row = rows[rowIdx];
        if (isGroupRow(row)) continue;
        if (
          updateStartIdx(
            colIdx,
            getColSpan(column, lastFrozenColumnIndex, { type: "ROW", row })
          )
        ) {
          break;
        }
      }

      // check summary rows
      if (topSummaryRows != null) {
        for (const row of topSummaryRows) {
          if (
            updateStartIdx(
              colIdx,
              getColSpan(column, lastFrozenColumnIndex, {
                type: "SUMMARY",
                row,
              })
            )
          ) {
            break;
          }
        }
      }

      if (bottomSummaryRows != null) {
        for (const row of bottomSummaryRows) {
          if (
            updateStartIdx(
              colIdx,
              getColSpan(column, lastFrozenColumnIndex, {
                type: "SUMMARY",
                row,
              })
            )
          ) {
            break;
          }
        }
      }
    }

    return startIdx;
  }, [
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    topSummaryRows,
    bottomSummaryRows,
    colOverscanStartIdx,
    lastFrozenColumnIndex,
    colSpanColumns,
    isGroupRow,
  ]);

  const { viewportColumns, flexWidthViewportColumns } = useMemo(() => {
    const viewportColumns = [];
    const flexWidthViewportColumns = [];
    for (let colIdx = 0; colIdx <= colOverscanEndIdx; colIdx++) {
      const column = columns[colIdx];

      if (colIdx < startIdx && !column.frozen) continue;
      viewportColumns.push(column);
      if (typeof column.width === "string") {
        flexWidthViewportColumns.push(column);
      }
    }

    return { viewportColumns, flexWidthViewportColumns };
  }, [startIdx, colOverscanEndIdx, columns]);

  const unsizedFlexWidthViewportColumns = useMemo(() => {
    return flexWidthViewportColumns.filter(
      (column) => !columnWidths.has(column.key)
    );
  }, [flexWidthViewportColumns, columnWidths]);

  return {
    viewportColumns,
    flexWidthViewportColumns: unsizedFlexWidthViewportColumns,
  };
}
