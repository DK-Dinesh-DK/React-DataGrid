import React, { memo, forwardRef } from "react";
import clsx from "clsx";

import Cell from "./Cell";
import { RowSelectionProvider, useLatestFunc } from "./hooks";
import { getColSpan, getRowStyle } from "./utils";
import { rowClassname, rowSelectedClassname } from "./style";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
function Row(
  {
    className,
    rowIdx,
    gridRowStart,
    height,
    selectedCellIdx,
    isRowSelected,
    copiedCellIdx,
    draggedOverCellIdx,
    lastFrozenColumnIndex,
    api,
    row,
    rows,
    node,
    viewportColumns,
    selectedCellEditor,
    selectedCellDragHandle,
    onRowClick,
    onRowDoubleClick,
    rowClass,
    setDraggedOverRowIdx,
    onMouseEnter,
    onRowChange,
    selectCell,
    handleReorderRow,
    selectedCellRowStyle,
    ...props
  },
  ref
) {
  const handleRowChange = useLatestFunc((column, newRow) => {
    onRowChange(column, rowIdx, newRow);
  });

  function handleDragEnter(event) {
    setDraggedOverRowIdx?.(rowIdx);
    onMouseEnter?.(event);
  }

  className = clsx(
    rowClassname,
    `rdg-row-${rowIdx % 2 === 0 ? "even" : "odd"}`,
    {
      [rowSelectedClassname]: selectedCellIdx === -1,
    },
    rowClass?.(row),
    className
  );

  const cells = [];
  var selectedCellRowIndex;
  for (let index = 0; index < viewportColumns.length; index++) {
    const column = viewportColumns[index];
    const { idx } = column;
    const colSpan = getColSpan(column, lastFrozenColumnIndex, {
      type: "ROW",
      row,
    });
    if (colSpan !== undefined) {
      index += colSpan - 1;
    }
    if (isCellSelected) {
      selectedCellRowIndex = rowIdx;
    }

    const isCellSelected = selectedCellIdx === idx;

    if (isCellSelected && selectedCellEditor) {
      cells.push(selectedCellEditor);
    } else {
      cells.push(
        <Cell
          key={column.key}
          column={column}
          colSpan={colSpan}
          api={api}
          row={row}
          allrow={rows}
          rowIndex={rowIdx}
          node={node}
          isCopied={copiedCellIdx === idx}
          isDraggedOver={draggedOverCellIdx === idx}
          isCellSelected={isCellSelected}
          dragHandle={isCellSelected ? selectedCellDragHandle : undefined}
          onRowClick={onRowClick}
          onRowDoubleClick={onRowDoubleClick}
          onRowChange={handleRowChange}
          selectCell={selectCell}
          handleReorderRow={handleReorderRow}
        />
      );
    }
  }
  var style = getRowStyle(gridRowStart, height);

  if (rowIdx == selectedCellRowIndex) {
    style = { ...style, ...selectedCellRowStyle };
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <RowSelectionProvider value={isRowSelected}>
        <div
          role="row"
          ref={ref}
          id={row.id ?? rowIdx}
          className={className}
          onMouseEnter={handleDragEnter}
          style={style}
          {...props}
        >
          {cells}
        </div>
      </RowSelectionProvider>
    </DndProvider>
  );
}

const RowComponent = memo(forwardRef(Row));

export default RowComponent;

export function defaultRowRenderer(key, props) {
  return <RowComponent key={key} {...props} />;
}
