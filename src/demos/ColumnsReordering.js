import { useState, useMemo, useCallback, useEffect } from "react";
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

function createColumns() {
  return [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "task",
      headerName: "Title",
      resizable: true,
      sortable: true,
    },
    {
      field: "priority",
      headerName: "Priority",
      resizable: true,
      sortable: true,
    },
    {
      field: "issueType",
      headerName: "Issue Type",
      resizable: true,
      sortable: true,
    },
    {
      field: "complete",
      headerName: "% Complete",
      resizable: true,
      sortable: true,
    },
  ];
}

export default function ColumnsReordering({ direction }) {
  const [rows] = useState(createRows);
  const [columns, setColumns] = useState(createColumns);
  const [sortColumns, setSortColumns] = useState([]);
  const onSortColumnsChange = useCallback((sortColumns) => {
    console.log("onSortColumnsChange", sortColumns);
    setSortColumns(sortColumns.slice(-1));
  }, []);


  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return rows;
    const { columnKey, direction } = sortColumns[0];
    let sortedRows = [...rows];

    switch (columnKey) {
      case "task":
      case "priority":
      case "issueType":
        sortedRows = sortedRows.sort((a, b) =>
          a[columnKey].localeCompare(b[columnKey])
        );
        break;
      case "complete":
        sortedRows = sortedRows.sort((a, b) => a[columnKey] - b[columnKey]);
        break;
      default:
    }
    return direction === "DESC" ? sortedRows.reverse() : sortedRows;
  }, [rows, sortColumns]);

  return (

      <DataGrid
        columnData={columns}
        rowData={sortedRows}
        columnReordering={true}
        sortColumns={sortColumns}
        onSortColumnsChange={onSortColumnsChange}
        direction={direction}
        defaultColumnOptions={{ width: "1fr" }}
      />
  );
}
