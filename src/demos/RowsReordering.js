import { useCallback, useState } from "react";
import textEditor from "../components/datagrid/editors/textEditor";
import DataGrid from "../components/datagrid/DataGrid";

function createRows() {
  const rows = [];

  for (let i = 1; i < 10; i++) {
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
    width: 80,
    rowDrag: true,
  },
  {
    field: "task",
    headerName: "Title",
    editor: textEditor,
  },
  {
    field: "priority",
    headerName: "Priority",
  },
  {
    field: "issueType",
    headerName: "Issue Type",
  },
  {
    field: "complete",
    headerName: "% Complete",
  },
];
function rowKeyGetter(row) {
  return row.id;
}

export default function RowsReordering({ direction }) {
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      rowKeyGetter={rowKeyGetter}
      selectedRows={selectedRows}
      onSelectedRowsChange1={setSelectedRows}
      serialNumber={true}
      onRowsChange={setRows}
      direction={direction}
    />
  );
}
