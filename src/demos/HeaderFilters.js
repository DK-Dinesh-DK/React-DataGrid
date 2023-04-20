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
        haveChildren: false,
        topHeader: "id",
        headerName: "ID",
        width: 50,
      },
      {
        field: "task",
        haveChildren: false,
        topHeader: "task",
        headerName: "Title",
        cellRenderer: (props) => {
          // console.log("props", props);
          return textEditor(props);
        },
        sortable: true,
        filter: true,
      },
      {
        field: "priority",
        haveChildren: false,
        topHeader: "priority",
        headerName: "Priority",
        filter: true,
      },
      {
        field: "issueType",
        haveChildren: false,
        topHeader: "issueType",
        headerName: "Issue Type",
        sortable: true,
      },
      {
        field: "complete",
        haveChildren: false,
        topHeader: "complete",
        headerName: "% Complete",
      },
    ];
  }, []);
  const dataGridRef = useRef(null);
  function rowKeyGetter(row) {
    return row.id;
  }
  const updateData = useCallback(() => {}, []);
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
        style={{ color: "black", backgroundColor: "lightskyblue" }}>
        getFilterModel
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.setFilterModel({ task: "1" });
        }}
        style={{ color: "black", backgroundColor: "lightsalmon" }}>
        setFilterModel
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.deselectAllFiltered());
        }}
        style={{ color: "black", backgroundColor: "lightslategrey" }}>
        Deselect All Filtered Rows
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.selectAll());
        }}
        style={{ color: "black", backgroundColor: "lightblue" }}>
        Select All Rows
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.deselectAll());
        }}
        style={{ color: "white", backgroundColor: "lightseagreen" }}>
        Deselect All Rows
      </button>
      <button
        onClick={updateData}
        style={{ color: "black", backgroundColor: "lightskyblue" }}>
        Update Data
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef);
          console.log(dataGridRef.current.api.applyTransaction(myTransaction));

          // console.log(dataGridRef.current.api.getSelectedNodes());
          // var rowNode = dataGridRef.current.api.getRowNodes(2);
          // rowNode.setDataValue("task", "dineshkumar@gmail.com");
        }}
        style={{ color: "white", backgroundColor: "red" }}>
        ADD
      </button>
      <button
        onClick={() => {
          console.log(
            dataGridRef.current.api.forEachLeafNode((node) => {
              console.log("Node", node);
            })
          );
        }}
        style={{ color: "black", backgroundColor: "lightsteelblue" }}>
        For Each Leaf Node After Filter
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef);
          console.log(
            dataGridRef.current.api.forEachLeafNode((node) => {
              node.data.priority = "Imaginary";
            })
          );
        }}
        style={{ color: "black", backgroundColor: "lightyellow" }}>
        For Each Leaf Node After Filter and Sort
      </button>
      <DataGrid
        rowKeyGetter={rowKeyGetter}
        columnData={columns}
        rowData={rows}
        headerRowHeight={70}
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
