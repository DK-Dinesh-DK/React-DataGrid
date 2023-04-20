import React, { memo } from "react";
import clsx from "clsx";
import { css } from "@linaria/core";

import HeaderCell from "./HeaderCell";
import { getColSpan, getRowStyle } from "./utils";
import { cell, cellFrozen } from "./style";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const headerRow = css`
  @layer rdg.HeaderRow {
    display: contents;
    line-height: var(--rdg-header-row-height);
    background-color: var(--rdg-header-background-color);
    font-weight: bold;
    color: var(--rdg-header-row-color);
    font-size: 11px;
    text-align: center;

    & > .${cell} {
      /* Should have a higher value than 0 to show up above regular cells */
      z-index: 1;
      position: sticky;
      inset-block-start: 0;
    }

    & > .${cellFrozen} {
      z-index: 2;
    }
  }
`;

const headerRowClassname = `rdg-header-row ${headerRow}`;

function HeaderRow({
  columns,
  rows,
  arrayDepth,
  headerheight,
  cellHeight,
  headerData,
  allRowsSelected,
  headerRowHeight,
  onAllRowsSelectionChange,
  onColumnResize,
  sortColumns,
  onSortColumnsChange,
  lastFrozenColumnIndex,
  selectedCellIdx,
  selectCell,
  selectedCellHeaderStyle,
  selectedPosition,
  shouldFocusGrid,
  direction,
  setFilters,
  setFilterType,
  handleReorderColumn,
  ...props
}) {
  // console.log("columnq",selectedCellIdx)
  const cells = [];
  function ChildColumnSetup(data) {
    props.ChildColumnSetup(data);
  }
  for (let index = 0; index < columns.length; index++) {
    const column = columns[index];

    const colSpan = getColSpan(column, lastFrozenColumnIndex, {
      type: "HEADER",
    });
    if (colSpan !== undefined) {
      index += colSpan - 1;
    }

    cells.push(
      <HeaderCell
        key={`${column.key}`}
        column={column}
        rows={rows}
        handleReorderColumn={handleReorderColumn}
        columns={columns}
        cellHeight={cellHeight}
        arrayDepth={arrayDepth}
        headerRowHeight={headerRowHeight}
        cellData={headerData}
        colSpan={colSpan}
        selectedPosition={selectedPosition}
        selectedCellHeaderStyle={selectedCellHeaderStyle}
        isCellSelected={selectedCellIdx === column.idx}
        selectedCellIdx={selectedCellIdx}
        onColumnResize={onColumnResize}
        allRowsSelected={allRowsSelected}
        onAllRowsSelectionChange={onAllRowsSelectionChange}
        onSortColumnsChange={onSortColumnsChange}
        sortColumns={sortColumns}
        selectCell={selectCell}
        shouldFocusGrid={shouldFocusGrid && index === 0}
        direction={direction}
        setFilters={setFilters}
        setFilterType={setFilterType}
        ChildColumnSetup={ChildColumnSetup}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        role="row"
        // aria-rowindex is 1 based
        aria-rowindex={1}
        className={clsx(headerRowClassname, {
          // [rowSelectedClassname]: selectedCellIdx === -1,
        })}
        style={getRowStyle(1)}>
        {cells}
      </div>
    </DndProvider>
  );
}

export default memo(HeaderRow);
