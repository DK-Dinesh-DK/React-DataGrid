import { useState } from "react";

import DataGrid from "../components/datagrid/DataGrid";

const columns = [
  {
    field: "id",
    headerName: "ID",
    // haveChildren: false,
    width: 80,
  },
  {
    field: "task",
    headerName: "Title",
    // haveChildren: false,
  },
  {
    field: "priority",
    headerName: "Priority",
    // haveChildren: false,
  },
  {
    field: "issueType",
    headerName: "Issue Type",
    // haveChildren: false,
  },
  {
    field: "complete",
    headerName: "% Complete",
    // haveChildren: false,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    // haveChildren: false,
  },
  {
    field: "completeDate",
    headerName: "Expected Complete",
    // haveChildren: false,
  },
];

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toLocaleDateString();
}

function createRows() {
  const rows = [];
  for (let i = 1; i < 500; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ["Critical", "High", "Medium", "Low"][
        Math.floor(Math.random() * 3 + 1)
      ],
      issueType: ["Bug", "Improvement", "Epic", "Story"][
        Math.floor(Math.random() * 3 + 1)
      ],
      startDate: getRandomDate(new Date(2015, 3, 1), new Date()),
      completeDate: getRandomDate(new Date(), new Date(2016, 0, 1)),
    });
  }

  return rows;
}

export default function CellNavigation({ direction }) {
  const [rows] = useState(createRows);
  const [cellNavigationMode, setCellNavigationMode] = useState("CHANGE_ROW");

  return (
    <>
      <div style={{ marginBlockEnd: 5 }}>
        Cell Navigation Modes:
        <label>
          <input
            type="radio"
            name="mode"
            checked={cellNavigationMode === "NONE"}
            onChange={() => setCellNavigationMode("NONE")}
          />
          None
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={cellNavigationMode === "CHANGE_ROW"}
            onChange={() => setCellNavigationMode("CHANGE_ROW")}
          />
          Change Row
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            checked={cellNavigationMode === "LOOP_OVER_ROW"}
            onChange={() => setCellNavigationMode("LOOP_OVER_ROW")}
          />
          Loop Over Row
        </label>
      </div>
      <DataGrid
        columnData={columns}
        rowData={rows}
        // cellNavigationMode={cellNavigationMode}
        direction={direction}
        headerRowHeight={24}
        rowHeight={24}
      />
    </>
  );
}
