import { useState } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";

import { SelectColumn } from "../components/datagrid/Columns";
import textEditor from "../components/datagrid/editors/textEditor";

import DataGrid from "../components/datagrid/DataGrid";

import dropDownEditor from "../components/datagrid/editors/textEditor";
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
  SelectColumn,
  {
    field: "id",
    headerName: "ID",
    topHeader: "id",
    width: 80,
    frozen: true,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    width: 80,
    frozen: true,
    topHeader: "avatar",
    headerRenderer: () => <ImageFormatter value={faker.image.cats()} />,
    valueFormatter: ({ row }) => <ImageFormatter value={row.avatar} />,
  },
  {
    field: "title",
    headerName: "Title",
    width: 200,
    topHeader: "title",
    valueFormatter(props) {
      return <>{props.row.title}</>;
    },
    cellRenderer: dropDownEditor,
    editorOptions: {
      editOnClick: true,
    },
  },
  {
    field: "firstName",
    headerName: "First Name",
    width: 200,
    topHeader: "firstName",
    frozen: true,
    cellRenderer: (props) => {
      return textEditor(props);
    },
  },
  {
    field: "lastName",
    headerName: "Last Name",
    width: 200,
    topHeader: "lastName",
    frozen: true,
    cellRenderer: textEditor,
  },
  {
    field: "email",
    headerName: "Email",
    width: 100,
    topHeader: "email",
    cellRenderer: textEditor,
  },
  {
    field: "street",
    headerName: "Street",
    width: 200,
    topHeader: "street",
    cellRenderer: textEditor,
  },
  {
    field: "zipCode",
    headerName: "ZipCode",
    width: 200,
    topHeader: "zipCode",
    cellRenderer: textEditor,
  },
  {
    field: "date",
    headerName: "Date",
    width: 200,
    topHeader: "date",
    cellRenderer: textEditor,
  },
  {
    field: "bs",
    headerName: "bs",
    width: 200,
    topHeader: "bs",
    cellRenderer: textEditor,
  },
  {
    field: "catchPhrase",
    headerName: "Catch Phrase",
    width: 200,
    topHeader: "catchPhrase",
    cellRenderer: textEditor,
  },
  {
    field: "companyName",
    headerName: "Company Name",
    width: 200,
    topHeader: "companyName",
    cellRenderer: textEditor,
  },
  {
    field: "sentence",
    headerName: "Sentence",
    width: 100,
    topHeader: "sentence",
    cellRenderer: textEditor,
  },
];

function createRows() {
  const rows = [];

  for (let i = 0; i < 100; i++) {
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
      summaryRowHeight={24}
      selectedCellHeaderStyle={selectedCellHeaderStyle}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      className="fill-grid"
      // rowClass={(row) =>
      //   row.id.includes("7") ? highlightClassname : undefined
      // }
      direction={direction}
    />
  );
}
