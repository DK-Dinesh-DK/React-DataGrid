import React from "react";
import { useMemo } from "react";

import { valueFormatter, toggleGroupFormatter } from "../formatters";
import { SELECT_COLUMN_KEY } from "../Columns";
import { clampColumnWidth, max, min } from "../utils";
import { textEditorClassname } from "../editors/textEditor";
import { checkboxFormatter } from "../formatters";
const DEFAULT_COLUMN_WIDTH = "auto";
const DEFAULT_COLUMN_MIN_WIDTH = 40;

export function useCalculatedRowColumns({
  columns4,
  defaultColumnOptions,
  rawGroupBy,
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

  const { columns5, colSpanColumns, lastFrozenColumnIndex, groupBy } =
    useMemo(() => {
      // Filter rawGroupBy and ignore keys that do not match the columns prop
      const groupBy = [];
      let lastFrozenColumnIndex = -1;

      const columns5 = columns4?.map((rawColumn,pos) => {
        const rowGroup = rawGroupBy?.includes(rawColumn.field) ?? false;
        const frozen = rowGroup || rawColumn.frozen;

        const cellRendererValue = rawColumn.cellRenderer;
        const components = frameworkComponents
          ? Object.keys(frameworkComponents)
          : null;
        const indexOfComponent = components?.indexOf(cellRendererValue);
        const customComponentName =
          indexOfComponent > -1 ? components[indexOfComponent] : null;
        
        
        const column = {
          ...rawColumn,
          key: rawColumn.field,
          parent:null,
          
          idx: 0,
          
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
          cellRenderer:frameworkComponents?.[customComponentName] ??
            rawColumn.cellRenderer ??
            rawColumn.valueFormatter ??
            defaultFormatter,
            // topHeader: rawColumn.field,
           
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

        return column;
      });


    
      return {
        columns5,
        colSpanColumns,
        lastFrozenColumnIndex,
        groupBy,
      };
    }, [
      columns4,
      defaultWidth,
      defaultMinWidth,
      defaultMaxWidth,
      defaultFormatter,
      defaultResizable,
      defaultSortable,
      rawGroupBy,
    ]);


  return {
    columns5,
  };
}
