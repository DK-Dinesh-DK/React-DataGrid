import React from 'react';
import { useMemo } from "react"
import { floor, max, min } from "../utils"

// TODO: https://github.com/microsoft/TypeScript/issues/41808
function isReadonlyArray(arr) {
  return Array.isArray(arr)
}

export function useViewportRows({
  rawRows,
  rowHeight,
  clientHeight,
  scrollTop,
  groupBy,
  rowGrouper,
  expandedGroupIds,
  enableVirtualization
}) {
  const [groupedRows, rowsCount] = useMemo(() => {
    if (groupBy.length === 0 || rowGrouper == null)
      return [undefined, rawRows.length]

    const groupRows = (
      rows,
      [groupByKey, ...remainingGroupByKeys],
      startRowIndex
    ) => {
      let groupRowsCount = 0
      const groups = {}
      for (const [key, childRows] of Object.entries(
        rowGrouper(rows, groupByKey)
      )) {
        // Recursively group each parent group
        const [childGroups, childRowsCount] =
          remainingGroupByKeys.length === 0
            ? [childRows, childRows.length]
            : groupRows(
                childRows,
                remainingGroupByKeys,
                startRowIndex + groupRowsCount + 1
              ) // 1 for parent row
        groups[key] = {
          childRows,
          childGroups,
          startRowIndex: startRowIndex + groupRowsCount
        }
        groupRowsCount += childRowsCount + 1 // 1 for parent row
      }

      return [groups, groupRowsCount]
    }

    return groupRows(rawRows, groupBy, 0)
  }, [groupBy, rowGrouper, rawRows])

  const [rows, isGroupRow] = useMemo(() => {
    const allGroupRows = new Set()
    if (!groupedRows) return [rawRows, isGroupRow]

    const flattenedRows = []
    const expandGroup = (rows, parentId, level) => {
      if (isReadonlyArray(rows)) {
        flattenedRows.push(...rows)
        return
      }
      Object.keys(rows).forEach((groupKey, posInSet, keys) => {
        // TODO: should users have control over the generated key?
        const id =
          parentId !== undefined ? `${parentId}__${groupKey}` : groupKey
        const isExpanded = expandedGroupIds?.has(id) ?? false
        const { childRows, childGroups, startRowIndex } = rows[groupKey]

        const groupRow = {
          id,
          parentId,
          groupKey,
          isExpanded,
          childRows,
          level,
          posInSet,
          startRowIndex,
          setSize: keys.length
        }
        flattenedRows.push(groupRow)
        allGroupRows.add(groupRow)

        if (isExpanded) {
          expandGroup(childGroups, id, level + 1)
        }
      })
    }

    expandGroup(groupedRows, undefined, 0)
    return [flattenedRows, isGroupRow]

    function isGroupRow(row) {
      return allGroupRows.has(row)
    }
  }, [expandedGroupIds, groupedRows, rawRows])

  const {
    totalRowHeight,
    gridTemplateRows,
    getRowTop,
    getRowHeight,
    findRowIdx
  } = useMemo(() => {
    if (typeof rowHeight === "number") {
      return {
        totalRowHeight: rowHeight * rows.length,
        gridTemplateRows: ` repeat(${rows.length}, ${rowHeight}px)`,
        getRowTop: rowIdx => rowIdx * rowHeight,
        getRowHeight: () => rowHeight,
        findRowIdx: offset => floor(offset / rowHeight)
      }
    }

    let totalRowHeight = 0
    let gridTemplateRows = " "
    // Calcule the height of all the rows upfront. This can cause performance issues
    // and we can consider using a similar approach as react-window
    // https://github.com/bvaughn/react-window/blob/b0a470cc264e9100afcaa1b78ed59d88f7914ad4/src/VariableSizeList.js#L68
    const rowPositions = rows.map(row => {
      const currentRowHeight = isGroupRow(row)
        ? rowHeight({ type: "GROUP", row })
        : rowHeight({ type: "ROW", row })
      const position = { top: totalRowHeight, height: currentRowHeight }
      gridTemplateRows += `${currentRowHeight}px `
      totalRowHeight += currentRowHeight
      return position
    })

    const validateRowIdx = rowIdx => {
      return max(0, min(rows.length - 1, rowIdx))
    }

    return {
      totalRowHeight,
      gridTemplateRows,
      getRowTop: rowIdx => rowPositions[validateRowIdx(rowIdx)].top,
      getRowHeight: rowIdx => rowPositions[validateRowIdx(rowIdx)].height,
      findRowIdx(offset) {
        let start = 0
        let end = rowPositions.length - 1
        while (start <= end) {
          const middle = start + floor((end - start) / 2)
          const currentOffset = rowPositions[middle].top

          if (currentOffset === offset) return middle

          if (currentOffset < offset) {
            start = middle + 1
          } else if (currentOffset > offset) {
            end = middle - 1
          }

          if (start > end) return end
        }
        return 0
      }
    }
  }, [isGroupRow, rowHeight, rows])

  let rowOverscanStartIdx = 0
  let rowOverscanEndIdx = rows.length - 1

  if (enableVirtualization) {
    const overscanThreshold = 4
    const rowVisibleStartIdx = findRowIdx(scrollTop)
    const rowVisibleEndIdx = findRowIdx(scrollTop + clientHeight)
    rowOverscanStartIdx = max(0, rowVisibleStartIdx - overscanThreshold)
    rowOverscanEndIdx = min(
      rows.length - 1,
      rowVisibleEndIdx + overscanThreshold
    )
  }

  return {
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    rowsCount,
    totalRowHeight,
    gridTemplateRows,
    isGroupRow,
    getRowTop,
    getRowHeight,
    findRowIdx
  }
}
