import { useMemo } from 'react';
import DataGrid from '../components/datagrid/DataGrid';



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

    for (let i = 0; i < 60; i++) {
      const key = String(i);
      columns.push({
       field: key,
        headerName: key,
        topHeader:key,
        haveChildren:false,
        // frozen: i < 5,
        width: 80,
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
      rowHeight={22}
      className="fill-grid"
      direction={direction}
      headerRowHeight={24}
      classheaderName="fill-grid"
    />
  );
}
