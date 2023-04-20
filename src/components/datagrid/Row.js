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
    indexR,
    styleR,
    rowIdx,
    gridTemplateColumns,
    rowArray,
    gridRowStart,
    height,
    selectedCellIdx,
    isRowSelected,
    copiedCellIdx,
    draggedOverCellIdx,
    lastFrozenColumnIndex,
    api,
    row,
    selectedCellRowStyle,
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
    totalColumns,
    subColumn,
    handleReorderRow,
    onCellClick,
    onCellDoubleClick,
    onCellContextMenu,
    columnApi,
    valueChangedCellStyle,
    previousData,
    ...props
  },
  ref
) {
  //console.log("selectedCellEditor",selectedCellEditor)
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
      [rowSelectedClassname]: isRowSelected,
    },
    rowClass?.(row),
    className
  );

  const cells = [];

  var selectedCellRowIndex;
  // console.log("vvvvv",rowArray)

  for (let index = 0; index < viewportColumns.length; index++) {
    const column = { ...viewportColumns[index], rowIndex: rowIdx };
    const { idx } = column;
    const colSpan = getColSpan(column, lastFrozenColumnIndex, {
      type: "ROW",
      row,
    });
    if (colSpan !== undefined) {
      index += colSpan - 1;
    }
    const isCellSelected = selectedCellIdx === idx;
    //console.log("isWEE",selectedCellIdx,idx)
    if (isCellSelected) {
      selectedCellRowIndex = rowIdx;
    }
    // if (isCellSelected && selectedCellEditor) {
    //   cells.push(selectedCellEditor);
    // } else {
    cells.push(
      <Cell
        key={`${column.key}`}
        selectedCellIdx={selectedCellIdx}
        selectedCellEditor={selectedCellEditor}
        column={column}
        colSpan={colSpan}
        api={api}
        viewportColumns={viewportColumns}
        rowArray={rowArray}
        row={row}
        handleReorderRow={handleReorderRow}
        isRowSelected={isRowSelected}
        allrow={rows}
        rowIndex={rowIdx}
        totalColumns={totalColumns}
        node={node}
        isCopied={copiedCellIdx === idx}
        isDraggedOver={draggedOverCellIdx === idx}
        isCellSelected={isCellSelected}
        dragHandle={isCellSelected ? selectedCellDragHandle : undefined}
        onRowClick={onRowClick}
        onRowDoubleClick={onRowDoubleClick}
        onRowChange={handleRowChange}
        selectCell={selectCell}
        subColumn={subColumn}
        onCellClick={onCellClick}
        onCellDoubleClick={onCellDoubleClick}
        onCellContextMenu={onCellContextMenu}
        columnApi={columnApi}
        valueChangedCellStyle={valueChangedCellStyle}
        previousData={previousData}
      />
    );
  }
  // }
  var style = getRowStyle(gridRowStart, height);
  if (rowIdx === selectedCellRowIndex) {
    style = { ...style, ...selectedCellRowStyle };
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <RowSelectionProvider value={isRowSelected}>
        <div
          role="row"
          ref={ref}
          id={row?.id ?? rowIdx}
          className={className}
          onMouseEnter={handleDragEnter}
          style={style}
          {...props}>
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
