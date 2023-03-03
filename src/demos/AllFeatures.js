import { useState } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";

// import { SelectColumn } from "../components/datagrid/Columns";
import textEditor from "../components/datagrid/editors/textEditor";

import DataGrid from "../components/datagrid/DataGrid";

import dropDownEditor from "../components/datagrid/editors/dropDownEditors";
import ImageFormatter from "./ImageFormatter";

const highlightClassname = css`
  .rdg-cell {
    background-color: #9370db;
    color: white;
  }

  &:hover .rdg-cell {
    background-color: #800080;
  }
`;

function rowKeyGetter(row) {
  return row.id;
}

const columns = [
  // SelectColumn,
  {
    field: "id",
    haveChildren: false,
    headerName: "ID",
    width: 80,
    resizable: true,
    cellEditor: textEditor,
    frozen: true,
  },
  {
    field: "avatar",
    haveChildren: false,
    headerName: "Avatar",
    width: 40,
    resizable: true,
    frozen: true,
    headerRenderer: () => <ImageFormatter value={faker.image.cats()} />,
    valueFormatter: ({ row }) => <ImageFormatter value={row.avatar} />,
  },
  {
    field: "title",
    haveChildren: false,
    headerName: "Title",
    width: 200,
    resizable: true,
    frozen: true,
    formatter(props) {
      return <>{props.row.title}</>;
    },
    option: [
      { label: "task1", value: "task1" },
      { label: "task2", value: "task2" },
    ],
    cellRenderer: dropDownEditor,
    editorOptions: {
      editOnClick: true,
    },
  },
  {
    field: "firstName",
    haveChildren: false,
    headerName: "First Name",
    width: 200,
  },
  {
    haveChildren: false,
    headerName: "Money",
    field: "money",
    width: 200,
    cellEditor: textEditor,
    validation: {
      style: { backgroundColor: "red", color: "blue" },
      method: (value) => value >= 100,
    },
  },
  {
    field: "lastName",
    haveChildren: false,
    headerName: "Last Name",
    width: 200,
    cellEditor: textEditor,
    resizable: true,

    // cellRenderer: textEditor,
  },
  {
    field: "email",
    haveChildren: false,
    headerName: "Email",
    width: "max-content",
    resizable: true,
    cellRenderer: textEditor,
  },
  {
    field: "street",
    haveChildren: false,
    headerName: "Street",
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "zipCode",
    haveChildren: false,
    headerName: "ZipCode",
    width: 200,
    resizable: true,
    cellRenderer: textEditor,
  },
  {
    field: "date",
    haveChildren: false,
    headerName: "Date",
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "bs",
    haveChildren: false,
    headerName: "bs",
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "catchPhrase",
    haveChildren: false,
    headerName: "Catch Phrase",
    width: "max-content",
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "companyName",
    haveChildren: false,
    headerName: "Company Name",
    width: 200,
    // resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "sentence",
    haveChildren: false,
    headerName: "Sentence",
    width: "max-content",
    resizable: true,
    // cellRenderer: textEditor,
  },
];

function createRows() {
  const rows = [];

  for (let i = 0; i < 2000; i++) {
    rows.push({
      id: `id_${i}`,
      avatar: faker.image.avatar(),
      email: faker.internet.email(),
      title: faker.name.prefix(),
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      street: faker.address.street(),
      zipCode: faker.address.zipCode(),
      date: faker.date.past().toLocaleDateString(),
      bs: faker.company.bs(),
      catchPhrase: faker.company.catchPhrase(),
      companyName: faker.company.name(),
      words: faker.lorem.words(),
      sentence: faker.lorem.sentence(),
      money: Math.floor(Math.random(0, 1000) * 1000),
    });
  }

  return rows;
}

export default function AllFeatures({ direction }) {
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState(() => new Set());

  const selectedCellHeaderStyle = {
    backgroundColor: "red",
    fontSize: "12px",
  };
  const selectedCellRowStyle = {
    backgroundColor: "yellow",
  };
  function handlePaste({
    sourceColumnKey,
    sourceRow,
    targetColumnKey,
    targetRow,
  }) {
    const incompatibleColumns = ["email", "zipCode", "date"];
    if (
      sourceColumnKey === "avatar" ||
      ["id", "avatar"].includes(targetColumnKey) ||
      ((incompatibleColumns.includes(targetColumnKey) ||
        incompatibleColumns.includes(sourceColumnKey)) &&
        sourceColumnKey !== targetColumnKey)
    ) {
      return targetRow;
    }

    return { ...targetRow, [targetColumnKey]: sourceRow[sourceColumnKey] };
  }

  function handleCopy({ sourceRow, sourceColumnKey }) {
    if (window.isSecureContext) {
      navigator.clipboard.writeText(sourceRow[sourceColumnKey]);
    }
  }

  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      rowKeyGetter={rowKeyGetter}
      onRowsChange={setRows}
      onFill={true}
      onCopy={handleCopy}
      onPaste={handlePaste}
      // rowHeight={30}
      headerRowHeight={24}
      selectedCellHeaderStyle={selectedCellHeaderStyle}
      selectedCellRowStyle={selectedCellRowStyle}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      className="fill-grid"
      rowClass={(row) =>
        row.id.includes("7") ? highlightClassname : undefined
      }
      direction={direction}
      restriction={{
        copy: true,
        paste: true,
      }}
    />
  );
}
