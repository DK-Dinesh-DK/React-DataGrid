
import React from "react";
import { useMemo } from "react";

import { valueFormatter, toggleGroupFormatter } from "../formatters";
import { SELECT_COLUMN_KEY } from "../Columns";
import { clampColumnWidth, max, min } from "../utils";
import { textEditorClassname } from "../editors/textEditor";
import { checkboxFormatter } from "../formatters";
const DEFAULT_COLUMN_WIDTH = "auto";
const DEFAULT_COLUMN_MIN_WIDTH = 40;


export function useCalculatedColumnswithIdx({
  rowData1,
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
 
  const { columns4 } =
    useMemo(() => {
     


        var columns4 = rowData1.map((rawColumn, pos) => {
          const rowGroup = rawGroupBy?.includes(rawColumn.field) ?? false;
          const frozen = rowGroup || rawColumn.frozen;
            //need to be changed
            const cellRendererValue = rawColumn.cellRenderer;
            const components = frameworkComponents
              ? Object.keys(frameworkComponents)
              : null;
            const indexOfComponent = components?.indexOf(cellRendererValue);
            const customComponentName =
              indexOfComponent > -1 ? components[indexOfComponent] : null;
        
        
            const column = {
              ...rawColumn,
              
              
             
              // index:pos,
              // frozen,
              // isLastFrozenColumn: false,
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
            };  
            
                column.idx=pos
                
             
        
            return column;
          });
     
         
      return {
        columns4,
       
      };
    }, [
      rowData1, //need to be changed
    ]);

  

 


  return {
    columns4,
  
  };
}
