import React from "react";
import { css } from "@linaria/core";

import { useFocusRef } from "./hooks";
import { useDefaultComponents } from "./DataGridDefaultComponentsProvider";

const headerSortCell = css`
  @layer rdg.SortableHeaderCell {
    cursor: pointer;
    display: flex;

    &:focus {
      outline: none;
    }
  }
`;

const headerSortCellClassname = `rdg-header-sort-cell ${headerSortCell}`;

const headerSortName = css`
  @layer rdg.SortableHeaderCellName {
    flex-grow: 1;
    overflow: hidden;
    overflow: clip;
    text-overflow: ellipsis;
  }
`;

const headerSortNameClassname = `rdg-header-sort-name ${headerSortName}`;

export default function headerRenderer({
  column,
  cellHeight,
  sortDirection,
  selectCell,
  priority,
  onSort,
  isCellSelected,
  style,
  className,
  ChildColumnSetup,
}) {
  if (!column.sortable) {
    if (column.haveChildren === true) {
      return (
        <div>
          <div
            style={{
              borderBlockEnd: "1px solid var(--rdg-border-color)",
              height: "24px",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "inherit",
                justifyContent: "center",
              }}>
              {column.name}XXX
            </div>
          </div>

          <div
            style={{
              display: "flex",

              // gridTemplateColumns:"1fr 1fr 1fr",
              boxSizing: "border-box",
            }}>
            {column.children.map((info, index) => {
              var ddd;

              if (index === column.children.length - 1) {
                ddd = "none";
              } else {
                ddd = "1px solid var(--rdg-border-color)";
              }
              return (
                <div
                  style={{
                    margin: "",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderInlineEnd: ddd,
                  }}>
                  {RecursiveScan(
                    column.children,
                    info,
                    cellHeight,
                    index,
                    column,
                    selectCell,
                    style,
                    className,
                    ChildColumnSetup
                  )}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      function onClick() {
        selectCell(column.index);
      }
      function onDoubleClick(event) {
        const { right, left } = event.currentTarget.getBoundingClientRect();
        const offset = isRtl ? event.clientX - left : right - event.clientX;

        if (offset > 11) {
          // +1px to account for the border size
          return;
        }

        onColumnResize(column, "max-content");
      }

      function handleFocus(event) {
        onFocus?.(event);
        if (shouldFocusGrid) {
          // Select the first header cell if there is no selected cell
          selectCell(0);
        }
      }
      return (
        <div style={{ height: `${cellHeight}px`, width: "100%" }}>
          {/* rome-ignore lint/a11y/useKeyWithClickEvents: <explanation> */}
          <div
            onFocus={handleFocus}
            onClick={onClick}
            onDoubleClick={column.resizable ? onDoubleClick : undefined}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "inherit",
            }}>
            {column.name} s
          </div>
        </div>
      );
    }
  }

  // if (!column.sortable) return <>{column.subcolumn?column.subcolumn[0].name:""}</>

  return (
    <SortableHeaderCell
      onSort={onSort}
      sortDirection={sortDirection}
      priority={priority}
      isCellSelected={isCellSelected}>
      {column.name}
    </SortableHeaderCell>
  );
}
var columnsList = [];
//console.log("columnsList", columnsList);
const RecursiveScan = (
  masterData,
  subData,
  cellHeight,
  index,
  column,
  selectCell,
  style,
  className,
  ChildColumnSetup
) => {
  var cellHeight = cellHeight - 24;
  // console.log("subData", subData, ChildColumnSetup);

  ChildColumnSetup(subData);

  if (subData.haveChildren === true) {
    return (
      <div style={{ textAlign: "center" }}>
        {
          <div
            style={{
              borderBlockEnd: "1px solid var(--rdg-border-color)",
              height: "24px",
            }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "inherit",
                justifyContent: "center",
              }}>
              {subData.name}ss
            </div>
          </div>
        }
        <div
          style={{
            display: "flex",
            boxSizing: "border-box",
          }}>
          {subData.children.map((subInfo, index) => {
            var ddd;
            if (index === subData.children.length - 1) {
              ddd = "none";
            } else {
              ddd = "1px solid var(--rdg-border-color)";
            }
            return (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderInlineEnd: ddd,
                }}>
                {RecursiveScan(
                  subData.children,
                  subInfo,
                  cellHeight,
                  index,
                  column,
                  selectCell,
                  style,
                  className,
                  ChildColumnSetup
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    columnsList.includes(subData.name) ? null : columnsList.push(subData.name);
    function onClick() {
      selectCell(subData.idx);
    }
    function onDoubleClick(event) {
      const { right, left } = event.currentTarget.getBoundingClientRect();
      const offset = isRtl ? event.clientX - left : right - event.clientX;

      if (offset > 11) {
        // +1px to account for the border size
        return;
      }

      onColumnResize(subData, "max-content");
    }

    function handleFocus(event) {
      onFocus?.(event);
      if (shouldFocusGrid) {
        // Select the first header cell if there is no selected cell
        selectCell(0);
      }
    }

    return (
      <div
        role="columnheader"
        aria-colindex={`${column.index + 1}.${
          columnsList.indexOf(subData.name) + 1
        }`}
        // aria-selected={isCellSelected}
        // aria-sort={ariaSort}
        // aria-colspan={colSpan}
        // set the tabIndex to 0 when there is no selected cell so grid can receive focus
        // tabIndex={shouldFocusGrid ? 0 : tabIndex}
        className={className}
        style={{
          ...style,
          color: "red",
          width: subData.width - 0.727,
          height: `${cellHeight}px`,
        }}
        onFocus={handleFocus}
        onClick={onClick}
        // onDoubleClick={column.resizable ? onDoubleClick : undefined}
        onPointerDown={column.resizable ? onPointerDown : undefined}>
        <div
          onFocus={handleFocus}
          onClick={onClick}
          onDoubleClick={subData.resizable ? onDoubleClick : undefined}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "inherit",
            width: "100%",
          }}>
          {subData.name}ssss
        </div>
      </div>
    );
  }
};

function SortableHeaderCell({
  onSort,
  sortDirection,
  priority,
  children,
  isCellSelected,
}) {
  const sortStatus = useDefaultComponents().sortStatus;
  const { ref, tabIndex } = useFocusRef(isCellSelected);

  function handleKeyDown(event) {
    if (event.key === " " || event.key === "Enter") {
      // stop propagation to prevent scrolling
      event.preventDefault();
      onSort(event.ctrlKey || event.metaKey);
    }
  }

  function handleClick(event) {
    onSort(event.ctrlKey || event.metaKey);
  }

  return (
    <span
      ref={ref}
      tabIndex={tabIndex}
      className={headerSortCellClassname}
      onClick={handleClick}
      onKeyDown={handleKeyDown}>
      <span className={headerSortNameClassname}>{children}</span>
      <span>{sortStatus({ sortDirection, priority })}</span>
    </span>
  );
}
