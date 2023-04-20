import React, {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useCallback,
  useMemo,
} from "react";

import useUpdateEffect from "@restart/hooks/useUpdateEffect";

import { flushSync, createPortal } from "react-dom";
import clsx from "clsx";
import { groupBy as rowGrouper, isString, _ } from "lodash";
import {
  ContextMenu,
  MenuItem,
  SubMenu,
  ContextMenuTrigger,
} from "react-contextmenu";
import { css } from "@linaria/core";
import {
  rootClassname,
  viewportDraggingClassname,
  focusSinkClassname,
  rowSelected,
  rowSelectedWithFrozenCell,
  filterContainerClassname,
} from "./style";
import {
  useLayoutEffect,
  useGridDimensions,
  useCalculatedColumns,
  useViewportColumns,
  useViewportRows,
  useLatestFunc,
  RowSelectionChangeProvider,
} from "./hooks";
import HeaderRow from "./HeaderRow";
import RowComponent, { defaultRowRenderer } from "./Row";
import GroupRowRenderer from "./GroupRow";
import SummaryRow from "./SummaryRow";
import EditCell from "./EditCell";
import DragHandle from "./DragHandle";
import { default as defaultSortStatus } from "./sortStatus";
import { checkboxFormatter as defaultCheckboxFormatter } from "./formatters";
import {
  DataGridDefaultComponentsProvider,
  useDefaultComponents,
} from "./DataGridDefaultComponentsProvider";
import {
  assertIsValidKeyGetter,
  getNextSelectedCellPosition,
  isSelectedCellEditable,
  canExitGrid,
  isCtrlKeyHeldDown,
  isDefaultCellInput,
  getColSpan,
  sign,
  abs,
  getSelectedCellColSpan,
  renderMeasuringCells,
  scrollIntoView,
} from "./utils";
import FilterContext from "./filterContext";
import { SelectColumn, SerialNumberColumn } from "./Columns";
import { exportToCsv, exportToPdf, exportToXlsx } from "./exportUtils";
import { ExportButton } from "./ExportData";
import Pagination from "rc-pagination";
import "./pagination.css";
import { useCalculatedColumnswithIdx } from "./hooks/useCalculatedColumnswithIdx";
import { useCalculatedRowColumns } from "./hooks/useCalculatedRowColumns";
import { useCalculatedColumnsWithTopHeader } from "./hooks/useCalculatedColumnsWithTopHeader";

const initialPosition = {
  idx: -1,
  rowIdx: -2,
  mode: "SELECT",
};

/**
 * Main API Component to render a data grid of rows and columns
 *
 * @example
 *
 * <DataGrid columns={columns} rows={rows} />
 */
function DataGrid(props, ref) {
  let {
    // Grid and data Props
    columnData: raawColumns,
    rowData: raawRows,
    topSummaryRows,
    bottomSummaryRows,
    rowKeyGetter,
    onRowsChange,
    // Dimensions props
    rowHeight: rawRowHeight,
    headerRowHeight: rawHeaderRowHeight,
    summaryRowHeight: rawSummaryRowHeight,
    // Feature props
    selectedRows,
    onSelectedRowsChange,
    defaultColumnOptions,
    groupBy: raawGroupBy,
    expandedGroupIds,
    onExpandedGroupIdsChange,
    // Event props
    onRowClicked: onRowClick,
    onRowDoubleClicked: onRowDoubleClick,
    selectedCellHeaderStyle,
    onScroll,
    onColumnResize,
    onFill,
    serialNumber,
    onCopy,
    onPaste,
    selectedCellRowStyle,
    onCellClicked: onCellClick,
    onCellDoubleClicked: onCellDoubleClick,
    onCellContextMenu,
    // Toggles and modes
    cellNavigationMode: rawCellNavigationMode,
    enableVirtualization: rawEnableVirtualization,
    // Miscellaneous
    renderers,
    className,
    showSelectedRows,
    style,
    rowClass,
    direction: rawDirection,
    getContextMenuItems,
    // ARIA
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
    "data-testid": testId,
    columnReordering,
    pagination: tablePagination,
    paginationPageSize,
    suppressPaginationPanel,
    paginationAutoPageSize,
    defaultPage,
    frameworkComponents,
    onGridReady,
    valueChangedCellStyle,
    rowSelection,
    ...rest
  } = props;

  /**
   * defaults
   */

  //console.log("raawRows :>> ", raawRows);
  const [selectedRows1, onSelectedRowsChange1] = useState();
  selectedRows = selectedRows ? selectedRows : [];
  const selection = rest.selection && SelectColumn;
  raawColumns = rest.selection ? [selection, ...raawColumns] : raawColumns;

  const contextMenuItems =
    getContextMenuItems !== undefined ? getContextMenuItems() : [];
  function contextMenuRowRenderer(key, props) {
    return (
      <ContextMenuTrigger
        key={key}
        id="grid-context-menu"
        collect={() => ({ rowIdx: props.rowIdx })}
      >
        <RowComponent {...props} />
      </ContextMenuTrigger>
    );
  }
  const [headerHeightFromRef, setHeaderHeightFromRef] = useState();
  const depth = (d) => (o) => {
    o.depth = d;
    (o.children || []).forEach(depth(d + 1));
  };

  raawColumns.forEach(depth(0));

  //console.log("arr", raawColumns);

  const cloneRaawColumns1 = raawColumns.slice();
  const getArrayDepth = (arr) => {
    if (Array.isArray(arr)) {
      // if arr is an array, recurse over it
      return 1 + Math.max(...arr.map(getArrayDepth));
    }
    if (arr.children?.length) {
      // if arr is an object with a children property, recurse over the children
      return 1 + Math.max(...arr.children.map(getArrayDepth));
    }
    return 0;
  };
  const arrayDepth = getArrayDepth(cloneRaawColumns1);
  //console.log("arrayDepth", arrayDepth);
  const headerheight =
    (rawHeaderRowHeight ? rawHeaderRowHeight : 24) * arrayDepth;
  // const headerheight = enableFilter? rawHeaderRowHeight * arrayDepth+46 : rawHeaderRowHeight * arrayDepth;

  const enableFilter = raawColumns
    ?.map((i) => i.filter === true && i.depth === arrayDepth - 1)
    .includes(true);

  const defaultComponents = useDefaultComponents();
  const rowHeight = rawRowHeight ?? 24;
  const headerWithFilter = enableFilter ? 70 : undefined;
  const headerRowHeight = headerheight;
  //console.log("headerRowHeight", headerheight, headerWithFilter);
  const summaryRowHeight =
    rawSummaryRowHeight ?? (typeof rowHeight === "number" ? rowHeight : 24);
  const rowRenderer =
    contextMenuItems.length > 0
      ? contextMenuRowRenderer
      : renderers?.rowRenderer ??
        defaultComponents?.rowRenderer ??
        defaultRowRenderer;
  const sortStatus =
    renderers?.sortStatus ?? defaultComponents?.sortStatus ?? defaultSortStatus;
  const checkboxFormatter =
    renderers?.checkboxFormatter ??
    defaultComponents?.checkboxFormatter ??
    defaultCheckboxFormatter;
  const noRowsFallback =
    renderers?.noRowsFallback ?? defaultComponents?.noRowsFallback;
  const cellNavigationMode = rawCellNavigationMode ?? "NONE";
  const enableVirtualization = rawEnableVirtualization ?? true;
  const direction = rawDirection ?? "ltr";

  /**
   * states
   */
  const [afterFilter, setAfterFilter] = useState([]);
  const [defaultColumnDef, setDefaultColumnDef] =
    useState(defaultColumnOptions);
  const [rawGroupBy, setRawGroupBy] = useState(raawGroupBy);
  const [expandAll, setExpandAll] = useState(null);
  useUpdateEffect(() => {
    setExpandAll(null);
  }, [raawGroupBy, expandedGroupIds]);
  useUpdateEffect(() => {
    setRawGroupBy(raawGroupBy);
  }, [raawGroupBy]);
  const { columns3 } = useCalculatedColumnsWithTopHeader({
    raawColumns, //need to be added
  });

  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [columnWidths, setColumnWidths] = useState(() => new Map());
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [copiedCell, setCopiedCell] = useState(null);
  const [isDragging, setDragging] = useState(false);
  const [draggedOverRowIdx, setOverRowIdx] = useState(undefined);
  const [sortColumns, setSortColumns] = useState([]);
  const [rawRows, setRawRows] = useState(raawRows);
  // console.log("raawRows :>> ", raawRows);
  // useUpdateEffect(() => {
  //   setRawRows(() => raawRows);
  //   console.log("raawRows :>> ", raawRows);
  // }, [raawRows]);
  const [rawColumns, setRawColumns] = useState(
    serialNumber ? [SerialNumberColumn, ...raawColumns] : columns3
  );
  const [pagination, setPagination] = useState(tablePagination);
  const [suppressPagination, setSuppressPagination] = useState(
    suppressPaginationPanel ?? false
  );
  const [size, setSize] = useState(paginationPageSize ?? 20);
  const [current, setCurrent] = useState(defaultPage ?? 1);

  const PaginationChange = (page, pageSize) => {
    setCurrent(page);
    setSize(pageSize);
  };
  const PrevNextArrow = (current, type, originalElement) => {
    if (type === "prev") {
      return (
        <button title="Previous">
          <i className="fa fa-angle-double-left" />
        </button>
      );
    }
    if (type === "next") {
      return (
        <button title="Next">
          <i className="fa fa-angle-double-right" />
        </button>
      );
    }
    return originalElement;
  };
  const PerPageChange = (value) => {
    setSize(value);
    const newPerPage = Math.ceil(rawRows.length / value);
    if (current > newPerPage) {
      setCurrent(newPerPage);
    }
  };
  const onSortColumnsChange = (sortColumns) => {
    setSortColumns(sortColumns.slice(-1));
  };

  useUpdateEffect(() => {
    setRawColumns(
      serialNumber ? [SerialNumberColumn, ...raawColumns] : columns3
    );
  }, [props.columnData]);

  let flattedColumns;
  const flat = (rawColumns) => (o) =>
    o.children
      ? o.children.flatMap(flat(rawColumns || o.headerName))
      : { ...o, rawColumns };
  const response = rawColumns;
  flattedColumns = response.flatMap(flat());
  const defaultFilters = {};
  flattedColumns?.map((i) => (defaultFilters[i.field] = ""));
  rawColumns?.map((i) => (defaultFilters[i.key] = ""));

  const subColumn = [];
  const [filters, setFilters] = useState({ ...defaultFilters, enabled: true });
  const [filterType, setFilterType] = useState("Contain");
  //console.log("filterType11", filters);

  const ChildColumnSetup = (value) => {
    subColumn.push(value);
  };

  const filterFunction = useCallback(
    (props) => {
      if (filterType === "Contain") {
        return raawRows?.filter(function (val) {
          for (const element of props)
            if (!val[element[0]].includes(element[1])) return false;
          return true;
        });
      } else if (filterType === "Starts With...") {
        return raawRows?.filter(function (val) {
          for (const element of props)
            if (!val[element[0]].startsWith(element[1])) return false;
          return true;
        });
      } else if (filterType === "Ends With...") {
        return raawRows?.filter(function (val) {
          for (const element of props)
            if (!val[element[0]].endsWith(element[1])) return false;
          return true;
        });
      } else if (filterType === "Equals") {
        return raawRows?.filter(function (val) {
          for (const element of props) {
            if (val[element[0]] !== element[1]) {
              return false;
            }
          }
          return true;
        });
      } else if (filterType === "Not Equals") {
        return raawRows?.filter(function (val) {
          for (const element of props) {
            if (val[element[0]] === element[1]) {
              return false;
            }
          }
          return true;
        });
      }
    },
    [filterType, raawRows]
  );

  const sortedRows = useMemo(() => {
    const asArray = Object.entries(filters);
    const keys = asArray.filter(([key, value]) => value.length > 0);

    const filteredRows = filterFunction(keys);

    if (sortColumns.length === 0) return filteredRows;
    const { columnKey, direction } = sortColumns[0];
    let sortedRows = filteredRows;
    sortedRows = sortedRows.sort((a, b) =>
      typeof a[columnKey] === "number"
        ? a[columnKey] - b[columnKey]
        : a[columnKey].localeCompare(b[columnKey])
    );
    return direction === "DESC" ? sortedRows.reverse() : sortedRows;
  }, [raawRows, sortColumns, filters]);

  useUpdateEffect(() => {
    return setRawRows(sortedRows);
  }, [sortedRows]);

  const handleReorderColumn = (value) => {
    if (columnReordering) {
      setRawColumns(value);
    }
  };

  const handleReorderRow = (value) => setRawRows(value);

  //Adding a serial number column if serialNumber prop is passed
  raawColumns = serialNumber
    ? [SerialNumberColumn, ...raawColumns]
    : raawColumns;
  /**
   * refs
   */
  const prevSelectedPosition = useRef(selectedPosition);
  const latestDraggedOverRowIdx = useRef(draggedOverRowIdx);
  const lastSelectedRowIdx = useRef(-1);
  const rowRef = useRef(null);

  /**
   * computed values
   */
  const [gridRef, gridWidth, gridHeight, isWidthInitialized] =
    useGridDimensions();
  const headerRowsCount = 1;
  const topSummaryRowsCount = topSummaryRows?.length ?? 0;
  const bottomSummaryRowsCount = bottomSummaryRows?.length ?? 0;
  const summaryRowsCount = topSummaryRowsCount + bottomSummaryRowsCount;
  const clientHeight =
    gridHeight - headerRowHeight - summaryRowsCount * summaryRowHeight;
  const isSelectable = selectedRows != null && onSelectedRowsChange != null;
  const isRtl = direction === "rtl";
  const leftKey = isRtl ? "ArrowRight" : "ArrowLeft";
  const rightKey = isRtl ? "ArrowLeft" : "ArrowRight";

  const defaultGridComponents = useMemo(
    () => ({
      sortStatus,
      checkboxFormatter,
    }),
    [sortStatus, checkboxFormatter]
  );

  const allRowsSelected = useMemo(() => {
    // no rows to select = explicitely unchecked
    const { length } = rawRows;
    return (
      length !== 0 &&
      selectedRows1 != null &&
      rowKeyGetter != null &&
      selectedRows1.size >= length &&
      rawRows.every((row) => selectedRows1.has(rowKeyGetter(row)))
    );
  }, [rawRows, selectedRows1, rowKeyGetter]);

  function flatten(into, node) {
    if (node == null) return into;
    if (Array.isArray(node)) return node.reduce(flatten, into);
    into.push(node);

    return flatten(into, node.children);
  }

  var rowArray = flatten([], rawColumns);

  var value = false;
  var rowColD = rowArray.slice();
  rowColD = rowColD.filter(function (item) {
    return item !== value;
  });

  var rowArray1 = rowColD.slice();
  for (var i = 0; i < rowArray1.length; i++) {
    if (rowArray1[i].haveChildren) {
      rowArray1.splice(i, 1);
      i--;
    }
  }

  //console.log("columns3", rowArray1);

  let groupingViaCommonProperty = Object.values(
    rowArray1.reduce((acc, current) => {
      acc[current.topHeader] = acc[current.topHeader] ?? [];
      acc[current.topHeader].push(current.width);
      return acc;
    }, {})
  );
  var arr2 = groupingViaCommonProperty.map((arr) =>
    arr.reduce((sum, item) => (sum += item))
  );

  const newData = rawColumns.slice().map((item1, index) => {
    var itemFromArr2 = arr2.find((item2, index2) => index === index2);

    if (itemFromArr2) {
      item1.width = itemFromArr2;
    }
    return item1;
  });

  const {
    columns,
    colSpanColumns,
    colOverscanStartIdx,
    colOverscanEndIdx,
    templateColumns,
    layoutCssVars,
    columnMetrics,
    lastFrozenColumnIndex,
    totalFrozenColumnWidth,
    groupBy,
  } = useCalculatedColumns({
    newData,
    columnWidths,
    scrollLeft,
    viewportWidth: gridWidth,
    defaultColumnDef,
    rawGroupBy: rowGrouper ? rawGroupBy : undefined,
    enableVirtualization,
    frameworkComponents,
  });

  //console.log("columnData", rawColumns);

  function flatten(into, node) {
    if (node == null) return into;
    if (Array.isArray(node)) return node.reduce(flatten, into);
    into.push(node);

    return flatten(into, node.children);
  }

  var rowData = flatten([], columns);
  var value1 = false;

  rowData = rowData.filter(function (item) {
    return item !== value1;
  });
  const rowData1 = rowData.slice();
  for (var i = 0; i < rowData1.length; i++) {
    if (rowData1[i].haveChildren) {
      rowData1.splice(i, 1);
      i--;
    }
  }

  const { columns4 } = useCalculatedColumnswithIdx({
    rowData1, //need to be added
    columnWidths,
    scrollLeft,
    viewportWidth: gridWidth,
    defaultColumnOptions,
    rawGroupBy: rowGrouper ? rawGroupBy : undefined,
    enableVirtualization,
    frameworkComponents,
  });

  let merged = [];
  for (const element of rowData) {
    merged.push({
      ...element,
      ...columns4.find((itmInner) => itmInner.field === element.field),
    });
  }

  for (let ii = 0, leng = merged.length; ii < leng; ii++) {
    merged[ii].children = undefined;
  }

  const regroupArray = (array) => {
    const map = {};
    array.forEach((item) => {
      map[item.field] = item;
      item.children = [];
    });
    array.forEach((item) => {
      if (item.parent !== null) {
        map[item.parent].children.push(item);
      }
    });
    return array.filter((item) => item.parent === null);
  };
  for (var i = 0, len = regroupArray(merged).length; i < len; i++) {
    if (regroupArray(merged)[i].haveChildren === true)
      regroupArray(merged)[i].idx =
        regroupArray(merged)[i].index + columns4.length;
  }

  const { columns5 } = useCalculatedRowColumns({
    columns4,
    columnWidths,
    scrollLeft,
    viewportWidth: gridWidth,
    defaultColumnOptions,
    rawGroupBy: rowGrouper ? rawGroupBy : undefined,
    enableVirtualization,
    frameworkComponents, //need to be added
  });

  const {
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    rowsCount,
    totalRowHeight,
    gridTemplateRows,
    isGroupRow,
    getRowTop,
    getRowHeight,
    findRowIdx,
  } = useViewportRows({
    rawRows,
    groupBy,
    rowGrouper,
    expandAll,
    rowHeight,
    clientHeight,
    scrollTop,
    expandedGroupIds,
    enableVirtualization,
    paginationPageSize: size,
    current,
    pagination,
  });

  const { viewportColumns, flexWidthViewportColumns } = useViewportColumns({
    columns,
    colSpanColumns,
    colOverscanStartIdx,
    colOverscanEndIdx,
    lastFrozenColumnIndex,
    rowOverscanStartIdx,
    rowOverscanEndIdx,
    rows,
    topSummaryRows,
    bottomSummaryRows,
    columnWidths,
    isGroupRow,
  });
  //column Api
  function getColumnWidths() {
    let keys = Array.from(columnMetrics.keys());
    let columnKeys = [];
    keys.map((key) => columnKeys.push(key.key));
    let values = Array.from(columnMetrics.values());
    let columnWidthValues = [];
    values.map((value) => columnWidthValues.push(value.width));
    let columnWidth = new Map(columnWidths);
    for (let i = 0; i < columnWidthValues.length; i++) {
      columnWidth.set(columnKeys[i], columnWidthValues[i]);
    }
    return columnWidth;
  }
  function getColumns() {
    let columnObjects = [];
    columns.forEach((column) => {
      const index = raawColumns.findIndex((c) => c.field === column.field);
      const userColDef = raawColumns[index];
      const indexOfRowGroup = rawGroupBy?.findIndex(
        (key) => key === column.key
      );
      const indexOfSort = sortColumns.findIndex(
        (sortCol) => sortCol.columnKey === column.key
      );
      const sort = indexOfSort > -1 ? sortColumns[indexOfSort].direction : null;
      const columnState = {
        colId: column.field ?? column.key ?? `col_${column.idx}`,
        columnIndex: column.idx,
        width: templateColumns[column.idx],
        frozen: column.frozen ?? undefined,
        rowGroup: column.rowGroup ?? undefined,
        rowGroupIndex: indexOfRowGroup > -1 ? indexOfRowGroup : null,
        sort: sort,
        userProvidedColDef: userColDef,
      };
      columnObjects.push(columnState);
      // column.children?.forEach((colChild) => {
      //   const columnState = {
      //     colId: colChild.field ?? colChild.key ?? `col_${column.idx}`,
      //     columnIndex: column.idx,
      //     width: colChild.widt
      //     frozen: colChild.frozen ?? undefined,
      //     rowGroup: colChild.rowGroup ?? undefined,
      //     userProvidedColDef: userColDef,
      //   };
      //   columnObjects.push(columnState);
      // });
    });
    return columnObjects;
  }
  function moveColumn(colKey, toIndex) {
    const key = typeof colKey === "string" ? colKey : colKey.colId;
    const sourceColumnIndex = columns.findIndex((c) => c.field === key);
    const targetColumnIndex =
      toIndex < columns.length ? toIndex : sourceColumnIndex;
    const reorderedColumns = [...columns];
    reorderedColumns.splice(
      targetColumnIndex,
      0,
      reorderedColumns.splice(sourceColumnIndex, 1)[0]
    );
    setRawColumns(reorderedColumns);
  }
  function moveColumns(columnsToMove, toIndex) {
    let sourceColumns = [];
    const reorderedColumns = [...columns];
    columns.map((c) =>
      columnsToMove.forEach((col) => {
        const key = typeof col === "string" ? col : col.colId;
        if (key === c.field) sourceColumns.push(c);
      })
    );
    let valueAtPosition = columns[toIndex];
    sourceColumns.forEach((v) =>
      reorderedColumns.splice(reorderedColumns.indexOf(v), 1)
    );
    reorderedColumns.splice(
      reorderedColumns.indexOf(valueAtPosition) + 1,
      0,
      ...sourceColumns
    );
    setRawColumns(reorderedColumns);
  }
  function moveColumnByIndex(fromIndex, toIndex) {
    const sourceColumnIndex = fromIndex;
    const targetColumnIndex =
      toIndex < columns.length ? toIndex : sourceColumnIndex;
    const reorderedColumns = [...columns];
    reorderedColumns.splice(
      targetColumnIndex,
      0,
      reorderedColumns.splice(sourceColumnIndex, 1)[0]
    );
    setRawColumns(reorderedColumns);
  }
  function getDisplayNameForColumn(column, location) {
    let displayNameForCol;
    columns.forEach((col) => {
      if (column.colId === col.key && location === col.idx)
        displayNameForCol = col.headerName;
    });
    return displayNameForCol;
  }
  function getDisplayedColAfter(column) {
    let columnObjects = getColumns();
    let displayedColAfterKey;
    for (let index = 0; index < columns.length; index++) {
      let col = columns[index];
      let nextCol = columns[index + 1];
      if (column.colId === col.key)
        displayedColAfterKey = nextCol.parentColumn
          ? nextCol.parentColumn.key || nextCol.parentColumn.field
          : nextCol.key;
    }
    let displayedColAfter;
    columnObjects.forEach((colObj) => {
      if (colObj.colId === displayedColAfterKey) displayedColAfter = colObj;
    });
    return displayedColAfter;
  }
  function getDisplayedColBefore(column) {
    let columnObjects = getColumns();
    let displayedColBeforeKey;
    for (let index = 0; index < columns.length; index++) {
      let col = columns[index];
      let prevCol = columns[index - 1];
      if (column.colId === col.key)
        displayedColBeforeKey = prevCol.parentColumn
          ? prevCol.parentColumn.key || prevCol.parentColumn.field
          : prevCol.key;
    }
    let displayedColBefore;
    columnObjects.forEach((colObj) => {
      if (colObj.colId === displayedColBeforeKey) displayedColBefore = colObj;
    });
    return displayedColBefore;
  }
  function getRowGroupColumns() {
    let columnObjects = getColumns();
    let rowGroupColumns = [];
    columnObjects.forEach((colObject) => {
      if (rawGroupBy?.includes(colObject.colId))
        rowGroupColumns.push(colObject);
    });
    return rowGroupColumns;
  }
  function setRowGroupColumns(colKeys) {
    rawGroupBy.length = 0;
    colKeys.forEach((colKey) => {
      typeof colKey === "string"
        ? rawGroupBy.push(colKey)
        : rawGroupBy.push(colKey.colId);
    });
    setRawColumns(raawColumns);
  }
  function addRowGroupColumn(colKey) {
    typeof colKey === "string"
      ? rawGroupBy.push(colKey)
      : rawGroupBy.push(colKey.colId);
    setRawColumns(raawColumns);
  }
  function addRowGroupColumns(colKeys) {
    colKeys.forEach((colKey) => {
      typeof colKey === "string"
        ? rawGroupBy.push(colKey)
        : rawGroupBy.push(colKey.colId);
    });
    setRawColumns(raawColumns);
  }
  function removeRowGroupColumn(colKey) {
    const key = typeof colKey === "string" ? colKey : colKey.colId;
    const indexOfKey = rawGroupBy?.findIndex((c) => c === key);
    if (indexOfKey > -1) rawGroupBy?.splice(indexOfKey, 1);
    setRawColumns(raawColumns);
  }
  function removeRowGroupColumns(colKeys) {
    colKeys.forEach((colKey) => {
      const key = typeof colKey === "string" ? colKey : colKey.colId;
      const indexOfKey = rawGroupBy?.findIndex((c) => c === key);
      if (indexOfKey > -1) rawGroupBy?.splice(indexOfKey, 1);
    });
    setRawColumns(raawColumns);
  }
  function moveRowGroupColumn(fromIndex, toIndex) {
    if (fromIndex > -1 && toIndex < rawGroupBy?.length) {
      var element = rawGroupBy[fromIndex];
      rawGroupBy.splice(fromIndex, 1);
      rawGroupBy.splice(toIndex, 0, element);
      setRawColumns(columns);
    }
  }
  function setColumnWidth(key, newWidth) {
    const colKey = typeof key === "string" ? key : key.colId;
    const newColumnWidths = new Map(columnWidths);
    newColumnWidths.set(colKey, newWidth);
    setColumnWidths(newColumnWidths);
  }
  function setColumnsWidth(newColumnWidths) {
    const newColWidths = new Map(columnWidths);
    newColumnWidths.forEach((col) => {
      const colKey = typeof col.key === "string" ? col.key : col.key.colId;
      const colWidth = col.newWidth;
      newColWidths.set(colKey, colWidth);
    });
    setColumnWidths(newColWidths);
  }
  function autoSizeColumn(key) {
    const colKey = typeof key === "string" ? key : key.colId;
    const columnIndex = columns.findIndex((col) => col.key === colKey);
    const column = columns[columnIndex];
    handleColumnResize(column, "max-content");
  }
  function autoSizeColumns(colKeys) {
    let columnObjects = getColumns();
    const { style } = gridRef.current;
    const newTemplateColumns = [...templateColumns];
    const newColumnWidths = new Map(columnWidths);
    colKeys.forEach((colKey) => {
      const key = typeof colKey === "string" ? colKey : colKey.colId;
      const index = columnObjects.findIndex((c) => c.colId === key);
      newTemplateColumns[index] = "max-content";
      style.gridTemplateColumns = newTemplateColumns.join(" ");
      const measuringCell = gridRef.current.querySelector(
        `[data-measuring-cell-key="${columns[index].key}"]`
      );
      const measuredWidth = measuringCell.getBoundingClientRect().width;
      const measuredWidthPx = `${measuredWidth}px`;
      if (newTemplateColumns[columns[index].idx] !== measuredWidthPx) {
        newTemplateColumns[columns[index].idx] = measuredWidthPx;
        style.gridTemplateColumns = newTemplateColumns.join(" ");
      }
      if (columnWidths.get(columns[index].key) === measuredWidth) return;
      newColumnWidths.set(columns[index].key, measuredWidth);
    });
    setColumnWidths(newColumnWidths);
    templateColumns = [...newTemplateColumns];
  }
  function autoSizeAllColumns() {
    const { style } = gridRef.current;
    const newTemplateColumns = [...templateColumns];
    const newColumnWidths = new Map(columnWidths);
    for (let index = 0; index < newTemplateColumns.length; index++) {
      newTemplateColumns[index] = "max-content";
      style.gridTemplateColumns = newTemplateColumns.join(" ");
      const measuringCell = gridRef.current.querySelector(
        `[data-measuring-cell-key="${columns[index].key}"]`
      );
      const measuredWidth = measuringCell.getBoundingClientRect().width;
      const measuredWidthPx = `${measuredWidth}px`;
      if (newTemplateColumns[columns[index].idx] !== measuredWidthPx) {
        newTemplateColumns[columns[index].idx] = measuredWidthPx;
        style.gridTemplateColumns = newTemplateColumns.join(" ");
      }
      if (columnWidths.get(columns[index].key) === measuredWidth) return;
      newColumnWidths.set(columns[index].key, measuredWidth);
    }
    setColumnWidths(newColumnWidths);
    templateColumns = [...newTemplateColumns];
  }
  function sizeColumnsToFit(gridWidth) {
    let columnWidths = getColumnWidths();
    let widthSum = 0;
    let colWidthValues = Array.from(columnWidths.values());
    colWidthValues.forEach((colWidth) => {
      widthSum += colWidth;
    });
    var scale = gridWidth / widthSum;
    const newColWidths = new Map(columnWidths);
    let colWidths = Array.from(columnWidths.keys());
    let sum = 0;
    for (let index = 0; index < colWidthValues.length; index++) {
      if (index === colWidthValues.length - 1) {
        let width = gridWidth - sum;
        newColWidths.set(colWidths[index], width);
      } else {
        let width = Math.round(colWidthValues[index] * scale);
        newColWidths.set(colWidths[index], width);
        sum += width;
      }
    }
    setColumnWidths(newColWidths);
  }
  function getColumnState() {
    var columns = Array.from(columnMetrics.keys());
    var colStates = [];
    columns.forEach((col) => {
      const index = sortColumns.findIndex(
        (sortCol) => sortCol.columnKey === col.key
      );
      const sort = index > -1 ? sortColumns[index].direction : null;
      const indexOfRowGroup = rawGroupBy?.findIndex((key) => key === col.key);
      const colState = {
        colId: col.key ?? `col_${col.idx}`,
        columnIndex: col.idx,
        frozen: col.frozen ?? undefined,
        width: templateColumns[col.idx],
        rowGroup: col.rowGroup ?? undefined,
        rowGroupIndex: indexOfRowGroup > -1 ? indexOfRowGroup : null,
        sort: sort,
      };
      colStates.push(colState);
    });
    return colStates;
  }
  function applyColumnState(columnState) {
    const colState = columnState.state;
    const defaultState = columnState.defaultState ?? undefined;
    const newColWidths = new Map(columnWidths);
    colState.forEach((col) => {
      const colKey = col.colId;
      if (col.frozen) {
        const index = columns.findIndex((c) => c.key === colKey);
        columns[index].frozen = col.frozen;
      }
      if (col.width !== undefined) {
        let width = isString(col.width)
          ? Number(col.width.match(/\d+/)[0])
          : col.width;
        newColWidths.set(colKey, width);
      }
      if (col.rowGroup !== undefined) {
        if (col.rowGroup) {
          const index = columns.findIndex((c) => c.key === colKey);
          columns[index].rowGroup = col.rowGroup;
          addRowGroupColumn(colKey);
        } else {
          const index = columns.findIndex((c) => c.key === colKey);
          columns[index].rowGroup = col.rowGroup;
          removeRowGroupColumn(colKey);
        }
      }
      if (col.rowGroupIndex !== undefined) {
        if (col.rowGroupIndex !== null && col.rowGroup) {
          const fromIndex = rawGroupBy.findIndex(
            (groupCol) => groupCol === colKey
          );
          const toIndex = col.rowGroupIndex;
          if (fromIndex > -1 && toIndex < rawGroupBy?.length)
            moveRowGroupColumn(fromIndex, toIndex);
        }
      }
      if (col.sort !== undefined) {
        if (col.sort !== null) {
          const index = sortColumns.findIndex(
            (sortCol) => sortCol.columnKey === colKey
          );
          if (index === -1)
            sortColumns.push({ columnKey: colKey, direction: col.sort });
          if (index > -1 && sortColumns[index].direction !== col.sort)
            sortColumns[index].direction = col.sort;
          onSortColumnsChange(sortColumns);
        } else {
          const index = sortColumns.findIndex(
            (sortCol) => sortCol.columnKey === colKey
          );
          if (index > -1) sortColumns.splice(index, 1);
          onSortColumnsChange(sortColumns);
        }
      }
      setColumnWidths(newColWidths);
    });
    if (defaultState) {
      let keysOfColumns = [];
      colState.map((col) => keysOfColumns.push(col.colId));
      columns.forEach((column) => {
        if (!keysOfColumns.includes(column.key)) {
          if (defaultState.frozen !== undefined)
            column.frozen = defaultState.frozen;
          if (defaultState.width !== undefined) {
            newColWidths.set(column.key, defaultState.width);
          }
          if (defaultState.rowGroup !== undefined) {
            if (defaultState.rowGroup) {
              const index = columns.findIndex((c) => c.key === column.key);
              columns[index].rowGroup = defaultState.rowGroup;
              addRowGroupColumn(column.key);
            } else {
              const index = columns.findIndex((c) => c.key === column.key);
              columns[index].rowGroup = defaultState.rowGroup;
              removeRowGroupColumn(column.key);
            }
          }
          if (defaultState.sort !== undefined) {
            if (defaultState.sort !== null) {
              const index = sortColumns.findIndex(
                (sortCol) => sortCol.columnKey === column.key
              );
              if (index === -1)
                sortColumns.push({
                  columnKey: column.key,
                  direction: defaultState.sort,
                });
              if (
                index > -1 &&
                sortColumns[index].direction !== defaultState.sort
              )
                sortColumns[index].direction = defaultState.sort;
              onSortColumnsChange(sortColumns);
            } else {
              const index = sortColumns.findIndex(
                (sortCol) => sortCol.columnKey === column.key
              );
              if (index > -1) sortColumns.splice(index, 1);
              onSortColumnsChange(sortColumns);
            }
          }
        }
      });
      setColumnWidths(newColWidths);
    }
    setRawColumns(columns);
  }
  function isPinning() {
    let isPinning = false;
    columns.forEach((col) => {
      if (col.frozen === true) isPinning = true;
    });
    return isPinning;
  }
  function setColumnPinned(key) {
    const colKey = typeof key === "string" ? key : key.colId;
    const columnIndex = columns.findIndex((col) => col.key === colKey);
    columns[columnIndex].frozen = true;
    setRawColumns(columns);
  }
  function setColumnsPinned(keys) {
    for (let i = 0; i < columns.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        const key = typeof keys[j] === "string" ? keys[j] : keys[j].colId;
        const columnIndex = columns.findIndex((col) => col.key === key);
        if (i === columnIndex) columns[i].frozen = true;
      }
    }
    setRawColumns(columns);
  }
  function getSortColumns() {
    let columnObjects = getColumns();
    let sortColumns = [];
    columnObjects.forEach((colObj) => {
      if (colObj.sort !== null) sortColumns.push(colObj);
    });
    return sortColumns;
  }
  var columnApiObject = {
    columnModel: {
      columnDefs: raawColumns,
      rowGroupColumns: getRowGroupColumns(),
      sortColumns: getSortColumns(),
    },
  };
  Object.setPrototypeOf(columnApiObject, {
    // get columns
    getColumns,
    getColumn: (colKey) => {
      let columnObjects = getColumns();
      let colObject;
      let key = typeof colKey === "string" ? colKey : colKey.colId;
      columnObjects.forEach((columnObj) => {
        if (columnObj.colId === key) colObject = columnObj;
      });
      return colObject;
    },
    getAllGridColumns: () => getColumns(),
    //move columns
    moveColumn,
    moveColumns,
    moveColumnByIndex,
    //display names for column / column groups
    getDisplayNameForColumn,
    getDisplayedColAfter,
    getDisplayedColBefore,
    getAllDisplayedVirtualColumns: () => viewportColumns,
    getAllDisplayedColumns: () => viewportColumns,
    //row group columns
    getRowGroupColumns,
    setRowGroupColumns,
    addRowGroupColumn,
    addRowGroupColumns,
    removeRowGroupColumn,
    removeRowGroupColumns,
    moveRowGroupColumn,
    //column widths
    setColumnWidth,
    setColumnsWidth,
    autoSizeColumn,
    autoSizeColumns,
    autoSizeAllColumns,
    sizeColumnsToFit,
    //column states
    getColumnState,
    applyColumnState,
    resetColumnState: () => {
      // // groupBy = [...rawGroupBy];
      if (rawGroupBy?.length > 0) rawGroupBy.length = 0;
      if (sortColumns?.length > 0) {
        sortColumns.length = 0;
        onSortColumnsChange(sortColumns);
      }
      setRawColumns(raawColumns);
    },
    //pinning columns
    isPinning,
    setColumnPinned,
    setColumnsPinned,
  });

  //column Api
  function getColumnWidths() {
    let keys = Array.from(columnMetrics.keys());
    let columnKeys = [];
    keys.map((key) => columnKeys.push(key.key));
    let values = Array.from(columnMetrics.values());
    let columnWidthValues = [];
    values.map((value) => columnWidthValues.push(value.width));
    let columnWidth = new Map(columnWidths);
    for (let i = 0; i < columnWidthValues.length; i++) {
      columnWidth.set(columnKeys[i], columnWidthValues[i]);
    }
    return columnWidth;
  }
  function getColumns() {
    let columnObjects = [];
    columns.forEach((column) => {
      const index = raawColumns.findIndex((c) => c.field === column.field);
      const userColDef = raawColumns[index];
      const indexOfRowGroup = rawGroupBy?.findIndex(
        (key) => key === `${column.key}`
      );
      const indexOfSort = sortColumns.findIndex(
        (sortCol) => sortCol.columnKey === `${column.key}`
      );
      const sort = indexOfSort > -1 ? sortColumns[indexOfSort].direction : null;
      const columnState = {
        colId: column.field ?? `${column.key}` ?? `col_${column.idx}`,
        columnIndex: column.idx,
        width: templateColumns[column.idx],
        frozen: column.frozen ?? undefined,
        rowGroup: column.rowGroup ?? undefined,
        rowGroupIndex: indexOfRowGroup > -1 ? indexOfRowGroup : null,
        sort: sort,
        userProvidedColDef: userColDef,
      };
      columnObjects.push(columnState);
      // column.children?.forEach((colChild) => {
      //   const columnState = {
      //     colId: colChild.field ?? colChild.key ?? `col_${column.idx}`,
      //     columnIndex: column.idx,
      //     width: colChild.width,
      //     frozen: colChild.frozen ?? undefined,
      //     rowGroup: colChild.rowGroup ?? undefined,
      //     userProvidedColDef: userColDef,
      //   };
      //   columnObjects.push(columnState);
      // });
    });
    return columnObjects;
  }
  function moveColumn(colKey, toIndex) {
    const key = typeof colKey === "string" ? colKey : colKey.colId;
    const sourceColumnIndex = columns.findIndex((c) => c.field === key);
    const targetColumnIndex =
      toIndex < columns.length ? toIndex : sourceColumnIndex;
    const reorderedColumns = [...columns];
    reorderedColumns.splice(
      targetColumnIndex,
      0,
      reorderedColumns.splice(sourceColumnIndex, 1)[0]
    );
    setRawColumns(reorderedColumns);
  }
  function moveColumns(columnsToMove, toIndex) {
    let sourceColumns = [];
    const reorderedColumns = [...columns];
    columns.map((c) =>
      columnsToMove.forEach((col) => {
        const key = typeof col === "string" ? col : col.colId;
        if (key === c.field) sourceColumns.push(c);
      })
    );
    let valueAtPosition = columns[toIndex];
    sourceColumns.forEach((v) =>
      reorderedColumns.splice(reorderedColumns.indexOf(v), 1)
    );
    reorderedColumns.splice(
      reorderedColumns.indexOf(valueAtPosition) + 1,
      0,
      ...sourceColumnsz
    );
    setRawColumns(reorderedColumns);
  }
  function moveColumnByIndex(fromIndex, toIndex) {
    const sourceColumnIndex = fromIndex;
    const targetColumnIndex =
      toIndex < columns.length ? toIndex : sourceColumnIndex;
    const reorderedColumns = [...columns];
    reorderedColumns.splice(
      targetColumnIndex,
      0,
      reorderedColumns.splice(sourceColumnIndex, 1)[0]
    );
    setRawColumns(reorderedColumns);
  }
  function getDisplayNameForColumn(column, location) {
    let displayNameForCol;
    columns.forEach((col) => {
      if (column.colId === col.key && location === col.idx)
        displayNameForCol = col.headerName;
    });
    return displayNameForCol;
  }
  function getDisplayedColAfter(column) {
    let columnObjects = getColumns();
    let displayedColAfterKey;
    for (let index = 0; index < columns.length; index++) {
      let col = columns[index];
      let nextCol = columns[index + 1];
      if (column.colId === col.key)
        displayedColAfterKey = nextCol.parentColumn
          ? nextCol.parentColumn.key || nextCol.parentColumn.field
          : nextCol.key;
    }
    let displayedColAfter;
    columnObjects.forEach((colObj) => {
      if (colObj.colId === displayedColAfterKey) displayedColAfter = colObj;
    });
    return displayedColAfter;
  }
  function getDisplayedColBefore(column) {
    let columnObjects = getColumns();
    let displayedColBeforeKey;
    for (let index = 0; index < columns.length; index++) {
      let col = columns[index];
      let prevCol = columns[index - 1];
      if (column.colId === col.key)
        displayedColBeforeKey = prevCol.parentColumn
          ? prevCol.parentColumn.key || prevCol.parentColumn.field
          : prevCol.key;
    }
    let displayedColBefore;
    columnObjects.forEach((colObj) => {
      if (colObj.colId === displayedColBeforeKey) displayedColBefore = colObj;
    });
    return displayedColBefore;
  }
  function getRowGroupColumns() {
    let columnObjects = getColumns();
    let rowGroupColumns = [];
    columnObjects.forEach((colObject) => {
      if (rawGroupBy?.includes(colObject.colId))
        rowGroupColumns.push(colObject);
    });
    return rowGroupColumns;
  }
  function setRowGroupColumns(colKeys) {
    rawGroupBy.length = 0;
    colKeys.forEach((colKey) => {
      typeof colKey === "string"
        ? rawGroupBy.push(colKey)
        : rawGroupBy.push(colKey.colId);
    });
    setRawColumns(raawColumns);
  }
  function addRowGroupColumn(colKey) {
    typeof colKey === "string"
      ? rawGroupBy.push(colKey)
      : rawGroupBy.push(colKey.colId);
    setRawColumns(raawColumns);
  }
  function addRowGroupColumns(colKeys) {
    colKeys.forEach((colKey) => {
      typeof colKey === "string"
        ? rawGroupBy.push(colKey)
        : rawGroupBy.push(colKey.colId);
    });
    setRawColumns(raawColumns);
  }
  function removeRowGroupColumn(colKey) {
    const key = typeof colKey === "string" ? colKey : colKey.colId;
    const indexOfKey = rawGroupBy?.findIndex((c) => c === key);
    if (indexOfKey > -1) rawGroupBy?.splice(indexOfKey, 1);
    setRawColumns(raawColumns);
  }
  function removeRowGroupColumns(colKeys) {
    colKeys.forEach((colKey) => {
      const key = typeof colKey === "string" ? colKey : colKey.colId;
      const indexOfKey = rawGroupBy?.findIndex((c) => c === key);
      if (indexOfKey > -1) rawGroupBy?.splice(indexOfKey, 1);
    });
    setRawColumns(raawColumns);
  }
  function moveRowGroupColumn(fromIndex, toIndex) {
    if (fromIndex > -1 && toIndex < rawGroupBy?.length) {
      var element = rawGroupBy[fromIndex];
      rawGroupBy.splice(fromIndex, 1);
      rawGroupBy.splice(toIndex, 0, element);
      setRawColumns(columns);
    }
  }
  function setColumnWidth(key, newWidth) {
    const colKey = typeof key === "string" ? key : key.colId;
    const newColumnWidths = new Map(columnWidths);
    newColumnWidths.set(colKey, newWidth);
    setColumnWidths(newColumnWidths);
  }
  function setColumnsWidth(newColumnWidths) {
    const newColWidths = new Map(columnWidths);
    newColumnWidths.forEach((col) => {
      const colKey = typeof col.key === "string" ? col.key : col.key.colId;
      const colWidth = col.newWidth;
      newColWidths.set(colKey, colWidth);
    });
    setColumnWidths(newColWidths);
  }
  function autoSizeColumn(key) {
    const colKey = typeof key === "string" ? key : key.colId;
    const columnIndex = columns.findIndex((col) => col.key === colKey);
    const column = columns[columnIndex];
    handleColumnResize(column, "max-content");
  }
  function autoSizeColumns(colKeys) {
    let columnObjects = getColumns();
    const { style } = gridRef.current;
    const newTemplateColumns = [...templateColumns];
    const newColumnWidths = new Map(columnWidths);
    colKeys.forEach((colKey) => {
      const key = typeof colKey === "string" ? colKey : colKey.colId;
      const index = columnObjects.findIndex((c) => c.colId === key);
      newTemplateColumns[index] = "max-content";
      style.gridTemplateColumns = newTemplateColumns.join(" ");
      const measuringCell = gridRef.current.querySelector(
        `[data-measuring-cell-key="${columns[index].key}"]`
      );
      const measuredWidth = measuringCell.getBoundingClientRect().width;
      const measuredWidthPx = `${measuredWidth}px`;
      if (newTemplateColumns[columns[index].idx] !== measuredWidthPx) {
        newTemplateColumns[columns[index].idx] = measuredWidthPx;
        style.gridTemplateColumns = newTemplateColumns.join(" ");
      }
      if (columnWidths.get(columns[index].key) === measuredWidth) return;
      newColumnWidths.set(columns[index].key, measuredWidth);
    });
    setColumnWidths(newColumnWidths);
    templateColumns = [...newTemplateColumns];
  }
  function autoSizeAllColumns() {
    const { style } = gridRef.current;
    const newTemplateColumns = [...templateColumns];
    const newColumnWidths = new Map(columnWidths);
    for (let index = 0; index < newTemplateColumns.length; index++) {
      newTemplateColumns[index] = "max-content";
      style.gridTemplateColumns = newTemplateColumns.join(" ");
      const measuringCell = gridRef.current.querySelector(
        `[data-measuring-cell-key="${columns[index].key}"]`
      );
      const measuredWidth = measuringCell.getBoundingClientRect().width;
      const measuredWidthPx = `${measuredWidth}px`;
      if (newTemplateColumns[columns[index].idx] !== measuredWidthPx) {
        newTemplateColumns[columns[index].idx] = measuredWidthPx;
        style.gridTemplateColumns = newTemplateColumns.join(" ");
      }
      if (columnWidths.get(columns[index].key) === measuredWidth) return;
      newColumnWidths.set(columns[index].key, measuredWidth);
    }
    setColumnWidths(newColumnWidths);
    templateColumns = [...newTemplateColumns];
  }
  function sizeColumnsToFit(gridWidth) {
    let columnWidths = getColumnWidths();
    let widthSum = 0;
    let colWidthValues = Array.from(columnWidths.values());
    colWidthValues.forEach((colWidth) => {
      widthSum += colWidth;
    });
    var scale = gridWidth / widthSum;
    const newColWidths = new Map(columnWidths);
    let colWidths = Array.from(columnWidths.keys());
    let sum = 0;
    for (let index = 0; index < colWidthValues.length; index++) {
      if (index === colWidthValues.length - 1) {
        let width = gridWidth - sum;
        newColWidths.set(colWidths[index], width);
      } else {
        let width = Math.round(colWidthValues[index] * scale);
        newColWidths.set(colWidths[index], width);
        sum += width;
      }
    }
    setColumnWidths(newColWidths);
  }
  function getColumnState() {
    var columns = Array.from(columnMetrics.keys());
    var colStates = [];
    columns.forEach((col) => {
      const index = sortColumns.findIndex(
        (sortCol) => sortCol.columnKey === col.key
      );
      const sort = index > -1 ? sortColumns[index].direction : null;
      const indexOfRowGroup = rawGroupBy?.findIndex((key) => key === col.key);
      const colState = {
        colId: col.key ?? `col_${col.idx}`,
        columnIndex: col.idx,
        frozen: col.frozen ?? undefined,
        width: templateColumns[col.idx],
        rowGroup: col.rowGroup ?? undefined,
        rowGroupIndex: indexOfRowGroup > -1 ? indexOfRowGroup : null,
        sort: sort,
      };
      colStates.push(colState);
    });
    return colStates;
  }
  function applyColumnState(columnState) {
    const colState = columnState.state;
    const defaultState = columnState.defaultState ?? undefined;
    const newColWidths = new Map(columnWidths);
    colState.forEach((col) => {
      const colKey = col.colId;
      if (col.frozen) {
        const index = columns.findIndex((c) => c.key === colKey);
        columns[index].frozen = col.frozen;
      }
      if (col.width !== undefined) {
        let width = isString(col.width)
          ? Number(col.width.match(/\d+/)[0])
          : col.width;
        newColWidths.set(colKey, width);
      }
      if (col.rowGroup !== undefined) {
        if (col.rowGroup) {
          const index = columns.findIndex((c) => c.key === colKey);
          columns[index].rowGroup = col.rowGroup;
          addRowGroupColumn(colKey);
        } else {
          const index = columns.findIndex((c) => c.key === colKey);
          columns[index].rowGroup = col.rowGroup;
          removeRowGroupColumn(colKey);
        }
      }
      if (col.rowGroupIndex !== undefined) {
        if (col.rowGroupIndex !== null && col.rowGroup) {
          const fromIndex = rawGroupBy.findIndex(
            (groupCol) => groupCol === colKey
          );
          const toIndex = col.rowGroupIndex;
          if (fromIndex > -1 && toIndex < rawGroupBy?.length)
            moveRowGroupColumn(fromIndex, toIndex);
        }
      }
      if (col.sort !== undefined) {
        if (col.sort !== null) {
          const index = sortColumns.findIndex(
            (sortCol) => sortCol.columnKey === colKey
          );
          if (index === -1)
            sortColumns.push({ columnKey: colKey, direction: col.sort });
          if (index > -1 && sortColumns[index].direction !== col.sort)
            sortColumns[index].direction = col.sort;
          onSortColumnsChange(sortColumns);
        } else {
          const index = sortColumns.findIndex(
            (sortCol) => sortCol.columnKey === colKey
          );
          if (index > -1) sortColumns.splice(index, 1);
          onSortColumnsChange(sortColumns);
        }
      }
      setColumnWidths(newColWidths);
    });
    if (defaultState) {
      let keysOfColumns = [];
      colState.map((col) => keysOfColumns.push(col.colId));
      columns.forEach((column) => {
        if (!keysOfColumns.includes(column.key)) {
          if (defaultState.frozen !== undefined)
            column.frozen = defaultState.frozen;
          if (defaultState.width !== undefined) {
            newColWidths.set(column.key, defaultState.width);
          }
          if (defaultState.rowGroup !== undefined) {
            if (defaultState.rowGroup) {
              const index = columns.findIndex((c) => c.key === column.key);
              columns[index].rowGroup = defaultState.rowGroup;
              addRowGroupColumn(column.key);
            } else {
              const index = columns.findIndex((c) => c.key === column.key);
              columns[index].rowGroup = defaultState.rowGroup;
              removeRowGroupColumn(column.key);
            }
          }
          if (defaultState.sort !== undefined) {
            if (defaultState.sort !== null) {
              const index = sortColumns.findIndex(
                (sortCol) => sortCol.columnKey === `${column.key}`
              );
              if (index === -1)
                sortColumns.push({
                  columnKey: `${column.key}`,
                  direction: defaultState.sort,
                });
              if (
                index > -1 &&
                sortColumns[index].direction !== defaultState.sort
              )
                sortColumns[index].direction = defaultState.sort;
              onSortColumnsChange(sortColumns);
            } else {
              const index = sortColumns.findIndex(
                (sortCol) => sortCol.columnKey === `${column.key}`
              );
              if (index > -1) sortColumns.splice(index, 1);
              onSortColumnsChange(sortColumns);
            }
          }
        }
      });
      setColumnWidths(newColWidths);
    }
    setRawColumns(columns);
  }
  function isPinning() {
    let isPinning = false;
    columns.forEach((col) => {
      if (col.frozen === true) isPinning = true;
    });
    return isPinning;
  }
  function setColumnPinned(key) {
    const colKey = typeof key === "string" ? key : key.colId;
    const columnIndex = columns.findIndex((col) => col.key === colKey);
    columns[columnIndex].frozen = true;
    setRawColumns(columns);
  }
  function setColumnsPinned(keys) {
    for (let i = 0; i < columns.length; i++) {
      for (let j = 0; j < keys.length; j++) {
        const key = typeof keys[j] === "string" ? keys[j] : keys[j].colId;
        const columnIndex = columns.findIndex((col) => col.key === key);
        if (i === columnIndex) columns[i].frozen = true;
      }
    }
    setRawColumns(columns);
  }
  function getSortColumns() {
    let columnObjects = getColumns();
    let sortColumns = [];
    columnObjects.forEach((colObj) => {
      if (colObj.sort !== null) sortColumns.push(colObj);
    });
    return sortColumns;
  }
  var columnApiObject = {
    columnModel: {
      columnDefs: raawColumns,
      rowGroupColumns: getRowGroupColumns(),
      sortColumns: getSortColumns(),
    },
  };
  Object.setPrototypeOf(columnApiObject, {
    // get columns
    getColumns,
    getColumn: (colKey) => {
      let columnObjects = getColumns();
      let colObject;
      let key = typeof colKey === "string" ? colKey : colKey.colId;
      columnObjects.forEach((columnObj) => {
        if (columnObj.colId === key) colObject = columnObj;
      });
      return colObject;
    },
    getAllGridColumns: () => getColumns(),
    //move columns
    moveColumn,
    moveColumns,
    moveColumnByIndex,
    //display names for column / column groups
    getDisplayNameForColumn,
    getDisplayedColAfter,
    getDisplayedColBefore,
    getAllDisplayedVirtualColumns: () => viewportColumns,
    getAllDisplayedColumns: () => viewportColumns,
    //row group columns
    getRowGroupColumns,
    setRowGroupColumns,
    addRowGroupColumn,
    addRowGroupColumns,
    removeRowGroupColumn,
    removeRowGroupColumns,
    moveRowGroupColumn,
    //column widths
    setColumnWidth,
    setColumnsWidth,
    autoSizeColumn,
    autoSizeColumns,
    autoSizeAllColumns,
    sizeColumnsToFit,
    //column states
    getColumnState,
    applyColumnState,
    resetColumnState: () => {
      // // groupBy = [...rawGroupBy];
      if (rawGroupBy?.length > 0) rawGroupBy.length = 0;
      if (sortColumns?.length > 0) {
        sortColumns.length = 0;
        onSortColumnsChange(sortColumns);
      }
      setRawColumns(raawColumns);
    },
    //pinning columns
    isPinning,
    setColumnPinned,
    setColumnsPinned,
  });

  const hasGroups = groupBy.length > 0 && typeof rowGrouper === "function";
  const minColIdx = hasGroups ? -1 : 0;
  const maxColIdx = rowArray1.length - 1;
  const minRowIdx = -1 - topSummaryRowsCount;
  const maxRowIdx = rows.length + bottomSummaryRowsCount - 1;
  const selectedCellIsWithinSelectionBounds =
    isCellWithinSelectionBounds(selectedPosition);
  const selectedCellIsWithinViewportBounds =
    isCellWithinViewportBounds(selectedPosition);

  /**
   * The identity of the wrapper function is stable so it won't break memoization
   */
  const [suppressRowClickSelection, setSuppressRowClickSelection] =
    useState(false);
  const handleColumnResizeLatest = useLatestFunc(handleColumnResize);
  const onSortColumnsChangeLatest = useLatestFunc(onSortColumnsChange);

  const onCellClickLatest = useLatestFunc((params) => {
    console.log("params :>> ", params);
    const row = params.data;
    const rowKey = rowKeyGetter(row);
    const newSelectedRows =
      selectedRows1 !== undefined ? Object.values(selectedRows1) : [];
    let newSelectedRows1 = [];
    if (
      rowSelection?.toLowerCase() === "single" &&
      !suppressRowClickSelection &&
      (!props.selection || (props.selection && selectedPosition.idx !== 0))
    ) {
      console.log("inrowselection :>> ", selectedRows1);
      if (selectedRows1 === undefined || !selectedRows1.has(rowKey)) {
        if (!onSelectedRowsChange1) return;
        if (selectedRows1 !== undefined)
          newSelectedRows.splice(0, newSelectedRows.length);
        newSelectedRows.push(rowKey);
        newSelectedRows1 = [row];
      } else {
        newSelectedRows.pop(rowKey);
        newSelectedRows1 = [];
      }
      onSelectedRowsChange1(new Set(newSelectedRows));
      if (typeof onSelectedRowsChange === "function")
        onSelectedRowsChange(newSelectedRows1);
    } else if (
      rowSelection?.toLowerCase() === "multiple" &&
      (!props.selection || (props.selection && selectedPosition.idx !== 0))
    ) {
      if (
        selectedRows1 === undefined ||
        params.event.ctrlKey ||
        props.rowMultiSelectWithClick
      ) {
        selectRow({
          row,
          checked:
            selectedRows1 === undefined
              ? true
              : !selectedRows1.has(rowKeyGetter(row)),
          isShiftClick: false,
        });
      } else {
        if (selectedRows1 === undefined || !selectedRows1.has(rowKey)) {
          if (!onSelectedRowsChange1) return;
          if (selectedRows1 !== undefined)
            newSelectedRows.splice(0, newSelectedRows.length);
          newSelectedRows.push(rowKey);
          newSelectedRows1 = [row];
        } else {
          newSelectedRows.pop(rowKey);
          newSelectedRows1 = [];
        }
        onSelectedRowsChange1(new Set(newSelectedRows));
        if (typeof onSelectedRowsChange === "function")
          onSelectedRowsChange(newSelectedRows1);
      }
    }
    if (onCellClick) onCellClick(params);
  });
  const onCellDoubleClickLatest = useLatestFunc(onCellDoubleClick);
  const onCellContextMenuLatest = useLatestFunc(onCellContextMenu);
  const selectRowLatest = useLatestFunc(selectRow);
  const selectAllRowsLatest = useLatestFunc(selectAllRows);
  const handleFormatterRowChangeLatest = useLatestFunc(updateRow);
  const selectViewportCellLatest = useLatestFunc(
    (row, column, enableEditor) => {
      // console.log("cccc", enableEditor);
      const rowIdx = rows.indexOf(row);
      selectCell({ rowIdx, idx: column.idx }, enableEditor);
    }
  );

  const selectGroupLatest = useLatestFunc((rowIdx) => {
    selectCell({ rowIdx, idx: -1 });
  });
  const selectHeaderCellLatest = useLatestFunc((idx) => {
    selectCell({ rowIdx: minRowIdx, idx });
  });
  const selectTopSummaryCellLatest = useLatestFunc((summaryRow, column) => {
    const rowIdx = topSummaryRows.indexOf(summaryRow);
    selectCell({ rowIdx: rowIdx + minRowIdx + 1, idx: column.idx });
  });
  const selectBottomSummaryCellLatest = useLatestFunc((summaryRow, column) => {
    const rowIdx = bottomSummaryRows.indexOf(summaryRow) + rows.length;
    selectCell({ rowIdx, idx: column.idx });
  });
  const toggleGroupLatest = useLatestFunc(toggleGroup);

  /**
   * effects
   */
  useLayoutEffect(() => {
    if (
      !selectedCellIsWithinSelectionBounds ||
      isSamePosition(selectedPosition, prevSelectedPosition.current)
    ) {
      prevSelectedPosition.current = selectedPosition;
      return;
    }

    prevSelectedPosition.current = selectedPosition;

    if (selectedPosition.idx === -1) {
      rowRef.current.focus({ preventScroll: true });
      scrollIntoView(rowRef.current);
    }
  });

  useLayoutEffect(() => {
    if (!isWidthInitialized || flexWidthViewportColumns.length === 0) return;

    setColumnWidths((columnWidths) => {
      const newColumnWidths = new Map(columnWidths);
      const grid = gridRef.current;

      for (const column of flexWidthViewportColumns) {
        const measuringCell = grid.querySelector(
          `[data-measuring-cell-key="${column.key}"]`
        );
        // Set the actual width of the column after it is rendered
        const { width } = measuringCell.getBoundingClientRect();
        newColumnWidths.set(column.key, width);
      }

      return newColumnWidths;
    });
  }, [isWidthInitialized, flexWidthViewportColumns, gridRef]);

  useImperativeHandle(ref, () => ({
    element: gridRef.current,
    scrollToColumn,
    scrollToRow(rowIdx) {
      const { current } = gridRef;
      if (!current) return;
      current.scrollTo({
        top: getRowTop(rowIdx),
        behavior: "smooth",
      });
    },
    selectCell,
    api: apiObject,
    columnApi: columnApiObject,
    node: node,
  }));

  /**
   * callbacks
   */
  const setDraggedOverRowIdx = useCallback((rowIdx) => {
    setOverRowIdx(rowIdx);
    latestDraggedOverRowIdx.current = rowIdx;
  }, []);

  /**
   * event handlers
   */
  function handleColumnResize(column, width) {
    const { style } = gridRef.current;
    const newTemplateColumns = [...templateColumns];
    newTemplateColumns[column.idx] =
      width === "max-content" ? width : `${width}px`;
    style.gridTemplateColumns = newTemplateColumns.join(" ");

    const measuringCell = gridRef.current.querySelector(
      `[data-measuring-cell-key="${column.key}"]`
    );
    const measuredWidth = measuringCell.getBoundingClientRect().width;
    const measuredWidthPx = `${measuredWidth}px`;

    // Immediately update `grid-template-columns` to prevent the column from jumping to its min/max allowed width.
    // Only measuring cells have the min/max width set for proper colSpan support,
    // which is why other cells may render at the previously set width, beyond the min/max.
    // An alternative for the above would be to use flushSync.
    // We also have to reset `max-content` so it doesn't remain stuck on `max-content`.
    if (newTemplateColumns[column.idx] !== measuredWidthPx) {
      newTemplateColumns[column.idx] = measuredWidthPx;
      style.gridTemplateColumns = newTemplateColumns.join(" ");
    }

    if (columnWidths.get(column.key) === measuredWidth) return;

    const newColumnWidths = new Map(columnWidths);
    newColumnWidths.set(column.key, measuredWidth);
    setColumnWidths(newColumnWidths);

    onColumnResize?.(column.idx, measuredWidth);
  }

  function selectRow({ row, checked, isShiftClick }) {
    if (!onSelectedRowsChange1) return;

    assertIsValidKeyGetter(rowKeyGetter);
    const newSelectedRows = new Set(selectedRows1);
    const newSelectedRows1 = selectedRows;
    if (isGroupRow(row)) {
      for (const childRow of row.childRows) {
        const rowKey = rowKeyGetter(childRow);
        if (checked) {
          newSelectedRows.add(rowKey);
          newSelectedRows1.push(childRow);
        } else {
          newSelectedRows.delete(rowKey);
          newSelectedRows1.splice(newSelectedRows1.indexOf(row), 1);
        }
      }
      onSelectedRowsChange1(newSelectedRows);
      onSelectedRowsChange(newSelectedRows1);
      return;
    }

    const rowKey = rowKeyGetter(row);
    if (checked) {
      newSelectedRows.add(rowKey);
      newSelectedRows1.push(row);
      const previousRowIdx = lastSelectedRowIdx.current;
      const rowIdx = rows.indexOf(row);
      lastSelectedRowIdx.current = rowIdx;
      if (isShiftClick && previousRowIdx !== -1 && previousRowIdx !== rowIdx) {
        const step = sign(rowIdx - previousRowIdx);
        for (let i = previousRowIdx + step; i !== rowIdx; i += step) {
          const row = rows[i];
          if (isGroupRow(row)) continue;
          newSelectedRows.add(rowKeyGetter(row));
          newSelectedRows1.push(row);
        }
      }
    } else {
      newSelectedRows.delete(rowKey);
      newSelectedRows1.splice(newSelectedRows1.indexOf(row), 1);
      lastSelectedRowIdx.current = -1;
    }

    onSelectedRowsChange1(newSelectedRows);
    onSelectedRowsChange(newSelectedRows1);
  }

  function selectAllRows(checked) {
    if (!onSelectedRowsChange1) return;
    assertIsValidKeyGetter(rowKeyGetter);
    const newSelectedRows = new Set(selectedRows1);
    const newSelectedRows1 = selectedRows;
    for (const row of rawRows) {
      const rowKey = rowKeyGetter(row);
      if (checked) {
        newSelectedRows.add(rowKey);
        if (!newSelectedRows1.includes(row)) newSelectedRows1.push(row);
      } else {
        newSelectedRows.delete(rowKey);
        newSelectedRows1.splice(newSelectedRows1.indexOf(row), 1);
      }
    }
    onSelectedRowsChange(newSelectedRows1);
    onSelectedRowsChange1(newSelectedRows);
  }

  function toggleGroup(expandedGroupId) {
    if (!onExpandedGroupIdsChange) return;
    const newExpandedGroupIds = new Set(expandedGroupIds);
    if (newExpandedGroupIds.has(expandedGroupId)) {
      newExpandedGroupIds.delete(expandedGroupId);
    } else {
      newExpandedGroupIds.add(expandedGroupId);
    }
    onExpandedGroupIdsChange(newExpandedGroupIds);
  }

  function handleKeyDown(event) {
    if (!(event.target instanceof Element)) return;
    const isCellEvent = event.target.closest(".rdg-cell") !== null;
    const isRowEvent = hasGroups && event.target === rowRef.current;
    if (!(isCellEvent || isRowEvent)) return;

    const { key, keyCode } = event;
    const { rowIdx } = selectedPosition;

    if (
      selectedCellIsWithinViewportBounds &&
      (onPaste != null || onCopy != null) &&
      isCtrlKeyHeldDown(event) &&
      !isGroupRow(rows[rowIdx]) &&
      selectedPosition.mode === "SELECT"
    ) {
      // event.key may differ by keyboard input language, so we use event.keyCode instead
      // event.nativeEvent.code cannot be used either as it would break copy/paste for the DVORAK layout
      const cKey = 67;
      const vKey = 86;
      // if (keyCode === cKey) {
      //   handleCopy();
      //   return;
      // }
      if (keyCode === vKey) {
        handlePaste();
        return;
      }
    }

    if (isRowIdxWithinViewportBounds(rowIdx)) {
      const row = rows[rowIdx];

      if (
        isGroupRow(row) &&
        selectedPosition.idx === -1 &&
        // Collapse the current group row if it is focused and is in expanded state
        ((key === leftKey && row.isExpanded) ||
          // Expand the current group row if it is focused and is in collapsed state
          (key === rightKey && !row.isExpanded))
      ) {
        event.preventDefault(); // Prevents scrolling
        toggleGroup(row.id);
        return;
      }
    }

    switch (event.key) {
      case "Escape":
        setCopiedCell(null);
        return;
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
      case "Tab":
      case "Home":
      case "End":
      case "PageUp":
      case "PageDown":
        navigate(event);
        break;
      default:
        handleCellInput(event);
        break;
    }
  }

  function handleScroll(event) {
    const { scrollTop, scrollLeft } = event.currentTarget;
    flushSync(() => {
      setScrollTop(scrollTop);
      // scrollLeft is nagative when direction is rtl
      setScrollLeft(abs(scrollLeft));
    });
    onScroll?.(event);
  }

  function getRawRowIdx(rowIdx) {
    return hasGroups ? rawRows.indexOf(rows[rowIdx]) : rowIdx;
  }

  function findCahngedKey(newObj, oldObj) {
    if (Object.keys(oldObj)?.length === 0 && Object.keys(newObj)?.length > 0)
      return newObj;
    let diff = {};
    for (const key in oldObj) {
      if (newObj[key] && oldObj[key] !== newObj[key]) {
        diff[key] = newObj[key];
      }
    }
    if (Object.keys(diff).length > 0) return Object.keys(diff);
    return [];
  }
  const [changedList, setChangedList] = useState([]);
  const [sample, setSample] = useState([]);
  useUpdateEffect(() => {
    setSample([...raawRows]);
  }, [raawRows]);
  useUpdateEffect(() => {
    setSample([...raawRows]);
  }, []);
  function updateRow(column, rowIdx, row) {
    let sampleData = raawRows;
    let sampleChanged = changedList;
    sampleChanged[rowIdx] = findCahngedKey(row, sample[rowIdx]);
    setChangedList(sampleChanged);
    sampleData[rowIdx] = row;
    setRawRows([...sampleData]);
    if (typeof onRowsChange !== "function") return;
    const rawRowIdx = getRawRowIdx(rowIdx);
    if (row === rawRows[rawRowIdx]) return;
    const updatedRows = [...rawRows];
    updatedRows[rawRowIdx] = row;
    onRowsChange(updatedRows, {
      indexes: [rawRowIdx],
      column,
    });
  }

  function commitEditorChanges() {
    if (selectedPosition.mode !== "EDIT") return;
    updateRow(
      columns[selectedPosition.idx],
      selectedPosition.rowIdx,
      selectedPosition.row
    );
  }

  function handleCopy() {
    const { idx, rowIdx } = selectedPosition;
    const sourceRow = rawRows[getRawRowIdx(rowIdx)];
    const sourceColumnKey = columns[idx].key;
    setCopiedCell({ row: sourceRow, columnKey: sourceColumnKey });
    onCopy?.({ sourceRow, sourceColumnKey });
  }

  function handlePaste() {
    if (
      !(onPaste && onRowsChange) ||
      copiedCell === null ||
      !isCellEditable(selectedPosition)
    ) {
      return;
    }

    const { idx, rowIdx } = selectedPosition;
    const targetColumn = columns[idx];
    const targetRow = rawRows[getRawRowIdx(rowIdx)];

    const updatedTargetRow = onPaste({
      sourceRow: copiedCell.row,
      sourceColumnKey: copiedCell.columnKey,
      targetRow,
      targetColumnKey: targetColumn.key,
    });

    updateRow(targetColumn, rowIdx, updatedTargetRow);
  }

  function handleCellInput(event) {
    if (!selectedCellIsWithinViewportBounds) return;
    const row = rows[selectedPosition.rowIdx];
    if (isGroupRow(row)) return;
    const { key, shiftKey } = event;

    // Select the row on Shift + Space
    if (isSelectable && shiftKey && key === " ") {
      assertIsValidKeyGetter(rowKeyGetter);
      const rowKey = rowKeyGetter(row);
      selectRow({
        row,
        checked: !selectedRows1.has(rowKey),
        isShiftClick: false,
      });
      // do not scroll
      event.preventDefault();
      return;
    }

    const column = columns4[selectedPosition.idx];
    column.editorOptions?.onCellKeyDown?.(event);
    if (event.isDefaultPrevented()) return;

    if (isCellEditable(selectedPosition) && isDefaultCellInput(event)) {
      setSelectedPosition(({ idx, rowIdx }) => ({
        idx,
        rowIdx,
        mode: "EDIT",
        row,
        originalRow: row,
      }));
    }
  }

  /**
   * utils
   */
  function isColIdxWithinSelectionBounds(idx) {
    return idx >= minColIdx && idx <= maxColIdx;
  }

  function isRowIdxWithinViewportBounds(rowIdx) {
    return rowIdx >= 0 && rowIdx < rows.length;
  }

  function isCellWithinSelectionBounds({ idx, rowIdx }) {
    return (
      rowIdx >= minRowIdx &&
      rowIdx <= maxRowIdx &&
      isColIdxWithinSelectionBounds(idx)
    );
  }

  function isCellWithinViewportBounds({ idx, rowIdx }) {
    return (
      isRowIdxWithinViewportBounds(rowIdx) && isColIdxWithinSelectionBounds(idx)
    );
  }

  function isCellEditable(position) {
    return (
      isCellWithinViewportBounds(position) &&
      isSelectedCellEditable({
        columns4,
        rows,
        selectedPosition: position,
        isGroupRow,
      })
    );
  }

  function selectCell(position, enableEditor) {
    if (!isCellWithinSelectionBounds(position)) return;
    commitEditorChanges();

    if (enableEditor && isCellEditable(position)) {
      const row = rows[position.rowIdx];
      setSelectedPosition({ ...position, mode: "EDIT", row, originalRow: row });
    } else if (isSamePosition(selectedPosition, position)) {
      // Avoid re-renders if the selected cell state is the same
      scrollIntoView(gridRef.current?.querySelector('[tabindex="0"]'));
    } else {
      setSelectedPosition({ ...position, mode: "SELECT" });
    }
    // console.log("position", position);
  }

  function scrollToColumn(idx) {
    const { current } = gridRef;
    if (!current) return;

    if (idx > lastFrozenColumnIndex) {
      const { rowIdx } = selectedPosition;
      if (!isCellWithinSelectionBounds({ rowIdx, idx })) return;
      const { clientWidth } = current;
      const column = columns[idx];
      const { left, width } = columnMetrics.get(column);
      let right = left + width;

      const colSpan = getSelectedCellColSpan({
        rows,
        topSummaryRows,
        bottomSummaryRows,
        rowIdx,
        lastFrozenColumnIndex,
        column,
        isGroupRow,
      });

      if (colSpan !== undefined) {
        const { left, width } = columnMetrics.get(
          columns[column.idx + colSpan - 1]
        );
        right = left + width;
      }

      const isCellAtLeftBoundary = left < scrollLeft + totalFrozenColumnWidth;
      const isCellAtRightBoundary = right > clientWidth + scrollLeft;
      const sign = isRtl ? -1 : 1;
      if (isCellAtLeftBoundary) {
        current.scrollLeft = (left - totalFrozenColumnWidth) * sign;
      } else if (isCellAtRightBoundary) {
        current.scrollLeft = (right - clientWidth) * sign;
      }
    }
  }

  function getNextPosition(key, ctrlKey, shiftKey) {
    const { idx, rowIdx } = selectedPosition;
    const row = rows[rowIdx];
    const isRowSelected = selectedCellIsWithinSelectionBounds && idx === -1;

    // If a group row is focused, and it is collapsed, move to the parent group row (if there is one).
    if (
      key === leftKey &&
      isRowSelected &&
      isGroupRow(row) &&
      !row.isExpanded &&
      row.level !== 0
    ) {
      let parentRowIdx = -1;
      for (let i = selectedPosition.rowIdx - 1; i >= 0; i--) {
        const parentRow = rows[i];
        if (isGroupRow(parentRow) && parentRow.id === row.parentId) {
          parentRowIdx = i;
          break;
        }
      }
      if (parentRowIdx !== -1) {
        return { idx, rowIdx: parentRowIdx };
      }
    }

    switch (key) {
      case "ArrowUp":
        return { idx, rowIdx: rowIdx - 1 };
      case "ArrowDown":
        return { idx, rowIdx: rowIdx + 1 };
      case leftKey:
        return { idx: idx - 1, rowIdx };
      case rightKey:
        return { idx: idx + 1, rowIdx };
      case "Tab":
        return { idx: idx + (shiftKey ? -1 : 1), rowIdx };
      case "Home":
        // If row is selected then move focus to the first row
        if (isRowSelected) return { idx, rowIdx: 0 };
        return { idx: 0, rowIdx: ctrlKey ? minRowIdx : rowIdx };
      case "End":
        // If row is selected then move focus to the last row.
        if (isRowSelected) return { idx, rowIdx: rows.length - 1 };
        return { idx: maxColIdx, rowIdx: ctrlKey ? maxRowIdx : rowIdx };
      case "PageUp": {
        if (selectedPosition.rowIdx === minRowIdx) return selectedPosition;
        const nextRowY =
          getRowTop(rowIdx) + getRowHeight(rowIdx) - clientHeight;
        return { idx, rowIdx: nextRowY > 0 ? findRowIdx(nextRowY) : 0 };
      }
      case "PageDown": {
        if (selectedPosition.rowIdx >= rows.length) return selectedPosition;
        const nextRowY = getRowTop(rowIdx) + clientHeight;
        return {
          idx,
          rowIdx:
            nextRowY < totalRowHeight ? findRowIdx(nextRowY) : rows.length - 1,
        };
      }
      default:
        return selectedPosition;
    }
  }

  function navigate(event) {
    const { key, shiftKey } = event;
    let mode = cellNavigationMode;
    if (key === "Tab") {
      if (
        canExitGrid({
          shiftKey,
          cellNavigationMode,
          maxColIdx,
          minRowIdx,
          maxRowIdx,
          selectedPosition,
        })
      ) {
        commitEditorChanges();
        // Allow focus to leave the grid so the next control in the tab order can be focused
        return;
      }

      mode = cellNavigationMode === "NONE" ? "CHANGE_ROW" : cellNavigationMode;
    }

    // Do not allow focus to leave
    event.preventDefault();

    const ctrlKey = isCtrlKeyHeldDown(event);
    const nextPosition = getNextPosition(key, ctrlKey, shiftKey);
    if (isSamePosition(selectedPosition, nextPosition)) return;

    const nextSelectedCellPosition = getNextSelectedCellPosition({
      columns,
      colSpanColumns,
      rows,
      topSummaryRows,
      bottomSummaryRows,
      minRowIdx,
      maxRowIdx,
      lastFrozenColumnIndex,
      cellNavigationMode: mode,
      currentPosition: selectedPosition,
      nextPosition,
      isCellWithinBounds: isCellWithinSelectionBounds,
      isGroupRow,
    });

    selectCell(nextSelectedCellPosition);
  }

  function getDraggedOverCellIdx(currentRowIdx) {
    if (draggedOverRowIdx === undefined) return;
    const { rowIdx } = selectedPosition;

    const isDraggedOver =
      rowIdx < draggedOverRowIdx
        ? rowIdx < currentRowIdx && currentRowIdx <= draggedOverRowIdx
        : rowIdx > currentRowIdx && currentRowIdx >= draggedOverRowIdx;

    return isDraggedOver ? selectedPosition.idx : undefined;
  }

  function getLayoutCssVars() {
    if (flexWidthViewportColumns.length === 0) return layoutCssVars;
    const newTemplateColumns = [...templateColumns];
    for (const column of flexWidthViewportColumns) {
      newTemplateColumns[column.idx] = column.width;
    }

    return {
      ...layoutCssVars,
      gridTemplateColumns: newTemplateColumns.join(" "),
    };
  }

  function handleFill({ columnKey, sourceRow, targetRow }) {
    return { ...targetRow, [columnKey]: sourceRow[columnKey] };
  }

  function getDragHandle(rowIdx) {
    if (
      selectedPosition.rowIdx !== rowIdx ||
      selectedPosition.mode === "EDIT" ||
      hasGroups || // drag fill is not supported when grouping is enabled
      onFill == null
    ) {
      return;
    }

    return (
      <DragHandle
        rows={rawRows}
        columns={columns}
        selectedPosition={selectedPosition}
        isCellEditable={isCellEditable}
        latestDraggedOverRowIdx={latestDraggedOverRowIdx}
        onRowsChange={onRowsChange}
        onFill={onFill ? handleFill : null}
        setDragging={setDragging}
        setDraggedOverRowIdx={setDraggedOverRowIdx}
      />
    );
  }

  function getCellEditor(rowIdx) {
    if (
      selectedPosition.rowIdx !== rowIdx ||
      selectedPosition.mode === "SELECT"
    )
      return;

    const { idx, row } = selectedPosition;
    const column = columns4[idx];
    const colSpan = getColSpan(column, lastFrozenColumnIndex, {
      type: "ROW",
      row,
    });

    const closeEditor = () => {
      setSelectedPosition(({ idx, rowIdx }) => ({
        idx,
        rowIdx,
        mode: "SELECT",
      }));
    };

    const onRowChange = (row, commitChanges) => {
      if (commitChanges) {
        updateRow(column, selectedPosition.rowIdx, row);
        closeEditor();
      } else {
        setSelectedPosition((position) => ({ ...position, row }));
      }
    };

    if (rows[selectedPosition.rowIdx] !== selectedPosition.originalRow) {
      // Discard changes if rows are updated from outside
      closeEditor();
    }

    return (
      <EditCell
        key={`${column.key}`}
        column={column}
        colSpan={colSpan}
        row={row}
        handleReorderRow={handleReorderRow}
        allrow={raawRows}
        rowIndex={rowIdx}
        api={apiObject}
        node={node}
        onRowChange={onRowChange}
        closeEditor={closeEditor}
      />
    );
  }

  function getRowViewportColumns(rowIdx) {
    const selectedColumn = columns[selectedPosition.idx];
    if (
      // idx can be -1 if grouping is enabled
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      selectedColumn !== undefined &&
      selectedPosition.rowIdx === rowIdx &&
      !viewportColumns.includes(selectedColumn)
    ) {
      // Add the selected column to viewport columns if the cell is not within the viewport
      return selectedPosition.idx > colOverscanEndIdx
        ? [...viewportColumns, selectedColumn]
        : [
            ...viewportColumns.slice(0, lastFrozenColumnIndex + 1),
            selectedColumn,
            ...viewportColumns.slice(lastFrozenColumnIndex + 1),
          ];
    }
    return viewportColumns;
  }

  var node;

  var endRowIdxForRender;
  const [RowNodes, setRowNodes] = useState();
  function forEachNode(newFunction) {
    RowNodes.forEach((data) => {
      newFunction(data);
    });
  }
  function getRowBounds(index) {
    return {
      rowTop: RowNodes[index].rowTop,
      rowHeight: RowNodes[index].rowHeight,
    };
  }
  function isRowPresent(object1) {
    let result = false;
    RowNodes.forEach((obj) => {
      if (_.isEqual(object1, obj)) {
        result = true;
      }
    });
    return result;
  }
  function getNodesInRangeForSelection(obj1, obj2) {
    let firstIndex;
    let secondIndex;
    let startIndex;
    let endIndex;
    RowNodes.map((obj, idx) => {
      if (_.isEqual(obj1, obj)) {
        firstIndex = idx;
      }
      return true;
    });
    RowNodes.map((obj, idx) => {
      if (_.isEqual(obj2, obj)) {
        secondIndex = idx;
      }
      return true;
    });
    if (firstIndex && secondIndex) {
      if (firstIndex < secondIndex) {
        startIndex = firstIndex;
        endIndex = secondIndex;
      } else {
        endIndex = firstIndex;
        startIndex = secondIndex;
      }
    } else if (firstIndex) {
      startIndex = 0;
      endIndex = firstIndex;
    } else if (secondIndex) {
      startIndex = 0;
      endIndex = secondIndex;
    }
    return RowNodes.slice(startIndex, endIndex + 1);
  }
  let getModelObject = {
    getRow: (index) => RowNodes[index],
    getRowNode: (idValue) => RowNodes.filter((data) => data.id === idValue),
    getRowCount: () => rows.length,
    getTopLevelRowCount: () => rows.length,
    getTopLevelRowDisplayedIndex: (index) => (rows[index] ? index : null),
    getRowIndexAtPixel: (pixel) => Math.floor(pixel / rowHeight),
    isRowPresent,
    getRowBounds,
    isEmpty: () => raawRows.length === 0,
    isRowsToRender: () => endRowIdxForRender !== 0,
    getNodesInRangeForSelection,
    forEachNode,
    getType: () => "clientSide",
    isLastRowIndexKnown: () => true,
    // ensureRowHeightsValid
    // start
  };
  function applyTransaction(transactionObject) {
    let newRows = rows;
    let updatedRowNodes = { added: [], updated: [], removed: [] };
    let isUpdated = 0;
    //Add Rows
    let rowIndex1 = transactionObject.addIndex + 1;
    for (let i = 0; i < transactionObject.add?.length; i++) {
      let rowIndex;
      if (rowKeyGetter) {
        rowIndex = findRowIndex(rowKeyGetter(transactionObject.add[i]));
      } else {
        rowIndex = findRowIndex(transactionObject.add[i].id);
      }
      if (rowIndex === -1) {
        if (transactionObject.addIndex) {
          if (transactionObject.addIndex > raawRows.length) return;
          const newRowNode = createNewRowNode(
            rowIndex1,
            transactionObject.add[i]
          );
          newRows.splice(rowIndex1, 0, newRowNode.data);
          LeafNodes.splice(rowIndex1, 0, newRowNode);
          updatedRowNodes.added.push(LeafNodes[rowIndex1]);
          rowIndex1++;
          isUpdated++;
        } else {
          rowIndex = transactionObject.add[i].id - 1;
          const newRowNode = createNewRowNode(
            rowIndex,
            transactionObject.add[i]
          );

          newRows.splice(rowIndex, 0, newRowNode.data);
          LeafNodes.splice(rowIndex, 0, newRowNode);
          updatedRowNodes.added.push(newRowNode);
          isUpdated++;
        }
      }
    }

    //Update Row Data
    for (let i = 0; i < transactionObject.update?.length; i++) {
      const values = Object.entries(transactionObject.update[i]);
      let rowIndex;
      if (rowKeyGetter) {
        rowIndex = findRowIndex(rowKeyGetter(transactionObject.update[i]));
      } else {
        rowIndex = findRowIndex(transactionObject.update[i].id);
      }
      for (let j = 0; j < values.length; j++) {
        const field = values[j][0];
        const value = values[j][1];
        LeafNodes[rowIndex].data[field] = value;
      }
      updatedRowNodes.updated.push(LeafNodes[rowIndex]);
      isUpdated++;
    }
    //Remove Rows
    transactionObject.remove?.sort((a, b) => (a.id < b.id ? 1 : -1));
    for (let i = 0; i < transactionObject.remove?.length; i++) {
      let rowIndex;
      if (rowKeyGetter) {
        rowIndex = findRowIndex(rowKeyGetter(transactionObject.remove[i]));
      } else {
        rowIndex = findRowIndex(transactionObject.remove[i].id);
      }

      if (rowIndex > -1) {
        newRows.splice(rowIndex, 1);
        updatedRowNodes.removed.push(LeafNodes[rowIndex]);
        LeafNodes.splice(rowIndex, 1);
        isUpdated++;
      }
    }
    if (isUpdated > 0) RowNodes[0].setDataValue("", "");
    return updatedRowNodes;
  }

  function setRowData(rowData) {
    if (rowData) {
      setRawRows(rowData);
    }
  }

  var LeafNodes = getAllLeafNodes();
  function getAllLeafNodes() {
    let leafNodes = [];
    for (let i = 0; i < raawRows.length; i++) {
      var node = {
        rowIndex: i,
        childIndex: i + 1,
        data: raawRows[i],
        rowHeight: getRowHeight(i),
        lastChild: raawRows.length === i + 1,
        firstChild: i === 0,
        id: raawRows[i].id ?? String(i),
        // selected: selectedRows.includes(i),
      };
      leafNodes.push(node);
    }
    return leafNodes;
  }

  function forEachLeafNode(callback, rowNodes) {
    let updatedLeafNodes = [];
    for (let i = 0; i < rowNodes?.length ?? LeafNodes.length; i++) {
      callback(rowNodes[i] ?? LeafNodes[i]);
      updatedLeafNodes.push(rowNodes[i].data ?? LeafNodes[i].data);
    }
    setRawRows(updatedLeafNodes);
  }
  function forEachLeafNodeAfterFilter(callback) {
    forEachLeafNode(callback, RowNodes);
  }
  function forEachLeafNodeAfterFilterAndSort(callback) {
    forEachLeafNode(callback, RowNodes);
  }
  function findRowIndex(id) {
    let index = -1;
    for (let i = 0; i < LeafNodes.length; i++) {
      if (id === LeafNodes[i].data?.id) index = LeafNodes[i].rowIndex;
    }
    return index;
  }

  function createNewRowNode(index, data) {
    const newRowNode = {
      rowIndex: index,
      childIndex: index + 1,
      data: data,
      rowHeight: getRowHeight(index),
      lastChild: LeafNodes.length === index - 1,
      firstChild: index === 0,
      id: data.id ?? String(index + 1),
    };
    return newRowNode;
  }
  function getSelectedRows() {
    return selectedRows1;
  }
  function getValue(colKey, rowNode) {
    const value = LeafNodes[rowNode.rowIndex].data[colKey];
    return value;
  }
  function selectAll(filteredRows) {
    if (!onSelectedRowsChange) return;

    assertIsValidKeyGetter(rowKeyGetter);
    const newSelectedRows = new Set(selectedRows1);
    const newSelectedRows1 = selectedRows;
    for (const row of filteredRows?.data ?? rawRows) {
      const rowKey = rowKeyGetter(row);

      newSelectedRows.add(rowKey);
      if (!newSelectedRows1.includes(row)) newSelectedRows1.push(row);
    }

    onSelectedRowsChange1(newSelectedRows);
  }
  function deselectAll(filteredRows) {
    if (!onSelectedRowsChange) return;

    assertIsValidKeyGetter(rowKeyGetter);
    let newSelectedRows = new Set(selectedRows1);
    let newSelectedRows1 = selectedRows;
    for (const row of filteredRows?.data ?? rawRows) {
      const rowKey = rowKeyGetter(row);

      newSelectedRows.delete(rowKey);
      newSelectedRows1.splice(newSelectedRows1.indexOf(row), 1);
    }
    onSelectedRowsChange1(newSelectedRows);
  }
  function getSelectedNodes() {
    let selectedNodes = new Set();
    for (let i = 0; i < RowNodes.length; i++) {
      // eslint-disable-next-line no-unused-expressions
      RowNodes[i].selected ? selectedNodes.add(RowNodes[i]) : null;
    }
    return selectedNodes;
  }
  function selectAllFiltered() {
    selectAll(RowNodes);
  }
  function deselectAllFiltered() {
    deselectAll(RowNodes);
  }
  var totalPages =
    Math.floor(raawRows.length / size) + (raawRows.length % size < 0 ? 1 : 0);
  function paginationGoToPage(pageNumberNew) {
    if (pagination) {
      if (0 < pageNumberNew && pageNumberNew <= totalPages) {
        setCurrent(pageNumberNew);
      } else if (pageNumberNew < 0) {
        setCurrent(1);
      } else if (pageNumberNew > totalPages) {
        setCurrent(totalPages);
      }
    }
  }

  function paginationGoToNextPage() {
    if (pagination && current + 1 <= totalPages) {
      setCurrent(current + 1);
    }
  }
  function paginationGoToPreviousPage() {
    if (pagination && current - 1 > 0) {
      setCurrent(current - 1);
    }
  }
  function getFocusedCell() {
    return selectedPosition.rowIdx >= 0
      ? {
          rowIndex: selectedPosition.rowIdx,
          column: columns[selectedPosition.idx],
        }
      : undefined;
  }
  function setFocusedCell(idx, key) {
    let index;
    columns.map((obj, position) => {
      if (obj.key === key) {
        index = position;
      }
      return true;
    });
    setSelectedPosition({ idx: index, rowIdx: idx, mode: "SELECT" });
  }
  function tabToNextCell() {
    let columnLength = columns.length;
    let rowsLength = rows.length;
    let idx;
    let rowIdx;
    if (selectedPosition.idx + 1 < columnLength) {
      idx = selectedPosition.idx + 1;
      rowIdx = selectedPosition.rowIdx;
    } else {
      idx = 0;
      rowIdx =
        selectedPosition.rowIdx + 1 < rowsLength
          ? selectedPosition.rowIdx + 1
          : 0;
    }
    setSelectedPosition({ idx: idx, rowIdx: rowIdx, mode: "SELECT" });
  }
  function tabToPreviousCell() {
    let columnLength = columns.length;
    let rowsLength = rows.length;
    let idx;
    let rowIdx;
    if (selectedPosition.idx - 1 >= 0) {
      idx = selectedPosition.idx - 1;
      rowIdx = selectedPosition.rowIdx;
    } else {
      idx = columnLength - 1;
      rowIdx =
        selectedPosition.rowIdx - 1 >= 0
          ? selectedPosition.rowIdx - 1
          : rowsLength - 1;
    }
    setSelectedPosition({ idx: idx, rowIdx: rowIdx, mode: "SELECT" });
  }
  function exportDataAsCsv(fileName) {
    let name = fileName ?? "ExportToCSV";
    exportToCsv(rawRows, rawColumns, name);
  }
  function exportDataAsExcel(fileName) {
    let name = fileName ?? "ExportToXlsx";
    exportToXlsx(rawRows, rawColumns, name);
  }
  function exportDataAsPdf(fileName) {
    let name = fileName ?? "ExportToPdf";
    exportToPdf(rawRows, rawColumns, name);
  }
  function isAnyFilterPresent() {
    let filterPresent = false;
    viewportColumns.forEach((obj) => {
      if (obj?.filter) filterPresent = true;
    });
    return filterPresent;
  }
  let getViewportRowsSample = useLatestFunc((rowArray) => {
    let rowElementsSample = [];
    let listOfRows = rowArray;
    let node;
    // let startRowIndex = 0;

    const { rowIdx: selectedRowIdx } = selectedPosition;

    const startRowIdx = 0;
    const endRowIdx = listOfRows.length - 1;
    for (
      let viewportRowIdx = startRowIdx;
      viewportRowIdx <= endRowIdx;
      viewportRowIdx++
    ) {
      const isRowOutsideViewport =
        viewportRowIdx === rowOverscanStartIdx - 1 ||
        viewportRowIdx === rowOverscanEndIdx + 1;
      const rowIdx = isRowOutsideViewport ? selectedRowIdx : viewportRowIdx;

      //   let rowColumns = viewportColumns;
      // const selectedColumn = columns[selectedIdx];
      // selectedIdx can be -1 if grouping is enabled
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition

      const row = listOfRows[rowIdx];
      // const gridRowStart = headerRowsCount + topSummaryRowsCount + rowIdx + 1;

      // startRowIndex++;
      // let key;
      // let isRowSelected = false;

      // key = hasGroups ? startRowIndex : rowIdx;

      function setDataValue(key, newValue) {
        let data = row;
        data[key] = newValue;
        let list = [...rawRows];
        list[rowIdx] = data;
        setRawRows(list);
      }
      function setData(newValue) {
        let list = [...rawRows];
        list[rowIdx] = newValue;
        setRawRows(list);
      }
      node = {
        rowIndex: rowIdx,
        rowTop: rowIdx * rowHeight,
        childIndex: rowIdx + 1,
        data: row,
        rowHeight: rowHeight,
        lastChild: raawRows.length === rowIdx + 1,
        firstChild: rowIdx === 0,
        id: row?.id ?? String(rowIdx),
        selected: selectedRowIdx === rowIdx,
        setDataValue,
        setData,
        parent: {
          allLeafChildren: RowNodes,
          childrenAfterFilter: afterFilter,
          childrenAfterSort: afterFilter,
        },

        expanded: rows[rowIdx]?.isExpanded,

        isSelected: () => selectedRowIdx === rowIdx,
        setSelected: () => {
          selectRow({
            row,
            checked: !selectedRows.includes(rowKeyGetter(row)),
            isShiftClick: false,
          });
        },
        isExpandable: () => {
          return rows[rowIdx]?.isExpanded;
        },
        setExpanded: (value) => {
          var expandIds = new Set(expandedGroupIds);
          let rowKey = rowKeyGetter(rows[rowIdx]);
          if (value) {
            expandIds.add(rowKey);
          } else {
            expandIds.delete(rowKey);
          }
          onExpandedGroupIdsChange(expandIds);
        },

        updateData: setData,
        // isSelected: () => isRowSelected,
      };
      rowElementsSample.push(node);
    }

    return rowElementsSample;
  });
  function setSuppressRowDrag(value) {
    if (value) {
      let sampleColumn = raawColumns.map((obj) => {
        if (obj?.rowDrag) {
          return { ...obj, rowDrag: false };
        } else {
          return obj;
        }
      });
      setRawColumns(sampleColumn);
    }
  }
  function getVerticalPixelRange() {
    return {
      top: scrollTop,
      bottom: scrollTop + document.getElementById("DataGrid").offsetHeight,
    };
  }
  function getHorizontalPixelRange() {
    return {
      left: scrollLeft,
      right: scrollLeft + document.getElementById("DataGrid").offsetWidth,
    };
  }
  function isColumnFilterPresent() {
    var sampleKeys = Object.keys(filters);
    var result = false;
    sampleKeys.forEach((value) => {
      if (value === "undefined" || value === "enabled") {
      } else {
        if (filters[value] !== "") {
          result = true;
        }
      }
    });
    return result;
  }
  const [selectedData, setSelectedData] = useState(null);
  useUpdateEffect(() => {
    if (selectedPosition.mode === "EDIT") {
      if (columns[selectedPosition.idx].cellEditor) {
        setSelectedData(selectedPosition);
      }
    }
  }, [selectedPosition]);
  function getEditingCells() {
    return { rowIndex: selectedData.rowIdx, column: columns[selectedData.idx] };
  }

  function setRowNodeExpanded(rowNode, expanded, expandParents) {
    let rData = rowNode.data;

    let item = raawGroupBy?.map((value) => {
      return rData[value];
    });
    let sample = [];
    for (let i = 1; i <= item.length; i++) {
      sample.push(item.slice(0, i).join("__"));
    }

    if (expanded && expandParents) onExpandedGroupIdsChange(new Set(sample));
  }
  const [showHorizontalScroll, setShowHorizontalScroll] = useState(false);
  const [showVerticalScroll, setShowVerticalScroll] = useState(false);
  if (showHorizontalScroll || showVerticalScroll) {
    let gridDiv = document.getElementById("DataGrid");
    if (showHorizontalScroll && showVerticalScroll) {
      gridDiv.style.overflowX = "scroll";
      gridDiv.style.overflowY = "scroll";
    } else if (showHorizontalScroll) {
      gridDiv.style.overflowX = "scroll";
      gridDiv.style.overflowY = "auto";
    } else if (showVerticalScroll) {
      gridDiv.style.overflowY = "scroll";
      gridDiv.style.overflowX = "auto";
    }
  }

  function setAlwaysShowHorizontalScroll(show) {
    setShowHorizontalScroll(show);
  }
  function setAlwaysShowVerticalScroll(show) {
    setShowVerticalScroll(show);
  }
  function Scroll(index, rowCount, position, current) {
    if (position === "top") {
      current.scrollTo({
        top: getRowTop(index),
        behavior: "smooth",
      });
    } else if (
      position === undefined ||
      position === null ||
      position === "bottom"
    ) {
      current.scrollTo({
        top: getRowTop(index - rowCount + 2),
        behavior: "smooth",
      });
    } else if (position === "middle") {
      let visibile =
        rowCount + (2 % 1) !== 0
          ? Math.floor((rowCount + 2) / 2) - 2
          : Math.floor((rowCount + 2) / 2);
      current.scrollTo({
        top: getRowTop(index - visibile),
        behavior: "smooth",
      });
    }
  }
  const div_height = document.getElementById("DataGrid")?.clientHeight;
  const rowCount = Math.floor(div_height / rowHeight);
  function ensureIndexVisible(index, position) {
    const { current } = gridRef;

    if (!current) return;
    Scroll(index, rowCount, position, current);
  }

  function ensureNodeVisible(rowNode, position) {
    const { current } = gridRef;

    let index;
    if (rowNode.rowIndex) {
      index = rowNode.rowIndex;
    } else {
      rows?.map((obj, idx) => {
        if (JSON.stringify(rowNode) === JSON.stringify(obj)) {
          index = idx;
        }
        return true;
      });
    }
    if (!current) return;
    Scroll(index, rowCount, position, current);
  }

  function ensureColumnVisible(key, position) {
    let columnsValue = raawColumns.map((data) => {
      return Object.values(data);
    });
    let index;
    if (typeof key === "string") {
      columnsValue.map((data, idx) => {
        if (data.includes(key)) {
          index = idx;
        }
      });
    }

    scrollToColumn(index);
  }

  var apiObject = {
    getColumnDefs: () => rawColumns,
    setColumnDefs: (columns) => setRawColumns(columns),
    setRowData: setRowData,
    getRowNode: (value) => RowNodes[value],
    setHeaderHeight: (height) => setHeaderHeightFromRef(height),
    getDisplayedRowCount: () => rawRows.length,
    getDisplayedRowAtIndex: (index) => rawRows[index],
    getFirstDisplayedRow: () => rawRows[0],
    getLastDisplayedRow: () => raawRows[raawRows.length - 1],
    getModel: () => getModelObject,
    forEachNode,
    forEachLeafNode,
    forEachLeafNodeAfterFilter,
    forEachLeafNodeAfterFilterAndSort,
    getSelectedNodes,
    applyTransaction,
    getSelectedRows,
    getValue: (colKey, rowNode) => {
      return LeafNodes[rowNode.rowIndex].data[colKey];
    },
    selectAll: selectAll,
    deselectAll: deselectAll,
    selectAllFiltered,
    deselectAllFiltered,
    getRenderedNodes: () => renderedRowNodes,
    setPagination: (value) => setPagination(value),
    paginationIsLastPageFound: () => true,
    paginationGetPageSize: () => (pagination ? size : raawRows.length),
    paginationSetPageSize: (newPageSize) =>
      pagination ? setSize(newPageSize) : null,
    paginationGetCurrentPage: () => current - 1,
    paginationGetTotalPages: () =>
      Math.floor(raawRows.length / size) + (raawRows.length % size < 0 ? 1 : 0),
    paginationGetRowCount: () => (pagination ? raawRows.length : 0),
    paginationGoToPage: paginationGoToPage,
    paginationGoToNextPage: paginationGoToNextPage,
    paginationGoToPreviousPage: paginationGoToPreviousPage,
    paginationGoToFirstPage: () => (pagination ? setCurrent(1) : null),
    paginationGoToLastPage: () => (pagination ? setCurrent(totalPages) : null),
    rowModel: {
      rowsToDisplay: RowNodes,
      rootNode: {
        allLeafChildren: getViewportRowsSample(raawRows),
        childrenAfterFilter: getViewportRowsSample(rows),
        childrenAfterSort: getViewportRowsSample(rows),
      },
      columnModel: { columnDefs: rawColumns, displayedColumns: columns },
      nodeManager: { allNodesMap: getViewportRowsSample(raawRows) },
      csvCreator: { exportDataAsCsv: exportDataAsCsv },
    },
    getFocusedCell: getFocusedCell,
    setFocusedCell: setFocusedCell,
    clearFocusedCell: () => setSelectedPosition(initialPosition),
    tabToNextCell: tabToNextCell,
    tabToPreviousCell: tabToPreviousCell,
    exportDataAsCsv: exportDataAsCsv,
    exportDataAsExcel: exportDataAsExcel,
    exportDataAsPdf: exportDataAsPdf,
    setDefaultColDef: (value) =>
      setDefaultColumnDef({ ...defaultColumnDef, ...value }),
    isAnyFilterPresent: isAnyFilterPresent,
    expandAll: () => setExpandAll(true),
    collapseAll: () => setExpandAll(false),
    getFilterModel: () => filters,
    setFilterModel: (value) => setFilters({ ...filters, ...value }),
    destroyFilter: (key) => {
      const sample = filters;
      // delete sample[key];
      setFilters({ ...sample });
    },
    setSuppressRowDrag,
    getVerticalPixelRange,
    getHorizontalPixelRange,
    isColumnFilterPresent,
    setSuppressRowClickSelection: (value) =>
      setSuppressRowClickSelection(value),
    getEditingCells,
    setRowNodeExpanded,
    setAlwaysShowHorizontalScroll,
    setAlwaysShowVerticalScroll,
    ensureIndexVisible,
    ensureNodeVisible,
    ensureColumnVisible,
  };

  ///////////  start
  if (onGridReady) {
    onGridReady({
      api: apiObject,
      columnApi: columnApiObject,
      type: "gridReady",
    });
  }

  useUpdateEffect(() => {
    setAfterFilter(getViewportRowsSample(rows));
  }, [rows, getViewportRowsSample]);

  useUpdateEffect(() => {
    setRowNodes(getViewportRowsSample(raawRows));
  }, [expandedGroupIds, expandAll, raawRows, getViewportRowsSample]);

  /////
  var renderedRowNodes = [];
  function getViewportRows() {
    let node;
    const rowElements = [];
    let startRowIndex = 0;

    const { idx: selectedIdx, rowIdx: selectedRowIdx } = selectedPosition;

    const startRowIdx =
      selectedCellIsWithinViewportBounds && selectedRowIdx < rowOverscanStartIdx
        ? rowOverscanStartIdx - 1
        : rowOverscanStartIdx;
    const endRowIdx =
      selectedCellIsWithinViewportBounds && selectedRowIdx > rowOverscanEndIdx
        ? rowOverscanEndIdx + 1
        : rowOverscanEndIdx;
    endRowIdxForRender = endRowIdx;
    for (
      let viewportRowIdx = startRowIdx;
      viewportRowIdx <= endRowIdx;
      viewportRowIdx++
    ) {
      const isRowOutsideViewport =
        viewportRowIdx === rowOverscanStartIdx - 1 ||
        viewportRowIdx === rowOverscanEndIdx + 1;
      const rowIdx = isRowOutsideViewport ? selectedRowIdx : viewportRowIdx;

      let rowColumns = viewportColumns;
      const selectedColumn = columns4[selectedIdx];
      // selectedIdx can be -1 if grouping is enabled
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (selectedColumn !== undefined) {
        if (isRowOutsideViewport) {
          // if the row is outside the viewport then only render the selected cell
          rowColumns = [selectedColumn];
        } else {
          // if the row is within the viewport and cell is not, add the selected column to viewport columns
          rowColumns = regroupArray(merged);
        }
      }

      const row = rows[rowIdx];

      const gridRowStart = headerRowsCount + topSummaryRowsCount + rowIdx + 1;
      if (isGroupRow(row)) {
        ({ startRowIndex } = row);
        const isGroupRowSelected =
          isSelectable &&
          row.childRows.every((cr) => selectedRows1?.has(rowKeyGetter(cr)));

        rowElements.push(
          <GroupRowRenderer
            // aria-level is 1-based
            aria-level={row.level + 1}
            aria-setsize={row.setSize}
            // aria-posinset is 1-based
            aria-posinset={row.posInSet + 1}
            // aria-rowindex is 1 based
            aria-rowindex={
              headerRowsCount + topSummaryRowsCount + startRowIndex + 1
            }
            aria-selected={isSelectable ? isGroupRowSelected : undefined}
            key={row.id}
            id={row.id}
            groupKey={row.groupKey}
            viewportColumns={regroupArray(merged)}
            childRows={row.childRows}
            rowIdx={rowIdx}
            row={row}
            rowArray={columns5}
            gridRowStart={gridRowStart}
            height={getRowHeight(rowIdx)}
            level={row.level}
            isExpanded={row.isExpanded}
            selectedCellIdx={
              selectedRowIdx === rowIdx ? selectedIdx : undefined
            }
            isRowSelected={isGroupRowSelected}
            selectGroup={selectGroupLatest}
            toggleGroup={toggleGroupLatest}
          />
        );
        continue;
      }

      startRowIndex++;
      let key;
      let isRowSelected = false;
      if (typeof rowKeyGetter === "function") {
        key = rowKeyGetter(row);
        isRowSelected = selectedRows1?.has(key) ?? false;
      } else {
        key = hasGroups ? startRowIndex : rowIdx;
      }

      function setDataValue(key, newValue) {
        let data = row;
        data[key] = newValue;
        let list = [...rawRows];
        list[rowIdx] = data;
        setRawRows(list);
      }
      function setData(newValue) {
        let list = [...rawRows];
        list[rowIdx] = newValue;
        setRawRows(list);
      }
      node = {
        rowIndex: rowIdx,
        rowTop: rowHeight * rowIdx,
        childIndex: rowIdx + 1,
        data: row,
        rowHeight: rowHeight,
        lastChild: raawRows.length === rowIdx + 1,
        firstChild: rowIdx === 0,
        id: row?.id ?? String(rowIdx),
        selected: selectedRowIdx === rowIdx,
        setDataValue,
        setData,
        parent: {
          allLeafChildren: RowNodes,
          childrenAfterFilter: afterFilter,
          childrenAfterSort: afterFilter,
        },
        updateData: setData,
        expanded: rows[rowIdx]?.isExpanded,
        isSelected: () => selectedRowIdx === rowIdx,
        setSelected: () => {
          selectRow({
            row,
            checked: !selectedRows.includes(rowKeyGetter(row)),
            isShiftClick: false,
          });
        },
        isExpandable: () => {
          return rows[rowIdx]?.isExpanded;
        },
        setExpanded: (value) => {
          var expandIds = new Set(expandedGroupIds);
          let rowKey = rowKeyGetter(rows[rowIdx]);
          if (value) {
            expandIds.add(rowKey);
          } else {
            expandIds.delete(rowKey);
          }
          onExpandedGroupIdsChange(expandIds);
        },
      };
      renderedRowNodes.push(node);
      rowElements.push(
        rowRenderer(key, {
          // aria-rowindex is 1 based
          "aria-rowindex":
            headerRowsCount +
            topSummaryRowsCount +
            (hasGroups ? startRowIndex : rowIdx) +
            1,
          "aria-selected": isSelectable ? isRowSelected : undefined,
          valueChangedCellStyle,
          previousData: changedList,
          totalColumns: columns.length,
          rowIdx,
          rows,
          row,
          headerheight: headerheight, //need to be added
          selectedCellRowStyle,
          api: apiObject,
          columnApi: columnApiObject,
          node,
          viewportColumns: regroupArray(merged),
          isRowSelected,
          onRowClick: onRowClick,
          onCellClick: onCellClickLatest,
          onCellDoubleClick: onCellDoubleClickLatest,
          onCellContextMenu: onCellContextMenuLatest,
          onRowDoubleClick: onRowDoubleClick,
          rowClass,
          gridRowStart,
          rowArray: columns4,
          height: getRowHeight(rowIdx),
          copiedCellIdx:
            copiedCell !== null && copiedCell.row === row
              ? columns.findIndex((c) => c.key === copiedCell.columnKey)
              : undefined,
          selectedCellIdx: selectedRowIdx === rowIdx ? selectedIdx : undefined,
          draggedOverCellIdx: getDraggedOverCellIdx(rowIdx),
          setDraggedOverRowIdx: isDragging ? setDraggedOverRowIdx : undefined,
          lastFrozenColumnIndex,
          onRowChange: handleFormatterRowChangeLatest,
          selectCell: selectViewportCellLatest,
          selectedCellDragHandle: getDragHandle(rowIdx),
          selectedCellEditor: getCellEditor(rowIdx),
          handleReorderRow: handleReorderRow,
          subColumn,
        })
      );
    }
    return rowElements;
  }

  // Reset the positions if the current values are no longer valid. This can happen if a column or row is removed
  if (selectedPosition.idx > maxColIdx || selectedPosition.rowIdx > maxRowIdx) {
    setSelectedPosition(initialPosition);
    setDraggedOverRowIdx(undefined);
  }

  let templateRows = `${headerRowHeight}px`;

  if (topSummaryRowsCount > 0) {
    templateRows += ` repeat(${topSummaryRowsCount}, ${summaryRowHeight}px)`;
  }
  if (rows.length > 0) {
    templateRows += gridTemplateRows;
  }
  if (bottomSummaryRowsCount > 0) {
    templateRows += ` repeat(${bottomSummaryRowsCount}, ${summaryRowHeight}px)`;
  }

  const isGroupRowFocused =
    selectedPosition.idx === -1 && selectedPosition.rowIdx !== -2;
  useUpdateEffect(() => {
    if (paginationAutoPageSize) {
      if (raawRows.length <= 500) {
        setSize(20);
      } else if (1000 >= raawRows.length && raawRows.length > 500) {
        setSize(30);
      } else {
        setSize(40);
      }
    }
  }, [raawRows, paginationAutoPageSize]);
  useUpdateEffect(() => {
    if (paginationAutoPageSize) {
      if (raawRows.length <= 500) {
        setSize(20);
      } else if (1000 >= raawRows.length && raawRows.length > 500) {
        setSize(30);
      } else {
        setSize(40);
      }
    }
  }, [raawRows, paginationAutoPageSize]);

  useUpdateEffect(() => {
    const target = document.getElementById("DataGrid");
    if (props.restriction?.copy) {
      target.addEventListener("copy", (event) => {
        event.preventDefault();
      });
    }
    if (props.restriction?.paste) {
      target.addEventListener("paste", (event) => {
        event.preventDefault();
      });
    }

    return (
      target?.removeEventListener("copy", () => {}),
      target?.removeEventListener("paste", () => {})
    );
  }, [props.restriction?.paste, props.restriction?.copy]);
  const toolbarClassname = css`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-block-end: 8px;
  `;
  const jumpnext = document.getElementsByClassName("rc-pagination-jump-next");
  if (jumpnext) {
    jumpnext[0]?.setAttribute("title", "");
  }
  const jumpprev = document.getElementsByClassName("rc-pagination-jump-prev");
  if (jumpprev) {
    jumpprev[0]?.setAttribute("title", "");
  }

  return (
    <>
      {props.export && (
        <div className={toolbarClassname}>
          {props.export.csvFileName && (
            <ExportButton
              onExport={() => exportDataAsCsv(props.export.csvFileName)}
            >
              Export to CSV
            </ExportButton>
          )}
          {props.export.excelFileName && (
            <ExportButton
              onExport={() => exportDataAsExcel(props.export.excelFileName)}
            >
              Export to XSLX
            </ExportButton>
          )}
          {props.export.pdfFileName && (
            <ExportButton
              onExport={() => exportDataAsPdf(props.export.pdfFileName)}
            >
              Export to PDF
            </ExportButton>
          )}
        </div>
      )}
      <div
        id="DataGrid"
        role={hasGroups ? "treegrid" : "grid"}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-multiselectable={isSelectable ? true : undefined}
        aria-colcount={columns.length}
        aria-rowcount={headerRowsCount + rowsCount + summaryRowsCount}
        className={clsx(
          rootClassname,
          {
            [viewportDraggingClassname]: isDragging,
          },
          className,
          enableFilter && filterContainerClassname
        )}
        style={{
          ...style,

          // set scrollPadding to correctly position non-sticky cells after scrolling
          scrollPaddingInlineStart:
            selectedPosition.idx > lastFrozenColumnIndex
              ? `${totalFrozenColumnWidth}px`
              : undefined,

          scrollPaddingBlock:
            selectedPosition.rowIdx >= 0 &&
            selectedPosition.rowIdx < rows.length
              ? `${
                  headerRowHeight + topSummaryRowsCount * summaryRowHeight
                }px ${bottomSummaryRowsCount * summaryRowHeight}px`
              : undefined,

          gridTemplateRows: templateRows,
          "--rdg-header-row-height": `${rowHeight}px`,
          "--rdg-summary-row-height": `${summaryRowHeight}px`,
          "--rdg-sign": isRtl ? -1 : 1,
          ...getLayoutCssVars(),
        }}
        dir={direction}
        ref={gridRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        data-testid={testId}
      >
        {/* extra div is needed for row navigation in a treegrid */}
        {hasGroups && (
          <div
            ref={rowRef}
            tabIndex={isGroupRowFocused ? 0 : -1}
            className={clsx(focusSinkClassname, {
              [rowSelected]: isGroupRowFocused,
              [rowSelectedWithFrozenCell]:
                isGroupRowFocused && lastFrozenColumnIndex !== -1,
            })}
            style={{
              gridRowStart: selectedPosition.rowIdx + 2,
            }}
            onKeyDown={handleKeyDown}
          />
        )}
        <FilterContext.Provider value={filters}>
          <DataGridDefaultComponentsProvider value={defaultGridComponents}>
            <HeaderRow
              rows={rawRows}
              columns={regroupArray(merged)}
              headerData={columns}
              sortCol={columns4}
              selectedPosition={selectedPosition}
              handleReorderColumn={handleReorderColumn}
              selectedCellHeaderStyle={selectedCellHeaderStyle}
              onColumnResize={handleColumnResizeLatest}
              allRowsSelected={allRowsSelected}
              arrayDepth={arrayDepth}
              onAllRowsSelectionChange={selectAllRowsLatest}
              sortColumns={sortColumns}
              onSortColumnsChange={onSortColumnsChangeLatest}
              lastFrozenColumnIndex={lastFrozenColumnIndex}
              selectedCellIdx={
                selectedPosition.rowIdx === minRowIdx
                  ? selectedPosition.idx
                  : undefined
              }
              selectCell={selectHeaderCellLatest}
              shouldFocusGrid={!selectedCellIsWithinSelectionBounds}
              direction={direction}
              headerheight={headerheight}
              headerRowHeight={rawHeaderRowHeight}
              rowArray={rowArray}
              cellHeight={headerRowHeight}
              setFilters={setFilters}
              setFilterType={setFilterType}
              ChildColumnSetup={ChildColumnSetup}
            />
            {rows.length === 0 && noRowsFallback ? (
              noRowsFallback
            ) : (
              <>
                {topSummaryRows?.map((row, rowIdx) => {
                  const gridRowStart = headerRowsCount + rowIdx + 1;
                  const summaryRowIdx = rowIdx + minRowIdx + 1;
                  const isSummaryRowSelected =
                    selectedPosition.rowIdx === summaryRowIdx;
                  const top = headerRowHeight + summaryRowHeight * rowIdx;

                  return (
                    <SummaryRow
                      aria-rowindex={gridRowStart}
                      // rome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      key={rowIdx}
                      rowIdx={rowIdx}
                      gridRowStart={gridRowStart}
                      row={row}
                      top={top}
                      bottom={undefined}
                      lastTopRowIdx={topSummaryRowsCount - 1}
                      viewportColumns={getRowViewportColumns(summaryRowIdx)}
                      lastFrozenColumnIndex={lastFrozenColumnIndex}
                      selectedCellIdx={
                        isSummaryRowSelected ? selectedPosition.idx : undefined
                      }
                      selectCell={selectTopSummaryCellLatest}
                    />
                  );
                })}

                <RowSelectionChangeProvider value={selectRowLatest}>
                  {getViewportRows(rowArray)}
                </RowSelectionChangeProvider>

                {bottomSummaryRows?.map((row, rowIdx) => {
                  const gridRowStart =
                    headerRowsCount +
                    topSummaryRowsCount +
                    rows.length +
                    rowIdx +
                    1;
                  const summaryRowIdx = rows.length + rowIdx;
                  const isSummaryRowSelected =
                    selectedPosition.rowIdx === summaryRowIdx;
                  const top =
                    clientHeight > totalRowHeight
                      ? gridHeight -
                        summaryRowHeight * (bottomSummaryRows.length - rowIdx)
                      : undefined;
                  const bottom =
                    top === undefined
                      ? summaryRowHeight *
                        (bottomSummaryRows.length - 1 - rowIdx)
                      : undefined;

                  return (
                    <>
                      <SummaryRow
                        aria-rowindex={
                          headerRowsCount +
                          topSummaryRowsCount +
                          rowsCount +
                          rowIdx +
                          1
                        }
                        // rome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        key={rowIdx}
                        rowIdx={rowIdx}
                        gridRowStart={gridRowStart}
                        row={row}
                        top={top}
                        bottom={bottom}
                        lastTopRowIdx={undefined}
                        viewportColumns={getRowViewportColumns(summaryRowIdx)}
                        lastFrozenColumnIndex={lastFrozenColumnIndex}
                        selectedCellIdx={
                          isSummaryRowSelected
                            ? selectedPosition.idx
                            : undefined
                        }
                        selectCell={selectBottomSummaryCellLatest}
                        selectedRows={selectedRows}
                      />
                    </>
                  );
                })}
              </>
            )}

            {/* render empty cells that span only 1 column so we can safely measure column widths, regardless of colSpan */}
            {renderMeasuringCells(viewportColumns)}
          </DataGridDefaultComponentsProvider>
        </FilterContext.Provider>
        {createPortal(
          <div dir={direction}>
            <ContextMenu id="grid-context-menu" rtl={direction === "rtl"}>
              {contextMenuItems.map((item) =>
                item.subMenu?.length > 0 ? (
                  <SubMenu title={item.name} key={item.name}>
                    {item.subMenu.map((subItem) => (
                      <MenuItem onClick={subItem.action} key={subItem.name}>
                        {subItem.name}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem onClick={item.action} key={item.name}>
                    {item.name}
                  </MenuItem>
                )
              )}
            </ContextMenu>
          </div>,
          document.body
        )}
      </div>
      {(pagination || showSelectedRows) && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {showSelectedRows ? (
            <div
              className="footer-bottom"
              style={{
                width: "25%",
                height: 25,
                backgroundColor: "#f8f8f8",
                color: "black",
                fontSize: 12,
                paddingRight: 15,
                fontWeight: "bold",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              {`Selected : ${selectedRows.length}`}
            </div>
          ) : undefined}
          {pagination && !suppressPagination && (
            <Pagination
              className="pagination-data"
              showTotal={(total, range) =>
                `Showing ${range[0]}-${range[1]} of ${total}`
              }
              onChange={PaginationChange}
              total={rawRows.length}
              current={current}
              pageSize={size}
              showSizeChanger={false}
              itemRender={PrevNextArrow}
              onShowSizeChange={PerPageChange}
            />
          )}
        </div>
      )}
    </>
  );
}

function isSamePosition(p1, p2) {
  return p1.idx === p2.idx && p1.rowIdx === p2.rowIdx;
}

export default forwardRef(DataGrid);
