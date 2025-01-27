import { useRef, useState } from "react";
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import { SelectColumn } from "../components/datagrid/Columns";
// import { DraggableRowRenderer } from './components/RowRenderers';
import textEditor from "../components/datagrid/editors/textEditor";
import DataGrid from "../components/datagrid/DataGrid";
// import { DraggableRowRenderer } from "./DraggableRowRenderer";
// import { Checkbox } from "lai_webui";
const frameworkComponents = {
  abc: () => {
    return <input type={"checkbox"} />;
  },
  cdd: (props) => <button />,
};

function createRows() {
  const rows = [];

  for (let i = 1; i < 500; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ["Critical", "High", "Medium", "Low"][
        Math.round(Math.random() * 3)
      ],
      issueType: ["Bug", "Improvement", "Epic", "Story"][
        Math.round(Math.random() * 3)
      ],
    });
  }

  return rows;
}

const columns = [
  {
    key: "trial",
    field: "",
    width: 45,
    cellRenderer: "abc",
  },
  {
    field: "id",
    headerName: "ID",
    width: 80,
    rowDrag: true,
  },
  {
    field: "task",
    headerName: "Title",
    width: 200,
    editor: textEditor,
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 200,
  },
  {
    field: "issueType",
    headerName: "Issue Type",
    width: 200,
  },
  {
    field: "complete",
    headerName: "% Complete",
    width: 200,
  },
];
function rowKeyGetter(row) {
  return row.id;
}

export default function RowsReordering({ direction }) {
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState([]);
  const gridRef = useRef(null);
  return (
    <>
      <button
        onClick={() => {
          gridRef.current.api.setSuppressRowDrag(true);
        }}
      >
        setSuppressRowDrag
      </button>
      <button
        onClick={() => {
          console.log(gridRef.current.api.getVerticalPixelRange());
        }}
      >
        getVerticalPixelRange
      </button>
      <button
        onClick={() => {
          console.log(gridRef.current.api.getHorizontalPixelRange());
        }}
      >
        getHorizontalPixelRange
      </button>
      <DataGrid
        columnData={columns}
        rowData={rows}
        ref={gridRef}
        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        serialNumber={true}
        onRowsChange={setRows}
        direction={direction}
        frameworkComponents={frameworkComponents}
      />
    </>
  );
}
