import React,{useMemo} from "react";


import { valueFormatter, toggleGroupFormatter } from "../formatters";
import { SELECT_COLUMN_KEY } from "../Columns";
import { clampColumnWidth, max, min } from "../utils";
import { textEditorClassname } from "../editors/textEditor";
const DEFAULT_COLUMN_WIDTH = "auto";
const DEFAULT_COLUMN_MIN_WIDTH = 40;

export function useCalculatedColumns({
  newData,
  columnWidths,
  viewportWidth,
  scrollLeft,
  defaultColumnOptions,
  rawGroupBy,
  enableVirtualization,
  frameworkComponents,
}) {
  const defaultWidth = defaultColumnOptions?.width ?? DEFAULT_COLUMN_WIDTH;
  const defaultMinWidth =
    defaultColumnOptions?.minWidth ?? DEFAULT_COLUMN_MIN_WIDTH;
  const defaultMaxWidth = defaultColumnOptions?.maxWidth ?? undefined;
  const defaultFormatter = defaultColumnOptions?.formatter ?? valueFormatter;
  const defaultSortable = defaultColumnOptions?.sortable ?? false;
  const defaultResizable = defaultColumnOptions?.resizable ?? false;
  const defaultFilter = defaultColumnOptions?.dilter ?? false;

  const { columns, colSpanColumns, lastFrozenColumnIndex, groupBy } =
    useMemo(() => {
      // Filter rawGroupBy and ignore keys that do not match the columns prop
      const groupBy = [];
      let lastFrozenColumnIndex = -1;

      const columns = newData?.map((rawColumn, pos) => {
        const rowGroup = rawGroupBy?.includes(rawColumn.field) ?? false;
        const frozen = rowGroup || rawColumn.frozen;

        const cellRendererValue = rawColumn.cellRenderer;
        const components = frameworkComponents
          ? Object.keys(frameworkComponents)
          : null;

        const indexOfComponent = components?.indexOf(cellRendererValue);
        const customComponentName =
          indexOfComponent > -1 ? components[indexOfComponent] : null;

        var recursiveChild = (subChild, rawColumn) => {
          return (
            subChild.haveChildren === true &&
            subChild?.children.map((subChild2, index1) => {
              const rawChild2 = {
                ...subChild2,
                parent: subChild.field,
                formatter: subChild2.cellRenderer
                ? subChild2.cellRenderer
                : subChild2.valueFormatter ?? defaultFormatter,
              filter: subChild2.filter ?? defaultFilter,
              cellRenderer:
                frameworkComponents?.[customComponentName] ??
                subChild2.cellRenderer ??
                subChild2.valueFormatter ??
                defaultFormatter,

                children: recursiveChild(subChild2, rawColumn),
                // idx: index1,
                key: subChild2.field,
              };
              return rawChild2;
            })
          );
        };

        const column = {
          ...rawColumn,
           colId: rawColumn.field,
          key: rawColumn.field,
          userProvidedColDef: rawColumn,
          parent: null,
        
          idx: 0,
          index: pos,
          frozen,
          isLastFrozenColumn: false,
          rowGroup,
          width: rawColumn.width ?? defaultWidth,
          minWidth: rawColumn.minWidth ?? defaultMinWidth,
          maxWidth: rawColumn.maxWidth ?? defaultMaxWidth,
          sortable: rawColumn.sortable ?? defaultSortable,
          resizable: rawColumn.resizable ?? defaultResizable,
          formatter: rawColumn.cellRenderer
            ? rawColumn.cellRenderer
            : rawColumn.valueFormatter ?? defaultFormatter,
          filter: rawColumn.filter ?? defaultFilter,
          cellRenderer:
            frameworkComponents?.[customComponentName] ??
            rawColumn.cellRenderer ??
            rawColumn.valueFormatter ??
            defaultFormatter,
          // topHeader: rawColumn.field,
          children:
            rawColumn.haveChildren === true &&
            rawColumn?.children.map((child, index1) => {
              const rawChild = {
                ...child,
                parent: rawColumn.field,
                formatter: child.cellRenderer
                  ? child.cellRenderer
                  : child.valueFormatter ?? defaultFormatter,
                filter: child.filter ?? defaultFilter,
                cellRenderer:
                  frameworkComponents?.[customComponentName] ??
                  child.cellRenderer ??
                  child.valueFormatter ??
                  defaultFormatter,

                children:
                  child.haveChildren === true &&
                  child?.children.map((subChild, index2) => {
                    const rawChild1 = {
                      ...subChild,
                      // topHeader: rawColumn.field,
                      parent: child.field,
                      formatter: subChild.cellRenderer
                        ? subChild.cellRenderer
                        : subChild.valueFormatter ?? defaultFormatter,
                      filter: subChild.filter ?? defaultFilter,
                      cellRenderer:
                        frameworkComponents?.[customComponentName] ??
                        subChild.cellRenderer ??
                        subChild.valueFormatter ??
                        defaultFormatter,
                      children: recursiveChild(subChild, rawColumn),
                      // idx: index2,
                      key: subChild.field,
                    };
                    return rawChild1;
                  }),
                // idx: index1,
              };
              return rawChild;
            }),
        };

        if (rowGroup) {
          column.groupFormatter ??= toggleGroupFormatter;
        }
        if (rawColumn.editable) {
          column.cellEditor = column.cellEditor
            ? column.cellEditor
            : (props) => {
                return (
                  <input
                    className={textEditorClassname}
                    value={props.row[props.column.key]}
                    onChange={(event) =>
                      props.onRowChange({
                        ...props.row,
                        [props.column.key]: event.target.value,
                      })
                    }
                  />
                );
              };
        }
        if (frozen) {
          lastFrozenColumnIndex++;
        }
        if (column.alignment) {
          if (
            column.alignment.type?.toLowerCase() === "date" ||
            column.alignment.type?.toLowerCase() === "datetime" ||
            column.alignment.type?.toLowerCase() === "time"
          ) {
            column.width = rawColumn.width ?? "max-content";
          }
        }
        return column;
      });

      columns?.sort(
        ({ key: aKey, frozen: frozenA }, { key: bKey, frozen: frozenB }) => {
          // Sort select column first:
          if (aKey === SELECT_COLUMN_KEY) return -1;
          if (bKey === SELECT_COLUMN_KEY) return 1;

          // Sort grouped columns second, following the groupBy order:
          if (rawGroupBy?.includes(aKey)) {
            if (rawGroupBy.includes(bKey)) {
              return rawGroupBy.indexOf(aKey) - rawGroupBy.indexOf(bKey);
            }
            return -1;
          }
          if (rawGroupBy?.includes(bKey)) return 1;

          // Sort frozen columns third:
          if (frozenA) {
            if (frozenB) return 0;
            return -1;
          }
          if (frozenB) return 1;

          // Sort other columns last:
          return 0;
        }
      );

      const colSpanColumns = [];
      columns?.forEach((column, idx) => {
        column.idx = idx;

        if (column.rowGroup) {
          groupBy.push(column.key);
        }

        if (column.colSpan != null) {
          colSpanColumns.push(column);
        }
      });

      if (lastFrozenColumnIndex !== -1) {
        columns[lastFrozenColumnIndex].isLastFrozenColumn = true;
      }

      return {
        columns,
        colSpanColumns,
        lastFrozenColumnIndex,
        groupBy,
      };
    }, [
      newData,
      defaultWidth,
      defaultMinWidth,
      defaultMaxWidth,
      defaultFormatter,
      defaultResizable,
      defaultSortable,
      rawGroupBy,
    ]);

  const {
    templateColumns,
    layoutCssVars,
    totalFrozenColumnWidth,
    columnMetrics,
  } = useMemo(() => {
    const templateColumns = [];
    let left = 0;
    let totalFrozenColumnWidth = 0;
    const columnMetrics = new Map();

    for (const column of columns) {
      let width = columnWidths.get(column.key) ?? column.width;
      if (typeof width === "number") {
        width = clampColumnWidth(width, column);
      } else {
        // This is a placeholder width so we can continue to use virtualization.
        // The actual value is set after the column is rendered
        width = column.minWidth;
      }
      templateColumns.push(`${width}px`);
      columnMetrics.set(column, { width, left });
      left += width;
    }

    if (lastFrozenColumnIndex !== -1) {
      const columnMetric = columnMetrics.get(columns[lastFrozenColumnIndex]);
      totalFrozenColumnWidth = columnMetric.left + columnMetric.width;
    }

    const layoutCssVars = {
      gridTemplateColumns: templateColumns.join(" "),
    };
    for (let i = 0; i <= lastFrozenColumnIndex; i++) {
      const column = columns[i];
      layoutCssVars[`--rdg-frozen-left-${column.idx}`] = `${
        columnMetrics.get(column).left
      }px`;
    }

    return {
      templateColumns,
      layoutCssVars,
      totalFrozenColumnWidth,
      columnMetrics,
    };
  }, [columnWidths, columns, lastFrozenColumnIndex]);

  const [colOverscanStartIdx, colOverscanEndIdx] = useMemo(() => {
    if (!enableVirtualization) {
      return [0, columns.length - 1];
    }
    // get the viewport's left side and right side positions for non-frozen columns
    const viewportLeft = scrollLeft + totalFrozenColumnWidth;
    const viewportRight = scrollLeft + viewportWidth;
    // get first and last non-frozen column indexes
    const lastColIdx = columns.length - 1;
    const firstUnfrozenColumnIdx = min(lastFrozenColumnIndex + 1, lastColIdx);

    // skip rendering non-frozen columns if the frozen columns cover the entire viewport
    if (viewportLeft >= viewportRight) {
      return [firstUnfrozenColumnIdx, firstUnfrozenColumnIdx];
    }

    // get the first visible non-frozen column index
    let colVisibleStartIdx = firstUnfrozenColumnIdx;
    while (colVisibleStartIdx < lastColIdx) {
      const { left, width } = columnMetrics.get(columns[colVisibleStartIdx]);
      // if the right side of the columnn is beyond the left side of the available viewport,
      // then it is the first column that's at least partially visible
      if (left + width > viewportLeft) {
        break;
      }
      colVisibleStartIdx++;
    }

    // get the last visible non-frozen column index
    let colVisibleEndIdx = colVisibleStartIdx;
    while (colVisibleEndIdx < lastColIdx) {
      const { left, width } = columnMetrics.get(columns[colVisibleEndIdx]);
      // if the right side of the column is beyond or equal to the right side of the available viewport,
      // then it the last column that's at least partially visible, as the previous column's right side is not beyond the viewport.
      if (left + width >= viewportRight) {
        break;
      }
      colVisibleEndIdx++;
    }

    const colOverscanStartIdx = max(
      firstUnfrozenColumnIdx,
      colVisibleStartIdx - 1
    );
    const colOverscanEndIdx = min(lastColIdx, colVisibleEndIdx + 1);

    return [colOverscanStartIdx, colOverscanEndIdx];
  }, [
    columnMetrics,
    columns,
    lastFrozenColumnIndex,
    scrollLeft,
    totalFrozenColumnWidth,
    viewportWidth,
    enableVirtualization,
  ]);

  return {
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
  };
}
