import { useRef, useState } from "react";

import DataGrid from "../components/datagrid/DataGrid";

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
  },
];

function getRandomDate(start, end) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  ).toLocaleDateString();
}

function createRows() {
  const rows = [];
  for (let i = 1; i < 50; i++) {
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
  const dataGridRef = useRef(null);
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
          {" "}
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
        cellNavigationMode={cellNavigationMode}
        direction={direction}
        ref={dataGridRef}
      />
    </>
  );
}
