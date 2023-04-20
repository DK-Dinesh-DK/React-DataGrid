import React, { useEffect, useRef } from "react";
import { css } from "@linaria/core";
import { useDrag, useDrop } from "react-dnd";
import { useLatestFunc } from "./hooks/useLatestFunc";
import { getCellStyle, getCellClassname, onEditorNavigation } from "./utils";

/*
 * To check for outside `mousedown` events, we listen to all `mousedown` events at their birth,
 * i.e. on the window during the capture phase, and at their death, i.e. on the window during the bubble phase.
 *
 * We schedule a check at the birth of the event, cancel the check when the event reaches the "inside" container,
 * and trigger the "outside" callback when the event bubbles back up to the window.
 *
 * The event can be `stopPropagation()`ed halfway through, so they may not always bubble back up to the window,
 * so an alternative check must be used. The check must happen after the event can reach the "inside" container,
 * and not before it run to completion. `requestAnimationFrame` is the best way we know how to achieve this.
 * Usually we want click event handlers from parent components to access the latest commited values,
 * so `mousedown` is used instead of `click`.
 *
 * We must also rely on React's event capturing/bubbling to handle elements rendered in a portal.
 */

const cellEditing = css`
  @layer rdg.EditCell {
    padding: 0;
  }
`;

export default function EditCell({
  column,
  colSpan,
  row,
  allrow,
  rowIndex,
  onRowChange,
  api,
  node,
  closeEditor,
  handleReorderRow,
}) {
  // console.log("editcell",column)
  const frameRequestRef = useRef();
  const commitOnOutsideClick =
    column.editorOptions?.commitOnOutsideClick !== false;

  // We need to prevent the `useEffect` from cleaning up between re-renders,
  // as `onWindowCaptureMouseDown` might otherwise miss valid mousedown events.
  // To that end we instead access the latest props via useLatestFunc.
  const commitOnOutsideMouseDown = useLatestFunc(() => {
    onClose(true);
  });

  useEffect(() => {
    if (!commitOnOutsideClick) return;

    function onWindowCaptureMouseDown() {
      frameRequestRef.current = requestAnimationFrame(commitOnOutsideMouseDown);
    }

    // eslint-disable-next-line no-restricted-globals
    addEventListener("mousedown", onWindowCaptureMouseDown, { capture: true });

    return () => {
      // eslint-disable-next-line no-restricted-globals
      removeEventListener("mousedown", onWindowCaptureMouseDown, {
        capture: true,
      });
      cancelFrameRequest();
    };
  }, [commitOnOutsideClick, commitOnOutsideMouseDown]);

  function cancelFrameRequest() {
    cancelAnimationFrame(frameRequestRef.current);
  }

  function onKeyDown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      // Discard changes
      onClose();
    } else if (event.key === "Enter") {
      event.stopPropagation();
      onClose(true);
    } else {
      const onNavigation =
        column.editorOptions?.onNavigation ?? onEditorNavigation;
      if (!onNavigation(event)) {
        event.stopPropagation();
      }
    }
  }

  function onClose(commitChanges) {
    if (commitChanges) {
      onRowChange(row, true);
    } else {
      closeEditor();
    }
  }

  const { cellClass } = column;
  const className = getCellClassname(
    column,
    "rdg-editor-container",
    !column.editorOptions?.renderFormatter && cellEditing,
    typeof cellClass === "function" ? cellClass(row) : cellClass
  );

  const [{ isDragging }, drag] = useDrag({
    type: "ROW_DRAG",
    item: { index: rowIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  function onRowReorder(fromIndex, toIndex) {
    const newRows = [...allrow];
    newRows.splice(toIndex, 0, newRows.splice(fromIndex, 1)[0]);
    handleReorderRow(newRows);
  }
  const [{ isOver }, drop] = useDrop({
    accept: "ROW_DRAG",
    drop({ index }) {
      onRowReorder(index, rowIndex);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  //console.log("columnse",column)
  return (
    <div
      role="gridcell"
      // aria-colindex is 1-based
      aria-colindex={column.idx + 1}
      aria-colspan={colSpan}
      aria-selected
      className={className}
      style={getCellStyle(column, colSpan)}
      onKeyDown={onKeyDown}
      onMouseDownCapture={
        commitOnOutsideClick ? cancelFrameRequest : undefined
      }>
      {column.rowDrag && (
        <div
          ref={(ele) => {
            drag(ele);
            drop(ele);
          }}>
          <span style={{ marginRight: "10px", cursor: "grab" }}>&#9674;</span>
          {(column.cellEditor != null || column.editable === true) && (
            <>
              {column.cellEditor({
                column,
                colDef: column,
                row,
                data: row,
                onRowChange,
                value: row[column.key],
                node,
                valueFormatted: column.valueFormatter,
                allrow,
                rowIndex,
                api,
                onClose,
              })}
              {column.editorOptions?.renderFormatter &&
                column.editable !== true &&
                column.formatter({
                  colDef: column,
                  column,
                  data: row,
                  row,
                  api,
                  node,
                  value: row[column.key],
                  valueFormatted: column.valueFormatter,
                  onRowChange,
                  isCellSelected: true,
                })}
              {column.editable &&
                column.formatter({
                  colDef: column,
                  column,
                  data: row,
                  row,
                  api,
                  node,
                  value: row[column.key],
                  valueFormatted: column.valueFormatter,
                  onRowChange,
                  isCellSelected: true,
                })}
            </>
          )}
        </div>
      )}
      {(column.cellEditor != null || column.editable === true) &&
        !column.rowDrag && (
          <>
            {column.cellEditor({
              column,
              colDef: column,
              row,
              data: row,
              onRowChange,
              value: row[column.key],
              node,
              valueFormatted: column.valueFormatter,
              allrow,
              rowIndex,
              api,
              onClose,
            })}
            {column.editorOptions?.renderFormatter &&
              column.editable !== true &&
              column.formatter({
                colDef: column,
                column,
                data: row,
                row,
                api,
                node,
                value: row[column.key],
                valueFormatted: column.valueFormatter,
                onRowChange,
                isCellSelected: true,
              })}
            {column.editable &&
              column.formatter({
                colDef: column,
                column,
                data: row,
                row,
                api,
                node,
                value: row[column.key],
                valueFormatted: column.valueFormatter,
                onRowChange,
                isCellSelected: true,
              })}
          </>
        )}
    </div>
  );
}
