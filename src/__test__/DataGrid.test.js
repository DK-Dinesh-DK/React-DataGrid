
import { render } from "@testing-library/react";
import DataGrid from "../components/datagrid/DataGrid";
import textEditor from "../components/datagrid/editors/textEditor";
import React from "react"
function createRows() {
  const rows = [];
  for (let i = 1; i < 500; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      min: i,
      max: i * 2,
      low: ["Critical", "High", "Medium", "Low"][Math.round(Math.random() * 3)],
      mid: i * 4,
      high: i * 5,
      priority: ["Critical", "High", "Medium", "Low"][
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
  },
  {
    field: "task",
    headerName: "Title",
    cellEditor: textEditor,
    sortable: true,
    filter: true,
  },
  {
    field: "priority",
    headerName: "Priority",
    sortable: true,
    filter: true,
  },
  {
    field: "issueType",
    headerName: "Issue Type",
    sortable: true,
    isTopHeader: false,
    filter: true,
    //frozen: true,
    children: [
      {
        field: "low",
        headerName: "Low",
        isTopHeader: true,
      },
      {
        field: "mid",
        headerName: "Mid",
        isTopHeader: true,
      },
      {
        field: "high",
        headerName: "High",
        isTopHeader: true,
      },
    ],
  },
  {
    field: "complete",
    headerName: "% Complete",
    //filter: true,
    //   sortable: true,
    isTopHeader: true,
    children: [
      {
        field: "min",
        headerName: "Min",
        isTopHeader: false,
      },
      {
        field: "max",
        headerName: "Max",
        isTopHeader: false,
      },
    ],
  },
];
const rows = createRows();
describe("No rows renders correctly", () => {
  test("renders No Rows component", () => {
    render(
      <DataGrid columnData={columns} rowData={rows} className="fill-grid" />    );
  });
});