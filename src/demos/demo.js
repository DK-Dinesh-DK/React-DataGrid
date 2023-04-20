import DataGrid from "../components/datagrid/DataGrid";
// import { DataGrid } from "../../lib/bundle";

import React, { useState } from "react";
function Demos() {
  const [rowDataa, setRowDataa] = useState([]);
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
    },
    {
      field: "task",
      headerName: "Title",
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
    {
      field: "startDate",
      headerName: "Start Date",
    },
    {
      field: "completeDate",
      headerName: "Expected Complete",
      width: 200,
      cellRenderer: (props) => {
        return (
          <button
            onClick={() =>
              handleDelete(props.rowIndex)
            }>{`Delete ${props.rowIndex}`}</button>
        );
      },
    },
  ];
  function handleDelete(key) {
    console.log("rows before:>> ", rowDataa);
    rowDataa.splice(key, 1);
    console.log("rows after:>> ", rowDataa);
    setRowDataa([...rowDataa]);
  }
  function handleAddRows() {
    setRowDataa([
      { id: 0, task: "task1" },
      { id: 1, task: "task1" },
      { id: 2, task: "task1" },
      { id: 3, task: "task1" },
    ]);
  }
  function handleDeleteSecondRow() {
    console.log("rowDataa before :>> ", rowDataa);
    rowDataa.splice(2, 1);

    setRowDataa([...rowDataa]);
    console.log("rowDataa after :>> ", rowDataa);
  }

  return (
    <>
      <button onClick={handleAddRows}>Add Rows</button>
      <button onClick={handleDeleteSecondRow}>Delete Second Row</button>

      <DataGrid
        rowData={rowDataa}
        columnData={columns}
        //onRowsChange={setRowDataa}
        rowSelection={"single"}
      />
    </>
  );
}
export default Demos;
