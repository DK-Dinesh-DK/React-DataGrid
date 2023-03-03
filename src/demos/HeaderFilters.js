import { useMemo, useState } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";
import DataGrid from "../components/datagrid/DataGrid";
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
  const [rows] = useState(createRows);

  const columns = useMemo(() => {
    return [
      {
        field: "id",
        headerName: "ID",
        width: 50,
        haveChildren: false,
      },
      {
        field: "task",
        headerName: "Title",
        sortable: true,
        filter: true,
        haveChildren: false,
      },
      {
        field: "priority",
        headerName: "Priority",
        filter: true,
        haveChildren: false,
      },
      {
        field: "issueType",
        headerName: "Issue Type",
        sortable: true,
        haveChildren: false,
      },
      {
        field: "complete",
        headerName: "% Complete",
        haveChildren: false,
      },
    ];
  }, []);

  return (
    <div className={rootClassname}>
      <DataGrid
        columnData={columns}
        rowData={rows}
        direction={direction}
        headerRowHeight={24}
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
