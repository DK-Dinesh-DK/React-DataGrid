import { useMemo, useState, useRef } from "react";
import { css } from "@linaria/core";

import { SelectColumn } from "../components/datagrid/Columns";
import textEditor from "../components/datagrid/editors/textEditor";

import DataGrid from "../components/datagrid/DataGrid";

const selectCellClassname = css`
  display: flex;
  align-items: center;
  justify-content: center;

  > input {
    margin: 0;
  }
`;

const sortPriorityClassname = css`
  color: grey;
  margin-left: 2px;
`;

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
    ...SelectColumn,
    headerCellClass: selectCellClassname,
    cellClass: selectCellClassname,
  },
  {
    field: "id",
    haveChildren:false,
    topHeader: "id",
    headerName: "ID",
    width: 80,
  },
  {
    field: "task",
    haveChildren:false,
    topHeader: "task",
    headerName: "Title",
    cellEditor: (props) => {
   
      return textEditor(props);
    },
    sortable: true,
  },
  {
    field: "priority",
    haveChildren:false,
    topHeader: "priority",
    headerName: "Priority",
    sortable: true,
  },
  {
    field: "issueType",
    haveChildren:false,
    topHeader: "issueType",
    headerName: "Issue Type",
    sortable: true,
  },
  {
    field: "complete",
    haveChildren:false,
    topHeader: "complete",
    headerName: "% Complete",
    sortable: true,
  },
];

export default function CustomizableComponents({ direction }) {
  const [rows, setRows] = useState(createRows);
  const [sortColumns, setSortColumns] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const sortedRows = useMemo(() => {
    if (sortColumns.length === 0) return rows;

    return [...rows].sort((a, b) => {
      for (const sort of sortColumns) {
        const comparator = getComparator(sort.columnKey);
        const compResult = comparator(a, b);
        if (compResult !== 0) {
          return sort.direction === "ASC" ? compResult : -compResult;
        }
      }
      return 0;
    });
  }, [rows, sortColumns]);
  const dataGridRef = useRef(null);

  return (
    <DataGrid
      className="fill-grid"
      columnData={columns}
      rowData={sortedRows}
      headerRowHeight={24}
      rowKeyGetter={rowKeyGetter}
      onRowsChange={setRows}
      sortColumns={sortColumns}
      onSortColumnsChange={setSortColumns}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      renderers={{ sortStatus, checkboxFormatter }}
      direction={direction}
      showSelectedRows={true}
    />
  );
}
function checkboxFormatter({ onChange, ...props }, ref) {
  function handleChange(e) {
    onChange(e.target.checked, e.nativeEvent.shiftKey);

  }

  return <input type="checkbox" ref={ref} {...props} onChange={handleChange} />;
}

function sortStatus({ sortDirection, priority }) {
  return (
    <>
      {sortDirection !== undefined
        ? sortDirection === "ASC"
          ? "\u2B9D"
          : "\u2B9F"
        : null}
      <span className={sortPriorityClassname}>{priority}</span>
    </>
  );
}
function rowKeyGetter(row) {
  return row.id;
}

function getComparator(sortColumn) {
  switch (sortColumn) {
    case "task":
    case "priority":
    case "issueType":
      return (a, b) => {
        return a[sortColumn].localeCompare(b[sortColumn]);
      };
    case "complete":
      return (a, b) => {
        return a[sortColumn] - b[sortColumn];
      };
    default:
      throw new Error(`unsupported sortColumn: "${sortColumn}"`);
  }
}
