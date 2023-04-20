import { useState } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";

// import { SelectColumn } from "../components/datagrid/Columns";
import textEditor from "../components/datagrid/editors/textEditor";

import DataGrid from "../components/datagrid/DataGrid";
// import DataGrid from "../../lib/bundle"

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
    headerName: "ID",
    
    width: 80,
    resizable: true,
    cellEditor: textEditor,
    // sortable:true,
    frozen: true,
  },
  {
    field: "avatar",
    headerName: "Avatar",
    
    width: 40,
    resizable: true,frozen: true,
    headerRenderer: () => <ImageFormatter value={faker.image.cats()} />,
    valueFormatter: ({ row }) => <ImageFormatter value={row.avatar} />,
  },
  {
    field: "title",
    headerName: "Title",
   
    sortable:true,
    width: 200,
    resizable: true,frozen: true,
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
    filter: true,
    headerName: "First Name",
    
    cellEditor: textEditor,
    width: 200,
    resizable: true,
    
    // cellRenderer: (props) => {

    //   return textEditor(props);
    // },
    // cellRenderer: (props) => {
    
    //   // return <input value={props.row.firstName} onChange={(e)=> { ...props.row, [props.column.key]: e.target.value }} />
    //   return (
    //     <input
    //       value={props.row.firstName}
    //       onChange={(e) => {
    //    
    //         setRows([
    //           ...props.allrow,
    //           (props.allrow[props.rowIndex] = {
    //             ...props.row,
    //             [props.column.key]: e.target.value,
    //           }),
    //         ]);
    //       }}
    //     />
    //   );
    // },
  },
  

  {
    headerName: "Money",
    field: "money",
    cellEditor: textEditor,
    filter:true,
    sortable:true,
    // frozen: true,
    // alignment:true,
    width:100,
   
  },
  {
    field: "lastName",
    headerName: "Last Name",
    
    width: 200,
    cellEditor: textEditor,
    resizable: true,
    
    // cellRenderer: textEditor,
  },
  {
    field: "email",
    headerName: "Email",
    
    width: "max-content",
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "street",
    headerName: "Street",
    
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "zipCode",
    headerName: "ZipCode",
    
    width: 200,
    resizable: true,
    cellRenderer: textEditor,
  },
  {
    field: "date",
    headerName: "Date",
    
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "bs",
    headerName: "bs",
    
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "catchPhrase",
    headerName: "Catch Phrase",
    
    width: "max-content",
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "companyName",
    headerName: "Company Name",
    
    width: 200,
    resizable: true,
    // cellRenderer: textEditor,
  },
  {
    field: "sentence",
    headerName: "Sentence",
    
    width: "max-content",
    resizable: true,
    // cellRenderer: textEditor,
  },
];

function createRows() {
  const rows = [];

  for (let i = 0; i < 25000; i++) {
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
      money:`₹${100+i}`
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
      
      // sortColumns={sortColumns}
      // onSortColumnsChange={setSortColumns}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      // rowHeight={30}
      headerRowHeight={24}
      selectedCellHeaderStyle={selectedCellHeaderStyle}
      selectedCellRowStyle={selectedCellRowStyle}

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
