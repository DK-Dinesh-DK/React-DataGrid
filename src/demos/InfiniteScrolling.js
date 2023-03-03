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
    topHeader: "id",
    haveChildren: false,
    // cellRenderer: (props) => {
    //   return textEditor(props);
    // },
  },
  {
    field: "title",
    topHeader: "title",
    headerName: "Title",
    editable: true,
    haveChildren: false,
    width: 200,
  },
  {
    field: "firstName",
    topHeader: "firstName",
    headerName: "First Name",
    width: 200,
    haveChildren: false,
    // cellRenderer: (props) => {
    //   return textEditor(props);
    // },  
  },
  {
    field: "lastName",
    topHeader: "lastName",
    headerName: "Last Name",
    width: 200,
    haveChildren: false,
  },
  {
    field: "email",
    topHeader: "email",
    headerName: "Email",
    width: 300,
    haveChildren: false,
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
    phone: faker.phone.phoneNumber(),
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
  const [rows, setRows] = useState(() => createRows(50));
  const [isLoading, setIsLoading] = useState(false);

  async function handleScroll(event) {
    if (isLoading || !isAtBottom(event)) return;

    setIsLoading(true);

    const newRows = await loadMoreRows(50, rows.length);

    setRows([...rows, ...newRows]);
    setIsLoading(false);
  }
  const dataGridRef = useRef(null);
  return (
    <>
      {/* <button
        onClick={() => {
          console.log(dataGridRef);
          // var rowNode = dataGridRef.current.api.getRowNodes(2);
          // rowNode.setDataValue("email", "dineshkumar@gmail.com");
        }}
        style={{ color: "white", backgroundColor: "red" }}
      >
        ADD
      </button> */}
      <DataGrid
        columnData={columns}
        rowData={rows}
        rowKeyGetter={rowKeyGetter}
        onRowsChange={setRows}
        rowHeight={25}
        onScroll={handleScroll}
        className="fill-grid"
        // userRef={dataGridRef}
        headerRowHeight={24}
        ref={dataGridRef}
        direction={direction}
      />
      {isLoading && (
        <div className={loadMoreRowsClassname}>Loading more rows...</div>
      )}
    </>
  );
}
