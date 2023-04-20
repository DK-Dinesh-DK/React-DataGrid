import { useState, useRef } from "react";
import { groupBy as rowGrouper } from "lodash";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";

import { SelectColumn } from "../components/datagrid/Columns";

import DataGrid from "../components/datagrid/DataGrid";

const groupingClassname = css`
  display: flex;
  flex-direction: column;
  block-size: 100%;
  gap: 8px;

  > .rdg {
    flex: 1;
  }
`;

const optionsClassname = css`
  display: flex;
  gap: 8px;
  text-transform: capitalize;
`;

const sports = [
  "Swimming",
  "Gymnastics",
  "Speed Skating",
  "Cross Country Skiing",
  "Short-Track Speed Skating",
  "Diving",
  "Cycling",
  "Biathlon",
  "Alpine Skiing",
  "Ski Jumping",
  "Nordic Combined",
  "Athletics",
  "Table Tennis",
  "Tennis",
  "Synchronized Swimming",
  "Shooting",
  "Rowing",
  "Fencing",
  "Equestrian",
  "Canoeing",
  "Bobsleigh",
  "Badminton",
  "Archery",
  "Wrestling",
  "Weightlifting",
  "Waterpolo",
  "Wrestling",
  "Weightlifting",
];

const columns = [
  SelectColumn,
  {
    field: "country",
    headerName: "Country",
  },
  {
    field: "year",
    headerName: "Year",
  },
  {
    field: "sport",
    headerName: "Sport",
  },
  {
    field: "athlete",
    headerName: "Athlete",
  },
  {
    field: "gold",
    headerName: "Gold",
    groupFormatter({ childRows }) {
      return <>{childRows.reduce((prev, { gold }) => prev + gold, 0)}</>;
    },
  },
  {
    field: "silver",
    headerName: "Silver",
    groupFormatter({ childRows }) {
      return <>{childRows.reduce((prev, { silver }) => prev + silver, 0)}</>;
    },
  },
  {
    field: "bronze",
    headerName: "Bronze",
    groupFormatter({ childRows }) {
      return <>{childRows.reduce((prev, { silver }) => prev + silver, 0)}</>;
    },
  },
  {
    field: "total",
    headerName: "Total",
    formatter({ row }) {
      return <>{row.gold + row.silver + row.bronze}</>;
    },
    groupFormatter({ childRows }) {
      return (
        <>
          {childRows.reduce(
            (prev, row) => prev + row.gold + row.silver + row.bronze,
            0
          )}
        </>
      );
    },
  },
];

function rowKeyGetter(row) {
  return row.id;
}

function createRows() {
  const rows = [];
  for (let i = 1; i < 1000; i++) {
    rows.push({
      id: i,
      year: 2015 + faker.datatype.number(3),
      country: faker.address.country(),
      sport: sports[faker.datatype.number(sports.length - 1)],
      athlete: faker.name.fullName(),
      gold: faker.datatype.number(5),
      silver: faker.datatype.number(5),
      bronze: faker.datatype.number(5),
    });
  }

  return rows.sort((r1, r2) => r2.country.localeCompare(r1.country));
}

const options = ["country", "year", "sport", "athlete"];

export default function Grouping({ direction }) {
  const [rows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState();
  const [selectedOptions, setSelectedOptions] = useState([
    options[0],
    options[1],
  ]);
  const [expandedGroupIds, setExpandedGroupIds] = useState(() => new Set([]));

  function toggleOption(option, enabled) {
    const index = selectedOptions.indexOf(option);
    if (enabled) {
      if (index === -1) {
        setSelectedOptions((options) => [...options, option]);
      }
    } else if (index !== -1) {
      setSelectedOptions((options) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        return newOptions;
      });
    }
    setExpandedGroupIds(new Set());
  }
  const dataGridRef = useRef(null);

  return (
    <div className={groupingClassname}>
      <b>Group by columns:</b>
      <div className={optionsClassname}>
        {options.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selectedOptions.includes(option)}
              onChange={(event) => toggleOption(option, event.target.checked)}
            />{" "}
            {option}
          </label>
        ))}
      </div>
      <button
        onClick={() => {
          dataGridRef.current.api.collapseAll();
        }}
        style={{ color: "white", backgroundColor: "red" }}
      >
        collapseAll
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.expandAll();
        }}
        style={{ color: "white", backgroundColor: "red" }}
      >
        expandAll
      </button>
      <button
        onClick={() => {
          let node = dataGridRef.current.api.getRowNodes(2);
        }}
      >
        isExpandable
      </button>
      <DataGrid
        columnData={columns}
        rowData={rows}
        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        headerRowHeight={24}
        onSelectedRowsChange={setSelectedRows}
        groupBy={selectedOptions}
        rowGrouper={rowGrouper}
        expandedGroupIds={expandedGroupIds}
        onExpandedGroupIdsChange={setExpandedGroupIds}
        defaultColumnOptions={{ resizable: true }}
        direction={direction}
        ref={dataGridRef}
      />
    </div>
  );
}
