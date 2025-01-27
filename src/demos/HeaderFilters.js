import { useMemo, useState, useRef, useCallback } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";
import DataGrid from "../components/datagrid/DataGrid";
import textEditor from "../components/datagrid/editors/textEditor";
// import { Parser, SUPPORTED_FORMULAS } from 'hot-formula-parser';

const rootClassname = css`
  display: flex;
  flex-direction: column;
  block-size: 100%;
  gap: 10px;

  > .rdg {
    flex: 1;
  }
`;

// Context is needed to read filter values otherwise columns are
// re-created when filters are changed and filter loses focus

export default function HeaderFilters({ direction }) {
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState([]);
  const columns = useMemo(() => {
    return [
      {
        field: "id",
        headerName: "ID",
        width: 50,
      },
      {
        field: "task",
        headerName: "Title",
        cellRenderer: (props) => {
          return textEditor(props);
        },
        sortable: true,
        filter: true,
      },
      {
        field: "priority",
        headerName: "Priority",
        filter: true,
      },
      {
        field: "issueType",
        headerName: "Issue Type",
        sortable: true,
      },
      {
        field: "complete",
        headerName: "% Complete",
      },
    ];
  }, []);
  const dataGridRef = useRef(null);
  function rowKeyGetter(row) {
    return row.id;
  }
  const updateData = useCallback(() => {
    // dataGridRef.current.api.forEachLeafNode((node) => {
    //   // if (node.data.priority === "Critical")
    //   node.data.priority = "Very High";
    // });
    console.log(dataGridRef.current.api.applyTransaction(myTrans));
  }, []);
  const myTrans = {
    add: [
      { id: 52, task: "Add rows", issueType: "Improvement" },
      { id: 53, task: " rows", issueType: "Improv" },
    ],
    addIndex: 5,
  };
  const myTransaction = {
    add: [
      // adding a row, there should be no row with ID = 4 already
      { id: 50, task: "UI Creation", priority: "Very High" },
      { id: 51, task: "UI ", priority: " High" },
      { id: 53, task: "Object Structure", issueType: "Bug" },
    ],

    update: [
      // updating a row, the grid will look for the row with ID = 2 to update
      { id: 3, task: "Unit Testing", priority: "Very High" },
      { id: 4, task: "UI Creation", priority: "Mid" },
      { id: 22, task: "Development", issueType: "Story" },
    ],

    remove: [
      // deleting a row, only the ID is needed, other attributes (name, age) don't serve any purpose

      { id: 11 },
      { id: 10 },
    ],
  };
  return (
    <div className={rootClassname}>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.getFilterModel());
        }}
        style={{ color: "black", backgroundColor: "lightskyblue" }}
      >
        getFilterModel
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.setFilterModel({ task: "1" });
        }}
        style={{ color: "black", backgroundColor: "lightsalmon" }}
      >
        setFilterModel
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.destroyFilter("priority");
        }}
      >
        destroyFilter
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.isColumnFilterPresent());
        }}
      >
        isColumnFilterPresent
      </button>

      <DataGrid
        rowKeyGetter={rowKeyGetter}
        columnData={columns}
        rowData={rows}
        direction={direction}
        selectedRows={selectedRows}
        onSelectedRowsChange
        showSelectedRows
        ref={dataGridRef}
      />
    </div>
  );
}

function createRows() {
  const rows = [];
  for (let i = 1; i < 50; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ["Critical", "High", "Medium", "Low"][
        Math.floor(Math.random() * 4)
      ],
      issueType: ["Bug", "Improvement", "Epic", "Story"][
        Math.floor(Math.random() * 4)
      ],
    });
  }
  return rows;
}
