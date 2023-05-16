import React from "react";
import { memo } from "react";
import { css } from "@linaria/core";

import { getCellStyle, getCellClassname, isCellEditable } from "./utils";
import { useRovingCellRef } from "./hooks";
import { useDrag, useDrop } from "react-dnd";
import moment from "moment";
import {
  bottomRowIsSelectedClassName,
  rowIsSelectedClassName,
  topRowIsSelectedClassName,
} from "./style";
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
  isRowSelected,
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
  totalColumns,
  ...props
}) {
  const { ref, tabIndex, onFocus } = useRovingCellRef(isCellSelected);

  const { cellClass } = column;
  const topRow = rowIndex === 0 && isRowSelected ? true : false;
  const bottomRow =
    rowIndex === allrow.length - 1 && isRowSelected ? true : false;
  const middleRow = !(topRow || bottomRow) && isRowSelected ? true : false;
  const className = getCellClassname(
    column,
    `rdg-cell-column-${column.idx % 2 === 0 ? "even" : "odd"}`,
    {
      [cellCopiedClassname]: isCopied,
      [cellDraggedOverClassname]: isDraggedOver,
      [rowIsSelectedClassName]: middleRow,
      [topRowIsSelectedClassName]: topRow,
      [bottomRowIsSelectedClassName]: bottomRow,
    },
    typeof cellClass === "function" ? cellClass(row) : cellClass
  );

  function selectCellWrapper(openEditor) {
    selectCell(row, column, openEditor);
  }

  function handleClick(e) {
    selectCellWrapper(column.editorOptions?.editOnClick);
    onRowClick?.({
      api: api,
      data: row,
      node: node,
      rowIndex: rowIndex,
      type: "rowClicked",
      event: e,
    });
  }

  function handleContextMenu() {
    selectCellWrapper();
  }

  function handleDoubleClick(e) {
    selectCellWrapper(true);
    onRowDoubleClick?.({
      api: api,
      data: row,
      node: node,
      rowIndex: rowIndex,
      type: "rowDoubleClicked",
      event: e,
    });
  }

  function handleRowChange(newRow) {
    onRowChange(column, newRow);
  }

  // -----------

  var style = getCellStyle(column, colSpan);
  style =
    column.idx === 0 && isRowSelected
      ? { ...style, ...{ borderInlineStart: "1px solid #9bbb59" } }
      : { ...style };
  style =
    column.idx === totalColumns - 1 && isRowSelected
      ? { ...style, ...{ borderInlineEnd: "1px solid #9bbb59" } }
      : { ...style };
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
        column.alignment.type?.toLowerCase() === "date" ||
        moment(row[column.key], "YYYY-MM-DD", true).isValid() ||
        moment(row[column.key], "YYYY/MM/DD", true).isValid() ||
        moment(row[column.key], "YYYY-DD-MM", true).isValid() ||
        moment(row[column.key], "YYYY/DD/MM", true).isValid() ||
        moment(row[column.key], "MM-DD-YYYY", true).isValid() ||
        moment(row[column.key], "MM/DD/YYYY", true).isValid() ||
        moment(row[column.key], "MM-YYYY-DD", true).isValid() ||
        moment(row[column.key], "MM/YYYY/DD", true).isValid() ||
        moment(row[column.key], "DD-MM-YYYY", true).isValid() ||
        moment(row[column.key], "DD/MM/YYYY", true).isValid() ||
        moment(row[column.key], "DD-YYYY-MM", true).isValid() ||
        moment(row[column.key], "DD/YYYY/MM", true).isValid() ||
        moment(row[column.key], "DD-MMM-YYYY", true).isValid() ||
        moment(row[column.key], "DD/MMM/YYYY", true).isValid() ||
        moment(row[column.key], "DD-YYYY-MMM", true).isValid() ||
        moment(row[column.key], "DD/YYYY/MMM", true).isValid() ||
        moment(row[column.key], "MMM-DD-YYYY", true).isValid() ||
        moment(row[column.key], "MMM/DD/YYYY", true).isValid() ||
        moment(row[column.key], "MMM-YYYY-DD", true).isValid() ||
        moment(row[column.key], "MMM/YYYY/DD", true).isValid() ||
        moment(row[column.key], "YYYY-MMM-DD", true).isValid() ||
        moment(row[column.key], "YYYY/MMM/DD", true).isValid() ||
        moment(row[column.key], "YYYY-DD-MMM", true).isValid() ||
        moment(row[column.key], "YYYY/DD/MMM", true).isValid() ||
        JSON.stringify(row[column.key]).split("/").length === 3 ||
        JSON.stringify(row[column.key]).split("-").length === 3
      ) {
        const alignmentStyle = column.alignment.align
          ? { textAlign: column.alignment.align }
          : {
              textAlign: "end",
              paddingRight: "6px",
              paddingLeft: "6px",
            };
        styles = {
          ...styles,
          ...alignmentStyle,
        };
        return styles;
      } else if (
        column.alignment.type?.toLowerCase() === "time" ||
        moment(row[column.key], "hh:mm", true).isValid() ||
        moment(row[column.key], "hh:mm:ss", true).isValid() ||
        moment(row[column.key], "hh:mm:ss a", true).isValid() ||
        moment(row[column.key], "hh:mm a", true).isValid() ||
        JSON.stringify(row[column.key]).split(":").length > 1
      ) {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "end", paddingRight: "6px", paddingLeft: "6px" };
        styles = {
          ...styles,
          ...alignment,
        };
        return styles;
      } else if (
        column.alignment.type?.toLowerCase() === "datetime" ||
        (JSON.stringify(row[column.key]).split(":").length > 1 &&
          (JSON.stringify(row[column.key]).split("/").length === 3 ||
            JSON.stringify(row[column.key]).split("-").length === 3))
      ) {
        const alignment = column.alignment.align
          ? {
              textAlign: column.alignment.align,
              paddingRight: "6px",
              paddingLeft: "6px",
            }
          : { textAlign: "end", paddingRight: "6px", paddingLeft: "6px" };
        styles = {
          ...styles,
          ...alignment,
        };
      } else if (
        column.alignment.type?.toLowerCase() === "number" ||
        (typeof row[column.key] === "number" &&
          column.alignment.type !== "currency")
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
        column.alignment.type?.toLowerCase() === "currency" ||
        symbol.includes(JSON.stringify(row[column.key])[1]) ||
        symbol.includes(JSON.stringify(row[column.key])[row[column.key].length])
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
        column.alignment.type?.toLowerCase() === "string" ||
        column.alignment.type?.toLowerCase() === "text" ||
        typeof row[column.ley] === "string"
      ) {
        const alignment = column.alignment.align
          ? { textAlign: column.alignment.align }
          : { textAlign: "start" };
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

  if (props.valueChangedCellStyle) {
    if (props.previousData[rowIndex]?.includes(column.key)) {
      style = {
        ...style,
        backgroundColor:
          props.valueChangedCellStyle.backgroundColor ?? style.backgroundColor,
        color: props.valueChangedCellStyle.color ?? style.color,
      };
    }
  }
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
  var renderObject = {
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
    style
  };
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
      title={row[column.key]?.toString()}
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
              {column.cellRenderer(renderObject)}
            </div>
          )}
          {!column.rowDrag && column.cellRenderer(renderObject)}
          {dragHandle}
        </>
      )}
    </div>
  );
}

export default memo(Cell);
