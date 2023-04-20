import React, { useEffect, useState } from "react";
import { css } from "@linaria/core";
// import {Input} from "lai_webui";

import { useRovingCellRef } from "./hooks";
import FilterRenderer from "./FilterRenderer";
import SortableHeaderCell from "./SortableHeaderCell";
import FilterIcon from "./records_filter.svg";
import { Popover, Typography } from "@mui/material";

var filterIcon = <FilterIcon />;

const filterClassname = css`
  display: flex;
  grid-gap: 10px;
  grid-template-columns: auto auto;
  padding: 4px;
  font-size: 18px;
  inline-size: 100%;
  cursor: pointer;
`;

const headerWrapperWithChild = css`
  border-block-end: 1px solid var(--rdg-border-color);
  height: ${24}px;
`;

const headerWrapperWithChildData = css`
  display: flex;
  align-items: center;
  height: inherit;
  justify-content: center;
  border-inline-end: 1px solid var(--rdg-border-color);
`;

const headerWrapperWithcellData = css`
  display: flex;
  box-sizing: border-box;
`;
export default function headerRenderer({
  column,
  rows,
  sortDirection,
  priority,
  selectCell,
  onSort,
  isCellSelected,
  shouldFocusGrid,
  setFilters,
  setFilterType,
  cellHeight,
  selectedPosition,
  selectedCellHeaderStyle,
  headerRowHeight,
  selectedCellIdx,
  arrayDepth,
  ChildColumnSetup,
}) {
  const { onFocus } = useRovingCellRef(isCellSelected);
  // console.log("cellHeight", cellHeight, headerRowHeight);
  // console.log("3456", selectedCellIdx);
  if (column.haveChildren === true) {
    return (
      <div>
        <div className={headerWrapperWithChild}>
          <div className={headerWrapperWithChildData}>{column.headerName}</div>
        </div>

        <div className={headerWrapperWithcellData}>
          {column.children !== undefined &&
            column.children.map((info, index) => {
              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",

                    justifyContent: "center",
                  }}>
                  {RecursiveScan(
                    column.children,
                    info,
                    cellHeight,
                    index,
                    headerRowHeight,
                    selectedPosition,
                    selectedCellHeaderStyle,
                    column,
                    selectCell,
                    shouldFocusGrid,
                    isCellSelected,
                    onSort,
                    sortDirection,
                    priority,
                    setFilters,
                    arrayDepth,
                    ChildColumnSetup,
                    selectedCellIdx,
                    filterIcon,
                    setFilterType
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  } else {
    ChildColumnSetup(column);
    var style = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "inherit",
      width: column.width,
    };
    selectedCellHeaderStyle && selectedPosition.idx === column.idx
      ? (style = { ...style, ...selectedCellHeaderStyle })
      : style;
    function onClick() {
      selectCell(column.idx);
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

    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    if (!column.sortable && !column.filter) {
      return (
        // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>

        <div
          key={column.idx}
          style={{
            height: `${cellHeight}px`,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
          onFocus={handleFocus}
          onClick={onClick}
          onDoubleClick={column.resizable ? onDoubleClick : undefined}
          // onPointerDown={column.resizable ? onPointerDown : undefined}
        >
          <div style={{ ...style }}>{column.headerName}</div>
        </div>
      );
    }
    if (column.sortable && !column.filter) {
      return (
        <div
          key={column.idx}
          style={{
            height: `${cellHeight}px`,
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
          onFocus={handleFocus}
          onClick={onClick}
          onDoubleClick={column.resizable ? onDoubleClick : undefined}>
          <div style={{ ...style }}>
            <SortableHeaderCell
              onSort={onSort}
              sortDirection={sortDirection}
              priority={priority}
              isCellSelected={isCellSelected}
              column={column}
              borderBottom={"none"}>
              {column.headerName}
            </SortableHeaderCell>
          </div>
        </div>
      );
    }
    if (column.filter && !column.sortable) {
      let style11 = {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      };
      selectedCellHeaderStyle && selectedPosition.idx === column.idx
        ? (style11 = { ...style11, ...selectedCellHeaderStyle })
        : style11;

      const [iValue, setIvalue] = useState("");

      const getFilterValue = (event) => {
        const value = event.target.value;
        setFilterType(value);
      };

      const getInputValue = (event, filters) => {
        event.preventDefault();
        const value = event.target.value;
        //console.log("Ivalie", value);
        setFilters({
          ...filters,
          [column.field]: value,
        });
      };

      return (
        <div style={{ ...style11 }} key={column.idx} onClick={onClick}>
          <FilterRenderer
            selectedCellHeaderStyle={selectedCellHeaderStyle}
            selectedPosition={selectedCellHeaderStyle}
            onFocus={handleFocus}
            onClick={onClick}
            column={column}
            onDoubleClick={column.resizable ? onDoubleClick : undefined}
            isCellSelected={isCellSelected}>
            {({ filters, ...rest }) => (
              <div className={filterClassname}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10px"
                  height="10px"
                  version="1.1"
                  // style="shapeRendering:geometricPrecision; textRendering:geometricPrecision; imageRendering:optimizeQuality; fillRule:evenodd; clipRule:evenodd"
                  viewBox="0 0 507 511.644"
                  onClick={handleClick}
                  fill="white">
                  <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer" />
                    <path
                      class="fil0"
                      d="M192.557 241.772c5.368,5.842 8.316,13.476 8.316,21.371l0 232.663c0,14.002 16.897,21.109 26.898,11.265l64.905 -74.378c8.684,-10.422 13.475,-15.581 13.475,-25.901l0 -143.597c0,-7.897 3.001,-15.529 8.318,-21.373l186.236 -202.081c13.947,-15.159 3.21,-39.741 -17.424,-39.741l-459.536 0c-14.188,0 -23.722,11.594 -23.745,23.784 -0.01,5.541 1.945,11.204 6.321,15.957l186.236 202.031 0 0z"
                    />
                  </g>
                </svg>

                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}>
                  <Typography sx={{ p: 2 }}>
                    <select style={{ width: "100%" }} onChange={getFilterValue}>
                      <option>Contain</option>
                      <option>Starts With...</option>
                      <option>Ends With...</option>
                      <option>Equals</option>
                      <option>Not Equals</option>
                    </select>

                    <div>
                      <input
                        {...rest}
                        value={filters?.[column.field]}
                        placeholder="Search..."
                        onChange={(e) => getInputValue(e, filters)}
                        onKeyDown={inputStopPropagation}
                      />
                      {
                        //console.log("babul", filters)
                      }
                    </div>
                  </Typography>
                </Popover>

                {/* {open && <FiltersDropdown options={options} setFilters={setFilters} filters={filters} column={column} />} */}
              </div>
            )}
          </FilterRenderer>
        </div>
      );
    }
    if (column.filter && column.sortable) {
      var styleSF = {
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      };
      selectedCellHeaderStyle && selectedPosition.idx === column.idx
        ? (styleSF = { ...styleSF, ...selectedCellHeaderStyle })
        : styleSF;

      const getFilterValue = (event) => {
        const value = event.target.value;
        setFilterType(value);
      };

      const getInputValue = (event, filters) => {
        const value = event.target.value;

        setFilters({
          ...filters,
          [column.field]: value,
        });
      };

      return (
        <div
          key={column.idx}
          onFocus={handleFocus}
          onClick={onClick}
          onDoubleClick={column.resizable ? onDoubleClick : undefined}
          style={{ ...styleSF }}>
          <SortableHeaderCell
            onSort={onSort}
            sortDirection={sortDirection}
            priority={priority}
            isCellSelected={isCellSelected}>
            {column.headerName}
          </SortableHeaderCell>
          <FilterRenderer column={column} isCellSelected={isCellSelected}>
            {({ filters, ...rest }) => (
              <div className={filterClassname}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10px"
                  height="10px"
                  version="1.1"
                  // style="shapeRendering:geometricPrecision; textRendering:geometricPrecision; imageRendering:optimizeQuality; fillRule:evenodd; clipRule:evenodd"
                  viewBox="0 0 507 511.644"
                  onClick={handleClick}
                  fill="white">
                  <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer" />
                    <path
                      class="fil0"
                      d="M192.557 241.772c5.368,5.842 8.316,13.476 8.316,21.371l0 232.663c0,14.002 16.897,21.109 26.898,11.265l64.905 -74.378c8.684,-10.422 13.475,-15.581 13.475,-25.901l0 -143.597c0,-7.897 3.001,-15.529 8.318,-21.373l186.236 -202.081c13.947,-15.159 3.21,-39.741 -17.424,-39.741l-459.536 0c-14.188,0 -23.722,11.594 -23.745,23.784 -0.01,5.541 1.945,11.204 6.321,15.957l186.236 202.031 0 0z"
                    />
                  </g>
                </svg>

                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}>
                  <Typography sx={{ p: 2 }}>
                    <select style={{ width: "100%" }} onChange={getFilterValue}>
                      <option>Contain</option>
                      <option>Starts With...</option>
                      <option>Ends With...</option>
                      <option>Equals</option>
                      <option>Not Equals</option>
                    </select>
                    <div>
                      <input
                        {...rest}
                        value={filters?.[column.field]}
                        placeholder="Search..."
                        onChange={(e) => getInputValue(e, filters)}
                        onKeyDown={inputStopPropagation}
                      />
                    </div>
                  </Typography>
                </Popover>

                {/* {open && <FiltersDropdown options={options} setFilters={setFilters} filters={filters} column={column} />} */}
              </div>
            )}
          </FilterRenderer>
        </div>
      );
    }
  }
}
// useMemo(() => expensiveCalculation(count), [count]);

var columnsList = [];

const RecursiveScan = (
  masterData,
  subData,
  cellHeight,
  index,
  headerRowHeight,
  selectedPosition,
  selectedCellHeaderStyle,
  column,
  selectCell,
  shouldFocusGrid,
  isCellSelected,
  onSort,
  sortDirection,
  priority,
  setFilters,
  arrayDepth,
  ChildColumnSetup,
  selectedCellIdx,
  filterIcon,
  setFilterType
) => {
  var cellHeight = cellHeight - headerRowHeight;
  // console.log("crty", headerRowHeight);
  ChildColumnSetup(subData);
  const { onFocus } = useRovingCellRef(isCellSelected);
  if (subData.haveChildren === true) {
    return (
      <div style={{ textAlign: "center" }}>
        {
          <div className={headerWrapperWithChild}>
            <div className={headerWrapperWithChildData}>
              {subData.headerName}
            </div>
          </div>
        }
        <div className={headerWrapperWithcellData}>
          {subData.children.map((subInfo, index) => {
            var style = {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxSizing: "border-box",
            };

            return (
              <div style={{ ...style }}>
                {RecursiveScan(
                  subData.children,
                  subInfo,
                  cellHeight,
                  index,
                  headerRowHeight,
                  selectedPosition,
                  selectedCellHeaderStyle,
                  column,
                  selectCell,
                  shouldFocusGrid,
                  isCellSelected,
                  onSort,
                  sortDirection,
                  priority,
                  setFilters,
                  arrayDepth,
                  ChildColumnSetup,
                  selectedCellIdx,
                  filterIcon,
                  setFilterType
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    columnsList.includes(subData.name) ? null : columnsList.push(subData.name);
    //console.log("H1", headerRowHeight + cellHeight);
    var style = {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      borderInlineEnd: "1px solid var(--rdg-border-color)",
      width: subData.width,
      boxSizing: "border-box",
      height: `${cellHeight}px`,
      outline:
        selectedCellIdx === subData.idx
          ? "1px solid var(--rdg-selection-color)"
          : "none",
      outlineOffset: selectedCellIdx === subData.idx ? "-1px" : "0px",
    };
    //console.log("subdata", subData);
    selectedCellHeaderStyle && selectedPosition.idx === subData.idx
      ? (style = { ...style, ...selectedCellHeaderStyle })
      : style;

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
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
      setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? "simple-popover" : undefined;

    if (!subData.sortable && !subData.filter)
      return (
        // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <>
          <div
            key={`${subData.idx}`}
            role="columnheader"
            aria-colindex={`${column.index + 1}.${
              columnsList.indexOf(subData.name) + 1
            }`}
            aria-selected={selectedCellIdx === subData.idx}
            style={{ ...style }}
            // onFocus={handleFocus}
            onClick={onClick}
            onDoubleClick={column.resizable ? onDoubleClick : undefined}
            // onPointerDown={column.resizable ? onPointerDown : undefined}
          >
            {subData.headerName}
          </div>
        </>
      );
    if (subData.sortable && !subData.filter)
      return (
        // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          key={subData.idx}
          style={{ ...style }}
          // onFocus={handleFocus}
          onClick={onClick}
          onDoubleClick={subData.resizable ? onDoubleClick : undefined}
          // onPointerDown={column.resizable ? onPointerDown : undefined}
        >
          <SortableHeaderCell
            onSort={onSort}
            selectedPositionIdx={selectedPosition.idx}
            subCellIdx={subData.idx}
            sortDirection={sortDirection}
            priority={priority}
            isCellSelected={isCellSelected}>
            {subData.headerName}
          </SortableHeaderCell>
        </div>
      );
    if (subData.filter && !subData.sortable) {
      var style1 = {
        display: "flex",
        justifyContent: "space-between",
        borderRight: "1px solid var(--rdg-border-color)",
        width: subData.width,
        alignItems: "center",
        height: `${cellHeight}px`,
        boxSizing: "border-box",
        outline:
          selectedCellIdx === subData.idx
            ? "1px solid var(--rdg-selection-color)"
            : "none",
        outlineOffset: selectedCellIdx === subData.idx ? "-1px" : "0px",
      };

      selectedCellHeaderStyle && selectedPosition.idx === subData.idx
        ? (style1 = { ...style1, ...selectedCellHeaderStyle })
        : style1;

      function onClickFilter() {
        selectCell(subData.idx);
      }

      const getFilterValue = (event) => {
        const value = event.target.value;
        setFilterType(value);
      };

      const getInputValue = (event, filters) => {
        const value = event.target.value;

        setFilters({
          ...filters,
          [subData.field]: value,
        });
      };

      return (
        <div
          key={subData.idx}
          onClick={onClickFilter}
          onDoubleClick={subData.resizable ? onDoubleClick : undefined}
          style={{ ...style1 }}>
          <FilterRenderer column={subData} isCellSelected={isCellSelected}>
            {({ filters, ...rest }) => (
              <div className={filterClassname}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10px"
                  height="10px"
                  version="1.1"
                  // style="shapeRendering:geometricPrecision; textRendering:geometricPrecision; imageRendering:optimizeQuality; fillRule:evenodd; clipRule:evenodd"
                  viewBox="0 0 507 511.644"
                  onClick={handleClick}
                  fill="white">
                  <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer" />
                    <path
                      class="fil0"
                      d="M192.557 241.772c5.368,5.842 8.316,13.476 8.316,21.371l0 232.663c0,14.002 16.897,21.109 26.898,11.265l64.905 -74.378c8.684,-10.422 13.475,-15.581 13.475,-25.901l0 -143.597c0,-7.897 3.001,-15.529 8.318,-21.373l186.236 -202.081c13.947,-15.159 3.21,-39.741 -17.424,-39.741l-459.536 0c-14.188,0 -23.722,11.594 -23.745,23.784 -0.01,5.541 1.945,11.204 6.321,15.957l186.236 202.031 0 0z"
                    />
                  </g>
                </svg>

                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}>
                  <Typography sx={{ p: 2 }}>
                    <select style={{ width: "100%" }} onChange={getFilterValue}>
                      <option>Contain</option>
                      <option>Starts With...</option>
                      <option>Ends With...</option>
                      <option>Equals</option>
                      <option>Not Equals</option>
                    </select>
                    <div>
                      <input
                        {...rest}
                        value={filters?.[subData.field]}
                        placeholder="Search..."
                        onChange={(e) => getInputValue(e, filters)}
                        onKeyDown={inputStopPropagation}
                      />
                    </div>
                  </Typography>
                </Popover>

                {/* {open && <FiltersDropdown options={options} setFilters={setFilters} filters={filters} column={column} />} */}
              </div>
            )}
          </FilterRenderer>
        </div>
      );
    }
    if (subData.filter && subData.sortable) {
      var style1 = {
        display: "flex",
        justifyContent: "space-between",
        borderRight: "1px solid var(--rdg-border-color)",
        width: subData.width,
        alignItems: "center",
        height: `${cellHeight}px`,
        boxSizing: "border-box",
        outline:
          selectedCellIdx === subData.idx
            ? "1px solid var(--rdg-selection-color)"
            : "none",
        outlineOffset: selectedCellIdx === subData.idx ? "-1px" : "0px",
      };

      selectedCellHeaderStyle && selectedPosition.idx === subData.idx
        ? (style1 = { ...style1, ...selectedCellHeaderStyle })
        : style1;

      function onClickFilter() {
        selectCell(subData.idx);
      }

      const getFilterValue = (event) => {
        const value = event.target.value;
        setFilterType(value);
      };

      const getInputValue = (event, filters) => {
        const value = event.target.value;

        setFilters({
          ...filters,
          [subData.field]: value,
        });
      };

      return (
        // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          key={subData.idx}
          style={{ ...style1 }}
          // onFocus={handleFocus}
          onClick={onClickFilter}
          onDoubleClick={column.resizable ? onDoubleClick : undefined}
          // onPointerDown={column.resizable ? onPointerDown : undefined}
        >
          <SortableHeaderCell
            onSort={onSort}
            selectedPositionIdx={selectedPosition.idx}
            subCellIdx={subData.idx}
            sortDirection={sortDirection}
            priority={priority}
            isCellSelected={isCellSelected}>
            {subData.headerName}
          </SortableHeaderCell>
          <FilterRenderer column={subData} isCellSelected={isCellSelected}>
            {({ filters, ...rest }) => (
              <div className={filterClassname}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10px"
                  height="10px"
                  version="1.1"
                  // style="shapeRendering:geometricPrecision; textRendering:geometricPrecision; imageRendering:optimizeQuality; fillRule:evenodd; clipRule:evenodd"
                  viewBox="0 0 507 511.644"
                  onClick={handleClick}
                  fill="white">
                  <g id="Layer_x0020_1">
                    <metadata id="CorelCorpID_0Corel-Layer" />
                    <path
                      class="fil0"
                      d="M192.557 241.772c5.368,5.842 8.316,13.476 8.316,21.371l0 232.663c0,14.002 16.897,21.109 26.898,11.265l64.905 -74.378c8.684,-10.422 13.475,-15.581 13.475,-25.901l0 -143.597c0,-7.897 3.001,-15.529 8.318,-21.373l186.236 -202.081c13.947,-15.159 3.21,-39.741 -17.424,-39.741l-459.536 0c-14.188,0 -23.722,11.594 -23.745,23.784 -0.01,5.541 1.945,11.204 6.321,15.957l186.236 202.031 0 0z"
                    />
                  </g>
                </svg>

                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}>
                  <Typography sx={{ p: 2 }}>
                    <select style={{ width: "100%" }} onChange={getFilterValue}>
                      <option>Contain</option>
                      <option>Starts With...</option>
                      <option>Ends With...</option>
                      <option>Equals</option>
                      <option>Not Equals</option>
                    </select>
                    <div>
                      <input
                        {...rest}
                        value={filters?.[subData.field]}
                        placeholder="Search..."
                        onChange={(e) => getInputValue(e, filters)}
                        onKeyDown={inputStopPropagation}
                      />
                    </div>
                  </Typography>
                </Popover>

                {/* {open && <FiltersDropdown options={options} setFilters={setFilters} filters={filters} column={column} />} */}
              </div>
            )}
          </FilterRenderer>
        </div>
      );
    }
  }
};

function inputStopPropagation(event) {
  if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.stopPropagation();
  }
}
