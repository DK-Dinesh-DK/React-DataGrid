import { useState } from "react";

// import { DraggableRowRenderer } from './components/RowRenderers';
import textEditor from "../components/datagrid/editors/textEditor";
import DataGrid from "../components/datagrid/DataGrid";

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
    field: "id",
    headerName: "ID",
    width: 100,
    rowDrag: true,
    haveChildren: false,
  },
  {
    field: "task",
    headerName: "Title",
    cellEditor: textEditor,
    haveChildren:false
  },
  {
    field: "priority",
    headerName: "Priority",
    haveChildren:false
  },
  {
    field: "issueType",
    headerName: "Issue Type",
    haveChildren:false
  },
  {
    field: "complete",
    headerName: "% Complete",
    haveChildren:false
  },
];

export default function RowsReordering({ direction }) {
  const [rows, setRows] = useState(createRows);

  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      serialNumber={true}
      onRowsChange={setRows}
      headerRowHeight={24}
      direction={direction}
    />
  );
}
