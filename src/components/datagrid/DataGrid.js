import React, {
  forwardRef,
  useState,
  useRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { flushSync } from "react-dom";
import clsx from "clsx";
import { groupBy as rowGrouper, _ } from "lodash";
import { createPortal } from "react-dom";
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
    groupBy: rawGroupBy,
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
    frameworkComponents,
    ...rest
  } = props;

  /**
   * defaults
   */

  const [selectedRows1, onSelectedRowsChange1] = useState();
  selectedRows = selectedRows ? selectedRows : [];
  const selection = rest.selection && SelectColumn;
  raawColumns = rest.selection ? [selection, ...raawColumns] : raawColumns;

  const enableColumnSort = raawColumns
    ?.map((i) => i.sortable === true)
    .includes(true);
  const enableFilter = raawColumns
    ?.map((i) => i.filter === true)
    .includes(true);
  const contextMenuItems =
    getContextMenuItems !== undefined ? getContextMenuItems() : [];
  function contextMenuRowRenderer(key, props) {
    return (
      <ContextMenuTrigger
        key={key}
        id="grid-context-menu"
        collect={() => ({ rowIdx: props.rowIdx })}>
        <RowComponent {...props} />
      </ContextMenuTrigger>
    );
  }
  //  console.log("enableFilter", enableFilter);
  const defaultComponents = useDefaultComponents();
  const rowHeight = rawRowHeight ?? 24;
  const headerWithFilter = enableFilter ? 70 : undefined;
  const headerRowHeight =
    headerHeightFromRef ??
    rawHeaderRowHeight ??
    headerWithFilter ??
    (typeof rowHeight === "number" ? rowHeight : 24);
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
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [columnWidths, setColumnWidths] = useState(() => new Map());
  const [selectedPosition, setSelectedPosition] = useState(initialPosition);
  const [copiedCell, setCopiedCell] = useState(null);
  const [isDragging, setDragging] = useState(false);
  const [draggedOverRowIdx, setOverRowIdx] = useState(undefined);
  const [sortColumns, setSortColumns] = useState([]);
  const [rawRows, setRawRows] = useState(raawRows);
  const [rawColumns, setRawColumns] = useState(
    serialNumber ? [SerialNumberColumn, ...raawColumns] : raawColumns
  );
  const [headerHeightFromRef, setHeaderHeightFromRef] = useState();
  const onSortColumnsChange = (sortColumns) => {
    setSortColumns(sortColumns.slice(-1));
  };
  var defaultFilters = {};
  rawColumns?.map((i) => (defaultFilters[i.key] = ""));

  const [filters, setFilters] = useState({ ...defaultFilters, enabled: true });

  const sortedRows = useMemo(() => {
    const asArray = Object.entries(filters);
    const keys = asArray.filter(([key, value]) => value.length > 0);
    const filteredRows = filterFunction(keys);
    if (sortColumns.length === 0) return filteredRows;
    const { columnKey, direction } = sortColumns[0];
    let sortedRows = filteredRows;
    sortedRows = sortedRows.sort((a, b) =>
      typeof a[columnKey] == "number"
        ? a[columnKey] - b[columnKey]
        : a[columnKey].localeCompare(b[columnKey])
    );
    return direction === "DESC" ? sortedRows.reverse() : sortedRows;
  }, [raawRows, sortColumns, filters]);

  function filterFunction(props) {
    return raawRows?.filter(function (val) {
      for (var i = 0; i < props.length; i++)
        if (!val[props[i][0]].includes(props[i][1])) return false;
      return true;
    });
  }

  useEffect(() => {
    return setRawRows(sortedRows);
  });

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
    rawColumns,
    columnWidths,
    scrollLeft,
    viewportWidth: gridWidth,
    defaultColumnOptions,
    rawGroupBy: rowGrouper ? rawGroupBy : undefined,
    enableVirtualization,
    frameworkComponents,
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
    rowHeight,
    clientHeight,
    scrollTop,
    expandedGroupIds,
    enableVirtualization,
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

  const hasGroups = groupBy.length > 0 && typeof rowGrouper === "function";
  const minColIdx = hasGroups ? -1 : 0;
  const maxColIdx = columns.length - 1;
  const minRowIdx = -1 - topSummaryRowsCount;
  const maxRowIdx = rows.length + bottomSummaryRowsCount - 1;
  const selectedCellIsWithinSelectionBounds =
    isCellWithinSelectionBounds(selectedPosition);
  const selectedCellIsWithinViewportBounds =
    isCellWithinViewportBounds(selectedPosition);

  /**
   * The identity of the wrapper function is stable so it won't break memoization
   */
  const handleColumnResizeLatest = useLatestFunc(handleColumnResize);
  const onSortColumnsChangeLatest = useLatestFunc(onSortColumnsChange);
  const onRowClickLatest = useLatestFunc(onRowClick);
  const onRowDoubleClickLatest = useLatestFunc(onRowDoubleClick);
  const selectRowLatest = useLatestFunc(selectRow);
  const selectAllRowsLatest = useLatestFunc(selectAllRows);
  const handleFormatterRowChangeLatest = useLatestFunc(updateRow);
  const selectViewportCellLatest = useLatestFunc(
    (row, column, enableEditor) => {
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
    node,
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
      if (keyCode === cKey) {
        handleCopy();
        return;
      }
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

  function updateRow(column, rowIdx, row) {
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

    const column = columns[selectedPosition.idx];
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
  // console.log("headerRowHeight", headerRowHeight);

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
        columns,
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
    const column = columns[idx];
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
        key={column.key}
        column={column}
        colSpan={colSpan}
        row={row}
        handleReorderRow={handleReorderRow}
        allrow={rows}
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
  var RowNodes = [];
  var endRowIdxForRender;

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
    RowNodes.map((obj) => {
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
    });
    RowNodes.map((obj, idx) => {
      if (_.isEqual(obj2, obj)) {
        secondIndex = idx;
      }
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
  var getModelObject = {
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
        lastChild: raawRows.length == i + 1,
        firstChild: i == 0,
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
    return selectedRows;
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
  var apiObject = {
    getColumnDefs: () => rawColumns,
    setColumnDefs: (columns) => setRawColumns(columns),
    setRowData: setRowData,
    getRowNodes: (value) => RowNodes[value],
    setHeaderHeight: (height) => setHeaderHeightFromRef(height),
    getDisplayedRowCount: rawRows.length,
    getDisplayedRowAtIndex: (index) => rawRows[index],
    getFirstDisplayedRow: rawRows[0],
    getLastDisplayedRow: raawRows[raawRows.length - 1],
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
  };

  function getViewportRows() {
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
      const selectedColumn = columns[selectedIdx];
      // selectedIdx can be -1 if grouping is enabled
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (selectedColumn !== undefined) {
        if (isRowOutsideViewport) {
          // if the row is outside the viewport then only render the selected cell
          rowColumns = [selectedColumn];
        } else {
          // if the row is within the viewport and cell is not, add the selected column to viewport columns
          rowColumns = getRowViewportColumns(rowIdx);
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
            viewportColumns={rowColumns}
            childRows={row.childRows}
            rowIdx={rowIdx}
            row={row}
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
        //console.log(row);
        let data = row;
        data[key] = newValue;
        let list = [...rawRows];
        list[rowIdx] = data;
        //console.log("newList", list);
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
        id: row.id ?? String(rowIdx),
        selected: selectedRowIdx === rowIdx,
        setDataValue,
        setData,
        parent: { allLeafChildren: RowNodes },
        updateData: setData,
        isSelected: () => isRowSelected,
      };
      RowNodes.push(node);

      rowElements.push(
        rowRenderer(key, {
          // aria-rowindex is 1 based
          "aria-rowindex":
            headerRowsCount +
            topSummaryRowsCount +
            (hasGroups ? startRowIndex : rowIdx) +
            1,
          "aria-selected": isSelectable ? isRowSelected : undefined,
          totalColumns: columns.length,
          rowIdx,
          rows,
          row,
          selectedCellRowStyle,
          api: apiObject,
          node,
          viewportColumns: rowColumns,
          isRowSelected,
          onRowClick: onRowClickLatest,
          onRowDoubleClick: onRowDoubleClickLatest,
          rowClass,
          gridRowStart,
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

  useEffect(() => {
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
  }, []);
  const toolbarClassname = css`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-block-end: 8px;
  `;
  return (
    <>
      {props.export && (
        <div className={toolbarClassname}>
          <ExportButton
            onExport={() =>
              exportToCsv(<DataGrid {...props} />, "DataGrid.csv")
            }>
            Export to CSV
          </ExportButton>
          <ExportButton
            onExport={() =>
              exportToXlsx(<DataGrid {...props} />, "DataGrid.xlsx")
            }>
            Export to XSLX
          </ExportButton>
          <ExportButton
            onExport={() =>
              exportToPdf(<DataGrid {...props} />, "DataGrid.pdf")
            }>
            Export to PDF
          </ExportButton>
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
          "--rdg-header-row-height": `${headerRowHeight}px`,
          "--rdg-summary-row-height": `${summaryRowHeight}px`,
          "--rdg-sign": isRtl ? -1 : 1,
          ...getLayoutCssVars(),
        }}
        dir={direction}
        ref={gridRef}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        data-testid={testId}>
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
              columns={getRowViewportColumns(-1)}
              selectedPosition={selectedPosition}
              handleReorderColumn={handleReorderColumn}
              selectedCellHeaderStyle={selectedCellHeaderStyle}
              onColumnResize={handleColumnResizeLatest}
              allRowsSelected={allRowsSelected}
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
              setFilters={setFilters}
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
                  {getViewportRows()}
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
                  <SubMenu title={item.name}>
                    {item.subMenu.map((subItem) => (
                      <MenuItem onClick={subItem.action}>
                        {subItem.name}
                      </MenuItem>
                    ))}
                  </SubMenu>
                ) : (
                  <MenuItem onClick={item.action}>{item.name}</MenuItem>
                )
              )}
            </ContextMenu>
          </div>,
          document.body
        )}
      </div>
      {showSelectedRows ? (
        <div
          class="footer-bottom"
          style={{
            width: gridWidth,
            height: 25,
            backgroundColor: "#f8f8f8",
            color: "black",
            fontSize: 12,
            paddingRight: 15,
            fontWeight: "bold",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}>
          {`Selected : ${selectedRows.length}`}
        </div>
      ) : undefined}
    </>
  );
}

function isSamePosition(p1, p2) {
  return p1.idx === p2.idx && p1.rowIdx === p2.rowIdx;
}

export default forwardRef(DataGrid);
