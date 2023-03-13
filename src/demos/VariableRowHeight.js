import { useMemo } from 'react';

import DataGrid from '../components/datagrid/DataGrid';



const rows = [...Array(500).keys()];

function cellFormatter(props) {
  return (
    <>
      {props.column.key}&times;{props.row}
    </>
  );
}

export default function VariableRowHeight({ direction }) {
  const columns = useMemo(() => {
    const columns = [];

    for (let i = 0; i < 30; i++) {
      const key = String(i);
      columns.push({
        field:key,
        headerName: key,
        frozen: i < 5,
        resizable: true,
        valueFormatter: cellFormatter
      });
    }

    return columns;
  }, []);

  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      rowHeight={rowHeight}
      className="fill-grid"
      direction={direction}
    />
  );
}

function rowHeight(data) {
  console.log("dataaa-rowHeight",data);
  // should be based on the content of the row
  return 25 + Math.round(Math.random() * 75);
}
