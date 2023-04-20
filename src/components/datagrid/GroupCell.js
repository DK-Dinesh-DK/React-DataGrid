import React, {memo} from 'react';


import { getCellStyle, getCellClassname } from "./utils"
import { useRovingCellRef } from "./hooks/useRovingCellRef"

function GroupCell({
  id,
  groupKey,
  childRows,
  isExpanded,
  isCellSelected,
  column,
  row,
  groupColumnIndex,
  toggleGroup: toggleGroupWrapper
}) {
  const { ref, tabIndex, onFocus } = useRovingCellRef(isCellSelected)

  function toggleGroup() {
    toggleGroupWrapper(id)
  }

  // Only make the cell clickable if the group level matches
  const isLevelMatching = column.rowGroup && groupColumnIndex === column.idx

  return (
    // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
<div
      role="gridcell"
      aria-colindex={column.idx + 1}
      aria-selected={isCellSelected}
      ref={ref}
      tabIndex={tabIndex}
      key={column.key}
      className={getCellClassname(column)}
      style={{
        ...getCellStyle(column),
        cursor: isLevelMatching ? "pointer" : "default"
      }}
      onClick={isLevelMatching ? toggleGroup : undefined}
      onFocus={onFocus}
    >
      {(!column.rowGroup || groupColumnIndex === column.idx) &&
        column.groupFormatter?.({
          groupKey,
          childRows,
          column,
          row,
          isExpanded,
          isCellSelected,
          toggleGroup
        })}
    </div>
  )
}

export default memo(GroupCell)
