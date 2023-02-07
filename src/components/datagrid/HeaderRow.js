import React from "react";
import { memo } from "react";
import clsx from "clsx";
import { css } from "@linaria/core";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import HeaderCell from "./HeaderCell";
import { getColSpan, getRowStyle } from "./utils";
import { cell, cellFrozen, rowSelectedClassname } from "./style";

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
  allRowsSelected,
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
  handleReorderColumn
}) {
  const cells = [];
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
        key={column.key}
        column={column}
        columns={columns}
        rows={rows}
        colSpan={colSpan}
        selectedPosition={selectedPosition}
        selectedCellHeaderStyle={selectedCellHeaderStyle}
        isCellSelected={selectedCellIdx === column.idx}
        onColumnResize={onColumnResize}
        allRowsSelected={allRowsSelected}
        onAllRowsSelectionChange={onAllRowsSelectionChange}
        onSortColumnsChange={onSortColumnsChange}
        sortColumns={sortColumns}
        selectCell={selectCell}
        shouldFocusGrid={shouldFocusGrid && index === 0}
        direction={direction}
        setFilters={setFilters}
        handleReorderColumn={handleReorderColumn}
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
          [rowSelectedClassname]: selectedCellIdx === -1,
        })}
        style={getRowStyle(1)}
      >
        {cells}
      </div>
    </DndProvider>
  );
}

export default memo(HeaderRow);
