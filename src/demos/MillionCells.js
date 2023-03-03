import { useMemo } from "react";
import DataGrid from "../components/datagrid/DataGrid";

const rows = [...Array(1000).keys()];

function cellFormatter(props) {
  return (
    <>
      {props.column.key}&times;{props.row}
    </>
  );
}

export default function MillionCells({ direction }) {
  const columns = useMemo(() => {
    const columns = [];

    for (let i = 0; i < 50; i++) {
      const key = String(i);
      columns.push({
        field: key,
        headerName: key,
        // width: 80,
        haveChildren: false,
        // resizable: true,
        valueFormatter: cellFormatter,
      });
    }

    return columns;
  }, []);
  console.log("roewss", rows, columns);
  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      rowHeight={22}
      headerRowHeight={24}
      // className="fill-grid"
      // direction={direction}
    />
  );
}
