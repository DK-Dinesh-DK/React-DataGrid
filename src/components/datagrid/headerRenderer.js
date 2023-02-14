import React, { useContext, useEffect, useState } from 'react';	
import { css } from "@linaria/core"	
import { useFocusRef } from "./hooks"	
import { useDefaultComponents } from "./DataGridDefaultComponentsProvider"	
import FilterContext from './filterContext';	
import FiltersDropdown from './FiltersDropdown'
import { useRovingCellRef } from "./hooks";
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
`


const filterClassname = css`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: auto auto;
  padding: 4px;
  font-size: 14px;
  inline-size: 100%;
`;
const headerSortNameClassname = `rdg-header-sort-name ${headerSortName}`;
export default function headerRenderer({
  column,
  rows,
  sortDirection,
  priority,selectCell,
  onSort,
  isCellSelected,
  shouldFocusGrid,
  setFilters,
   cellHeight,
   selectedPosition,
   selectedCellHeaderStyle,
   headerRowHeight,
}) {

  const unique = [...new Set(rows?.map(item => item?.[column.key]))]
  const [options, setOptions] = useState([])
  useEffect(() => {
    let dummy = []
    unique.forEach(x => {
      dummy.push({
        key: column.key,
        listname: x,
        value:x
      })
    })
    setOptions(dummy)
  }, [column])

  const [open, setOpen] = useState(false);


  const {  onFocus } = useRovingCellRef(isCellSelected);

  if (!column.sortable && !column.filter) {
    if (column.haveChildren === true && !column.filter) {
      return (
        <div>
          <div
            style={{
              borderBlockEnd: "1px solid var(--rdg-border-color)",
              height: `${headerRowHeight}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "inherit",
                justifyContent: "center",
              }}
            >
              {column.headerName}
            </div>
          </div>

          <div
            style={{
              display: "flex",

              // gridTemplateColumns:"1fr 1fr 1fr",
              boxSizing: "border-box",
            }}
          >
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
                  }}
                >
                  {RecursiveScan(column.children, info, cellHeight, index,headerRowHeight, selectedPosition,selectedCellHeaderStyle,column,selectCell,shouldFocusGrid,isCellSelected,onSort,sortDirection,priority,)}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      var style={
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "inherit",  
    }
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
    
    return (
      // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div style={{ height: `${cellHeight}px` }}
      onFocus={handleFocus}
      onClick={onClick}
      onDoubleClick={column.resizable ? onDoubleClick : undefined}
      onPointerDown={column.resizable ? onPointerDown : undefined}
      >
        <div
          style={{...style,}}
        >
          {column.headerName}
        </div>
      </div>
    );
    }
  }
  if (column.sortable && !column.filter) {
    if (column.haveChildren === true && !column.filter) {
      return (
        <div>
          <div
            style={{
              borderBlockEnd: "1px solid var(--rdg-border-color)",
              height: `${headerRowHeight}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "inherit",
                justifyContent: "center",
              }}
            >
              {column.headerName}
            </div>
          </div>

          <div
            style={{
              display: "flex",

              // gridTemplateColumns:"1fr 1fr 1fr",
              boxSizing: "border-box",
            }}
          >
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
                  }}
                >
                  {RecursiveScan(column.children, info, cellHeight, index,headerRowHeight, selectedPosition,selectedCellHeaderStyle,column,selectCell,shouldFocusGrid,isCellSelected,onSort,sortDirection,priority,)}
                </div>
              );
            })}
          </div>
        </div>
      );
    } else {
      var style= {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "inherit",
      }
      selectedCellHeaderStyle && selectedPosition.idx === column.idx
      ? (style = { ...style, ...selectedCellHeaderStyle })
      : style;
      return (
        <div style={{ height: `${cellHeight}px` }}>
          <div
          style={{...style,}}
          >
            <SortableHeaderCell
              onSort={onSort}
              sortDirection={sortDirection}
              priority={priority}
              isCellSelected={isCellSelected}
              column={column}
            >
              {column.headerName}
            </SortableHeaderCell>
          </div>
        </div>
      );
    }
  }

  if (column.filter && !column.sortable){
    if (column.haveChildren === true && !column.filter) {
        return (
          <div>
            <div
              style={{
                borderBlockEnd: "1px solid var(--rdg-border-color)",
                height: `${headerRowHeight}px`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "inherit",
                  justifyContent: "center",
                }}
              >
                {column.headerName}
              </div>
            </div>
  
            <div
              style={{
                display: "flex",
  
                // gridTemplateColumns:"1fr 1fr 1fr",
                boxSizing: "border-box",
              }}
            >
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
                    }}
                  >
                    {RecursiveScan(column.children, info, cellHeight, index,headerRowHeight, selectedPosition,selectedCellHeaderStyle,column,selectCell,shouldFocusGrid,isCellSelected,onSort,sortDirection,priority,)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else {
        return (
          <div style={{ height: `${cellHeight}px` }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "inherit",
              }}
            >
               <FilterRenderer column={column} isCellSelected={isCellSelected}>
        {({ filters, ...rest }) => (
          <div className={filterClassname}>
            <input
              {...rest}
              value={filters?.[column.key]}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  [column.key]: e.target.value
                })
              }
              onKeyDown={inputStopPropagation}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" onClick={() => setOpen(true)}>
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
            </svg>
            {open && <FiltersDropdown options={options} setFilters={setFilters} filters={filters} column={column}/>}
          </div>
        )}
      </FilterRenderer>
            </div>
          </div>
        );
      }
  }

  if (column.filter && column.sortable){
    if (column.haveChildren === true && !column.filter) {
        return (
          <div>
            <div
              style={{
                borderBlockEnd: "1px solid var(--rdg-border-color)",
                height: `${headerRowHeight}px`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "inherit",
                  justifyContent: "center",
                }}
              >
                {column.headerName}
              </div>
            </div>
  
            <div
              style={{
                display: "flex",
  
                // gridTemplateColumns:"1fr 1fr 1fr",
                boxSizing: "border-box",
              }}
            >
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
                    }}
                  >
                    {RecursiveScan(column.children, info, cellHeight, index,headerRowHeight, selectedPosition,selectedCellHeaderStyle,column,selectCell,shouldFocusGrid,isCellSelected,onSort,sortDirection,priority,)}
                  </div>
                );
              })}
            </div>
          </div>
        );
      } else {
        return (
          <div style={{ height: `${cellHeight}px` }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "inherit",
              }}
            >
        <SortableHeaderCell
          onSort={onSort}
          sortDirection={sortDirection}
          priority={priority}
          isCellSelected={isCellSelected}
        >
          {column.headerName}
        </SortableHeaderCell>
        <FilterRenderer column={column} isCellSelected={isCellSelected}>
          {({ filters, ...rest }) => (
            <div className={filterClassname}>
              {/* <input
                {...rest}
                value={filters?.[column.key]}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    [column.key]: e.target.value
                  })
                }
                onKeyDown={inputStopPropagation}
              /> */}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" onClick={() => setOpen(true)}>
                <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
              </svg>
              {open && <FiltersDropdown options={options} setFilters={setFilters} filters={filters} column={column}/>}
            </div>
          )}
        </FilterRenderer>
            </div>
          </div>
        );
      }
  }

  
}

const RecursiveScan = (masterData, subData, cellHeight,index,headerRowHeight, selectedPosition,selectedCellHeaderStyle,column,selectCell,shouldFocusGrid,isCellSelected,onSort,sortDirection,priority,) => {
  var cellHeight = cellHeight - headerRowHeight;
  const {  onFocus } = useRovingCellRef(isCellSelected);
  if (subData.haveChildren === true) {
    return (
      <div style={{ textAlign: "center" }}>
        {
          <div
            style={{
              borderBlockEnd: "1px solid var(--rdg-border-color)",
              height: `${headerRowHeight}px`,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "inherit",
                justifyContent: "center",
              }}
            >
              {subData.headerName}
            </div>
          </div>
        }
        <div
          style={{
            display: "flex",
            // gridTemplateColumns: "`100%/Object.keys(subData.children).length` ".repeat(
            //   Object.keys(subData.children).length
            // ),
            boxSizing: "border-box",
          }}
        >
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
                }}
              >
                {RecursiveScan(subData.children, subInfo, cellHeight,index,headerRowHeight, selectedPosition,selectedCellHeaderStyle,column,selectCell,shouldFocusGrid,isCellSelected,onSort,sortDirection,priority,)}
              </div>
            );
          })}
        </div>
      </div>
    );
  } else {
    var style={
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "inherit",
      width: subData.width,
      height: `${cellHeight}px`,
    }
    // console.log("subData",subData.idx,)
    console.log("subData1",selectedPosition.idx)
     selectedCellHeaderStyle && selectedPosition.idx === subData.idx
      ? (style = { ...style, ...selectedCellHeaderStyle })
      : style;
    
      function onClick() {
        selectCell(subData.idx);
        console.log("subData3",subData.idx,selectedPosition.idx)
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
    // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
        <div
          style={{...style}}
          // onFocus={handleFocus}
          onClick={onClick}
          onDoubleClick={column.resizable ? onDoubleClick : undefined}
          // onPointerDown={column.resizable ? onPointerDown : undefined}
        >
          <SortableHeaderCell
          onSort={onSort}
          sortDirection={sortDirection}
          priority={priority}
          isCellSelected={isCellSelected}
        >
          {subData.headerName}
        </SortableHeaderCell>
          
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
    column
  }) {
    const sortStatus = useDefaultComponents().sortStatus
    const { ref, tabIndex } = useFocusRef(isCellSelected)
  
    function handleKeyDown(event) {
      if (event.key === " " || event.key === "Enter") {
        // stop propagation to prevent scrolling
        event.preventDefault()
        onSort(event.ctrlKey || event.metaKey)
      }
    }
  
    function handleClick(event) {
      onSort(event.ctrlKey || event.metaKey)
    }
  
    return (
      <span
        ref={ref}
        tabIndex={tabIndex}
        className={headerSortCellClassname}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <span className={headerSortNameClassname}>{children}</span>
        <span>{sortStatus({ sortDirection, priority })}</span>
      </span>
    )
  }
  
  function inputStopPropagation(event) {
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.stopPropagation();
    }
  }
  
  function FilterRenderer({
    isCellSelected,
    column,
    children,
  }) {
    const filters = useContext(FilterContext);
    const { ref, tabIndex } = useFocusRef(isCellSelected);
    return (
      <>
        {!column.sortable && <div>{column.headerName}</div>}
        {filters.enabled && <div>{children({ ref, tabIndex, filters })}</div>}
      </>
    );
  }