import React from 'react';
import { getColSpan } from "./colSpanUtils"

export function isSelectedCellEditable({
  selectedPosition,
  columns4,
  rows,
  isGroupRow
}) {
  const column = columns4[selectedPosition.idx]
  const row = rows[selectedPosition.rowIdx]
  return !isGroupRow(row) && isCellEditable(column, row)
}

export function isCellEditable(column, row) {
  return (
    column.cellEditor != null &&
    !column.rowGroup &&
    (typeof column.editable === "function"
      ? column.editable(row)
      : column.editable) !== false
  )
}

export function getSelectedCellColSpan({
  rows,
  topSummaryRows,
  bottomSummaryRows,
  rowIdx,
  lastFrozenColumnIndex,
  column,
  isGroupRow
}) {
  const topSummaryRowsCount = topSummaryRows?.length ?? 0
  const minRowIdx = -1 - topSummaryRowsCount
  if (rowIdx === minRowIdx) {
    return getColSpan(column, lastFrozenColumnIndex, { type: "HEADER" })
  }

  if (
    topSummaryRows &&
    rowIdx > minRowIdx &&
    rowIdx <= topSummaryRowsCount + minRowIdx
  ) {
    return getColSpan(column, lastFrozenColumnIndex, {
      type: "SUMMARY",
      row: topSummaryRows[rowIdx + topSummaryRowsCount]
    })
  }

  if (rowIdx >= 0 && rowIdx < rows.length) {
    const row = rows[rowIdx]
    if (!isGroupRow(row)) {
      return getColSpan(column, lastFrozenColumnIndex, { type: "ROW", row })
    }
    return undefined
  }

  if (bottomSummaryRows) {
    return getColSpan(column, lastFrozenColumnIndex, {
      type: "SUMMARY",
      row: bottomSummaryRows[rowIdx - rows.length]
    })
  }

  return undefined
}

export function getNextSelectedCellPosition({
  cellNavigationMode,
  columns,
  colSpanColumns,
  rows,
  topSummaryRows,
  bottomSummaryRows,
  minRowIdx,
  maxRowIdx,
  currentPosition: { idx: currentIdx },
  nextPosition,
  lastFrozenColumnIndex,
  isCellWithinBounds,
  isGroupRow
}) {
  let { idx: nextIdx, rowIdx: nextRowIdx } = nextPosition

  const setColSpan = moveRight => {
    if (nextRowIdx >= 0 && nextRowIdx < rows.length) {
      const row = rows[nextRowIdx]
      if (isGroupRow(row)) return
    }
    // If a cell within the colspan range is selected then move to the
    // previous or the next cell depending on the navigation direction
    for (const column of colSpanColumns) {
      const colIdx = column.idx
      if (colIdx > nextIdx) break
      const colSpan = getSelectedCellColSpan({
        rows,
        topSummaryRows,
        bottomSummaryRows,
        rowIdx: nextRowIdx,
        lastFrozenColumnIndex,
        column,
        isGroupRow
      })

      if (colSpan && nextIdx > colIdx && nextIdx < colSpan + colIdx) {
        nextIdx = colIdx + (moveRight ? colSpan : 0)
        break
      }
    }
  }

  if (isCellWithinBounds(nextPosition)) {
    setColSpan(nextIdx - currentIdx > 0)
  }

  if (cellNavigationMode !== "NONE") {
    const columnsCount = columns.length
    const isAfterLastColumn = nextIdx === columnsCount
    const isBeforeFirstColumn = nextIdx === -1

    if (isAfterLastColumn) {
      if (cellNavigationMode === "CHANGE_ROW") {
        const isLastRow = nextRowIdx === maxRowIdx
        if (!isLastRow) {
          nextIdx = 0
          nextRowIdx += 1
        }
      } else {
        nextIdx = 0
      }
    } else if (isBeforeFirstColumn) {
      if (cellNavigationMode === "CHANGE_ROW") {
        const isFirstRow = nextRowIdx === minRowIdx
        if (!isFirstRow) {
          nextRowIdx -= 1
          nextIdx = columnsCount - 1
        }
      } else {
        nextIdx = columnsCount - 1
      }
      setColSpan(false)
    }
  }

  return { idx: nextIdx, rowIdx: nextRowIdx }
}

export function canExitGrid({
  cellNavigationMode,
  maxColIdx,
  minRowIdx,
  maxRowIdx,
  selectedPosition: { rowIdx, idx },
  shiftKey
}) {
  // When the cellNavigationMode is 'none' or 'changeRow', you can exit the grid if you're at the first or last cell of the grid
  // When the cellNavigationMode is 'loopOverRow', there is no logical exit point so you can't exit the grid
  if (cellNavigationMode === "NONE" || cellNavigationMode === "CHANGE_ROW") {
    const atLastCellInRow = idx === maxColIdx
    const atFirstCellInRow = idx === 0
    const atLastRow = rowIdx === maxRowIdx
    const atFirstRow = rowIdx === minRowIdx

    return shiftKey
      ? atFirstCellInRow && atFirstRow
      : atLastCellInRow && atLastRow
  }

  return false
}
