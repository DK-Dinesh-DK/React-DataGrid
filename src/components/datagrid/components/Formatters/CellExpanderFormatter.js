import React from 'react';
import { css } from "@linaria/core"
import { useFocusRef } from "../../hooks/useFocusRef"

const cellExpandClassname = css`
  /* needed on chrome */
  float: right;
  float: inline-end;
  display: table;
  block-size: 100%;

  > span {
    display: table-cell;
    vertical-align: middle;
    cursor: pointer;
  }
`

export function CellExpanderFormatter({
  isCellSelected,
  expanded,
  onCellExpand
}) {
  const { ref, tabIndex } = useFocusRef(isCellSelected)

  function handleKeyDown(e) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault()
      onCellExpand()
    }
  }

  return (
    <div className={cellExpandClassname}>
      <span onClick={onCellExpand} onKeyDown={handleKeyDown}>
        <span ref={ref} tabIndex={tabIndex}>
          {expanded ? "\u25BC" : "\u25B6"}
        </span>
      </span>
    </div>
  )
}
