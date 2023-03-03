import React from 'react';
import { css } from "@linaria/core"
import { useFocusRef } from "../../hooks/useFocusRef"

const childRowActionCrossClassname = css`
  &::before,
  &::after {
    content: "";
    position: absolute;
    background: grey;
  }

  &::before {
    inset-inline-start: 21px;
    inline-size: 1px;
    block-size: 100%;
  }

  &::after {
    inset-block-start: 50%;
    inset-inline-start: 20px;
    block-size: 1px;
    inline-size: 15px;
  }

  &:hover {
    background: red;
  }
`

const childRowButtonClassname = css`
  cursor: pointer;
  position: absolute;
  inset-inline-start: 21px;
  transform: translateX(-50%);
  filter: grayscale(1);
  &:dir(rtl) {
    transform: translateX(50%);
  }
`

export function ChildRowDeleteButton({
  isCellSelected,
  onDeleteSubRow,
  isDeleteSubRowEnabled
}) {
  const { ref, tabIndex } = useFocusRef(isCellSelected)

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault()
      onDeleteSubRow()
    }
  }

  return (
    <>
      <div className={childRowActionCrossClassname} />
      {isDeleteSubRowEnabled && (
        // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div className={childRowButtonClassname} 
        onClick={onDeleteSubRow}>
          <span ref={ref} tabIndex={tabIndex} onKeyDown={handleKeyDown}>
            ❌
          </span>
        </div>
      )}
    </>
  )
}
