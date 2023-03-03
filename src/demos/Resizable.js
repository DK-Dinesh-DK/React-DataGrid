import DataGrid from '../components/datagrid/DataGrid';



const rows= [...Array(100).keys()];

function cellFormatter(props) {
  return (
    <>
      {props.column.key}&times;{props.row}
    </>
  );
}

const columns= [];

for (let i = 0; i < 50; i++) {
  const key = String(i);
  columns.push({
    field:key,
    headerName: key,
    haveChildren:false,
    valueFormatter: cellFormatter
  });
}

export default function ResizableGrid({ direction }) {
  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      className="fill-grid"
      style={{ resize: 'both' }}
      direction={direction}
      headerRowHeight={24}
    />
  );
}
