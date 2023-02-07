import React from "react";
import { memo } from "react";
import { css } from "@linaria/core";

import { getCellStyle, getCellClassname, isCellEditable } from "./utils";
import { useRovingCellRef } from "./hooks";
import { useDrag, useDrop } from "react-dnd";
import moment from "moment";

const cellCopied = css`
  @layer rdg.Cell {
    background-color: #ccccff;
  }
`;

const cellCopiedClassname = `rdg-cell-copied ${cellCopied}`;

const cellDraggedOver = css`
  @layer rdg.Cell {
    background-color: #ccccff;

    &.${cellCopied} {
      background-color: #9999ff;
    }
  }
`;

const cellDraggedOverClassname = `rdg-cell-dragged-over ${cellDraggedOver}`;

function Cell({
  column,
  colSpan,
  isCellSelected,
  isCopied,
  api,
  isDraggedOver,
  row,
  rowIndex,
  allrow,
  dragHandle,
  onRowClick,
  onRowDoubleClick,
  onRowChange,
  selectCell,
  node,
  handleReorderRow,
  ...props
}) {
  const { ref, tabIndex, onFocus } = useRovingCellRef(isCellSelected);

  const { cellClass } = column;
  const className = getCellClassname(
    column,
    `rdg-cell-column-${column.idx % 2 === 0 ? "even" : "odd"}`,
    {
      [cellCopiedClassname]: isCopied,
      [cellDraggedOverClassname]: isDraggedOver,
    },
    typeof cellClass === "function" ? cellClass(row) : cellClass
  );

  function selectCellWrapper(openEditor) {
    selectCell(row, column, openEditor);
  }

  function handleClick() {
    selectCellWrapper(column.editorOptions?.editOnClick);
    onRowClick?.(row, column);
  }

  function handleContextMenu() {
    selectCellWrapper();
  }

  function handleDoubleClick() {
    selectCellWrapper(true);
    onRowDoubleClick?.(row, column);
  }

  function handleRowChange(newRow) {
    onRowChange(column, newRow);
  }

  // -----------
  var style = getCellStyle(column, colSpan);
  const rowSpan = column.rowSpan?.({ type: "ROW", row }) ?? undefined;

  if (column.validation) {
    const validationStyle = column.validation.style
      ? column.validation.style
      : { backgroundColor: "red" };
    column.validation.method(row[column.key])
      ? null
      : (style = {
          ...style,
          ...validationStyle,
        });
  }

  if (column.alignment) {
    function alignmentUtils() {
      var styles = style;
      var symbol = ["£", "$", "₹", "€", "¥", "₣", "¢"];

      if (
        moment(row[column.key], "YYYY-MM-DD", true).isValid() ||
        moment(row[column.key], "YYYY/MM/DD", true).isValid() ||
        moment(row[column.key], "YYYY-DD-MM", true).isValid() ||
        moment(row[column.key], "YYYY/DD/MM", true).isValid() ||
        moment(row[column.key], "MM-DD-YYYY", true).isValid() ||
        moment(row[column.key], "MM/DD-YYYY", true).isValid() ||
        moment(row[column.key], "DD-MM-YYYY", true).isValid() ||
        moment(row[column.key], "DD/MM/YYYY", true).isValid() ||
        moment(row[column.key], "DD-MMM-YYYY", true).isValid() ||
        moment(row[column.key], "DD/MMM/YYYY", true).isValid() ||
        moment(row[column.key], "MMM-DD-YYYY", true).isValid() ||
        moment(row[column.key], "MMM/DD/YYYY", true).isValid() ||
        moment(row[column.key], "YYYY-MMM-DD", true).isValid() ||
        moment(row[column.key], "YYYY/MMM/DD", true).isValid() ||
        moment(row[column.key], "YYYY-DD-MMM", true).isValid() ||
        moment(row[column.key], "YYYY/DD/MMM", true).isValid() ||
        (column.alignment.type &&
          column.alignment.type.toLowerCase() === "date")
      ) {
        const alignmentStyle = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "left" };
        styles = {
          ...styles,
          ...alignmentStyle,
        };
        return styles;
      } else if (
        moment(row[column.key], "hh:mm", true).isValid() ||
        moment(row[column.key], "hh:mm:ss", true).isValid() ||
        moment(row[column.key], "hh:mm:ss a", true).isValid() ||
        (column.alignment.type &&
          column.alignment.type.toLowerCase() === "time")
      ) {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "left" };
        styles = {
          ...styles,
          ...alignment,
        };
        return styles;
      } else if (
        (typeof row[column.key] === "number" &&
          column.alignment.type !== "currency") ||
        (column.alignment.type &&
          column.alignment.type.toLowerCase() === "number")
      ) {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "end" };
        styles = {
          ...styles,
          ...alignment,
        };
        return styles;
      } else if (
        symbol.includes(JSON.stringify(row[column.key])[1]) ||
        symbol.includes(
          JSON.stringify(row[column.key])[row[column.key].length]
        ) ||
        (column.alignment.type &&
          column.alignment.type.toLowerCase() === "currency")
      ) {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "end" };
        styles = {
          ...styles,
          ...alignment,
        };
        return styles;
      } else if (
        (column.alignment.type &&
          column.alignment.type.toLowerCase() === "string") ||
        (column.alignment.type &&
          column.alignment.type.toLowerCase() === "text") ||
        typeof row[column.ley] === "string"
      ) {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "left" };
        styles = {
          ...styles,
          ...alignment,
        };
        return styles;
      } else {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "center" };
        styles = { ...styles, ...alignment };
        return styles;
      }
    }

    style = column.alignment.align
      ? { ...style, textAlign: column.alignment.align }
      : alignmentUtils({ column, row, style });
  }
  /// -----------------------

  const [{ isDragging }, drag] = useDrag({
    type: "ROW_DRAG",
    item: { index: rowIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  function onRowReorder(fromIndex, toIndex) {
    console.log("fromIndex", fromIndex, "toIndex", toIndex);
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
  return (
    <div
      role="gridcell"
      // aria-colindex is 1-based
      aria-colindex={column.idx + 1}
      aria-selected={isCellSelected}
      aria-colspan={colSpan}
      aria-rowspan={rowSpan}
      aria-readonly={!isCellEditable(column, row) || undefined}
      ref={ref}
      tabIndex={tabIndex}
      className={className}
      style={style}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
      onFocus={onFocus}
      {...props}
    >
      {!column.rowGroup && (
        <>
          {column.rowDrag && (
            <div
              ref={(ele) => {
                drag(ele);
                drop(ele);
              }}
            >
              <span style={{ marginRight: "10px", cursor: "grab" }}>
                &#9674;
              </span>
              {column.formatter({
                column,
                colDef: column,
                row,
                data: row,
                onRowChange,
                allrow,
                api,
                node,
                rowIndex,
                value: row[column.key],
                isCellSelected,
                onRowChange: handleRowChange,
              })}
            </div>
          )}
          {!column.rowDrag && column.formatter({
            column,
            colDef: column,
            row,
            data: row,
            onRowChange,
            allrow,
            api,
            node,
            rowIndex,
            value: row[column.key],
            isCellSelected,
            onRowChange: handleRowChange,
          })}
          {dragHandle}
        </>
      )}
    </div>
  );
}

export default memo(Cell);
