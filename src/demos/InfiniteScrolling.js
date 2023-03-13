import { useRef, useState } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";
import textEditor from "../components/datagrid/editors/textEditor";
import DataGrid from "../components/datagrid/DataGrid";

const loadMoreRowsClassname = css`
  inline-size: 180px;
  padding-block: 8px;
  padding-inline: 16px;
  position: absolute;
  inset-block-end: 8px;
  inset-inline-end: 8px;
  color: white;
  line-height: 35px;
  background: rgb(0 0 0 / 0.6);
`;

function rowKeyGetter(row) {
  return row.id;
}

const columns = [
  {
    field: "id",
    headerName: "ID",
    width: 80,
    cellRenderer: (props) => {
      return textEditor(props);
    },
  },
  {
    field: "title",
    headerName: "Title",
    editable: true,
    filter: true,
  },
  {
    field: "firstName",
    headerName: "First Name",
    filter: true,
    cellRenderer: (props) => {
      return textEditor(props);
    },
  },
  {
    field: "lastName",
    headerName: "Last Name",
    valueGetter: ({ row, column }) => `Last Name: ${row[column.key]}`,
  },
  {
    field: "email",
    headerName: "Email",
    valueFormatter: ({ row, column }) => `Email: ${row[column.key]}`,
  },
];

function createFakeRowObjectData(index) {
  return {
    id: `id_${index}`,
    title: faker.name.prefix(),
    firstName: faker.name.firstName(),
    lastName: faker.name.firstName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
  };
}

function createRows(numberOfRows) {
  const rows = [];

  for (let i = 0; i < numberOfRows; i++) {
    rows[i] = createFakeRowObjectData(i);
  }

  return rows;
}

function isAtBottom({ currentTarget }) {
  return (
    currentTarget.scrollTop + 10 >=
    currentTarget.scrollHeight - currentTarget.clientHeight
  );
}

function loadMoreRows(newRowsCount, length) {
  return new Promise((resolve) => {
    const newRows = [];

    for (let i = 0; i < newRowsCount; i++) {
      newRows[i] = createFakeRowObjectData(i + length);
    }

    setTimeout(() => resolve(newRows), 1000);
  });
}

export default function InfiniteScrolling({ direction }) {
  const [rows, setRows] = useState(() => createRows(10));
  const [isLoading, setIsLoading] = useState(false);

  async function handleScroll(event) {
    if (isLoading || !isAtBottom(event)) return;

    setIsLoading(true);

    const newRows = await loadMoreRows(50, rows.length);

    setRows([...rows, ...newRows]);
    setIsLoading(false);
  }
  const dataGridRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]);
  return (
    <>
      <button
        onClick={() => {
          console.log("dataGridRef", dataGridRef.current.api.getFocusedCell());
        }}
        style={{ color: "white", backgroundColor: "red" }}
      >
        getFocusedCell
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.setFocusedCell(1, "lastName");
        }}
      >
        setFocusedCell
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.clearFocusedCell();
        }}
      >
        clearFocusedCell
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.tabToNextCell();
        }}
      >
        tabToNextCell
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api);
          dataGridRef.current.api.tabToPreviousCell();
        }}
      >
        tabToPreviousCell
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.exportDataAsCsv();
        }}
      >
        exportDataAsCsv
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.exportDataAsExcel();
        }}
      >
        exportDataAsExcel
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.isAnyFilterPresent());
        }}
      >
        isAnyFilterPresent
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.tabToPreviousCell();
        }}
      >
        tabToPreviousCell
      </button>
      <button
        onClick={() => {
          console.log(
            dataGridRef.current.api.forEachNode((node) => {
              console.log("node", node);
            })
          );
        }}
      >
        tabToPreviousCell
      </button>
      <button
        onClick={() => {
          dataGridRef.current.api.destroyFilter("title");
        }}
      >
        destroyFilter
      </button>
      <button
        onClick={() => {
          console.log(dataGridRef.current.api.getDataAsCsv());
        }}
      >
        getDataAsCsv
      </button>

      <DataGrid
        columnData={columns}
        rowData={rows}
        rowKeyGetter={rowKeyGetter}
        onRowsChange={setRows}
        rowHeight={25}
        className="fill-grid"
        // userRef={dataGridRef}
        ref={dataGridRef}
        direction={direction}
        selection={true}
      />
      {isLoading && (
        <div className={loadMoreRowsClassname}>Loading more rows...</div>
      )}
    </>
  );
}
