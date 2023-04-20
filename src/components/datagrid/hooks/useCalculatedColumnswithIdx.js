import { useMemo } from "react";

export function useCalculatedColumnswithIdx({ rowData1 }) {
  const { columns4 } = useMemo(() => {
    var columns4 = rowData1.map((rawColumn, pos) => {
      const column = {
        ...rawColumn,
      };
      column.idx = pos;
      return column;
    });

    return {
      columns4,
    };
  }, [
    rowData1
  ]);

  return {
    columns4,
  };
}
