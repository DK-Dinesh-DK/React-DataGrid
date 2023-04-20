import { createContext, useContext, useMemo, useState } from "react";
import { faker } from "@faker-js/faker";
// import { SelectColumn } from "../components/datagrid/Columns";

import textEditor from "../components/datagrid/editors/textEditor";

import DataGrid from "../components/datagrid/DataGrid";

import dropDownEditor from "../components/datagrid/editors/dropDownEditors";
import ImageFormatter from "./ImageFormatter";
import { useFocusRef } from "../components/datagrid/hooks";
import { css } from "@linaria/core";
import {
  SelectColumn,
  SerialNumberColumn,
} from "../components/datagrid/Columns";
import FilterContext from "../components/datagrid/filterContext";

function EmptyRowsRenderer() {
  return (
    <div style={{ textAlign: "center", gridColumn: "1/-1" }}>
      Nothing to show{" "}
      <span lang="ja" title="ショボーン">
        (´・ω・`)
      </span>
    </div>
  );
}

const selectedCellHeaderStyle = {
  backgroundColor: "red",
  fontSize: "12px",
};
const selectedCellRowStyle = {
  backgroundColor: "yellow",
};

const frameworkComponents = {
  CheckBox: (props) => <button style={{ width: "100%" }}>Save</button>,
};

// const FilterContext = createContext(undefined);

function rowKeyGetter(row) {
  return row.id;
}

const columns = [
  SelectColumn,
  {
    field: "id",
    headerName: "ID",
    width: 50,
    // haveChildren: false,
    // topHeader: "id",
    sortable: true,
    frozen: true,
    cellEditor: textEditor,
    // filter: true,
    // cellRenderer: textEditor,
  },
  {
    field: "rdrd",
    headerName: "AASS",
    // haveChildren: false,
    frozen: true,
    // topHeader: "rdrd",
    width: 60,
    cellEditor: textEditor,

    // filter: true,

    // cellRenderer: textEditor,
    // cellRenderer: textEditor,
  },

  {
    field: "title",
    headerName: "Title",
    // sortable: true,
    // haveChildren: false,
    cellEditor: textEditor,
    frozen: true,
    // topHeader: "title",
    width: 300,
  },
  {
    field: "cvcv",
    headerName: "FGHT",
    // haveChildren: false,
    frozen: true,
    filter: true,
    // topHeader: "cvcv",
    cellEditor: textEditor,
    width: 80,
  },
  {
    field: "erer",
    headerName: "FGHT",
    // haveChildren: false,
    // topHeader: "erer",
    sortable: true,
    filter: true,
    width: 80,
    frozen: true,
  },
  {
    field: "count",
    headerName: "Count",
    haveChildren: true,
    // frozen: true,
    // topHeader: "count",
    children: [
      // SelectColumn,
      {
        field: "nnnn",
        headerName: "NNNN",
        haveChildren: true,
        // topHeader: "count",
        children: [
          {
            field: "xxxx",
            headerName: "XXXX",
            // haveChildren: false,
            // topHeader: "count",
            cellEditor: textEditor,
            width: 100,
            // filter: true,
            // sortable: true,
          },

          {
            field: "jjjj",
            headerName: "JJJJ",
            haveChildren: true,
            // topHeader: "count",
            children: [
              {
                field: "ffff",
                headerName: "FFFF",
                // haveChildren: false,
                width: 100,
                // topHeader: "count",
                cellEditor: textEditor,
                // filter:true
              },
              {
                field: "vvvv1",
                headerName: "VVVV1",
                haveChildren: true,
                // topHeader: "count",
                children: [
                  {
                    field: "llll",
                    headerName: "LLLL",
                    // haveChildren: false,
                    width: 100,
                    // topHeader: "count",
                    // filter:true,
                  },
                  {
                    field: "pppp",
                    headerName: "PPPP",
                    haveChildren: true,
                    // topHeader: "count",
                    children: [
                      {
                        field: "eeee",
                        headerName: "EEEE",
                        // haveChildren: false,
                        width: 100,
                        // topHeader: "count",
                        // filter:true,
                      },
                      {
                        field: "pppp1",
                        headerName: "PPPP1",
                        haveChildren: true,
                        width: 100,
                        // topHeader: "count",
                        children: [
                          {
                            field: "eeee1",
                            headerName: "EEEE1",
                            // haveChildren: false,
                            width: 100,
                            // topHeader: "count",
                            // sortable: true,
                            // filter:true
                            // children: [
                            //   {
                            //     field: "eeee11",
                            //     headerName: "EEEE11",
                            // haveChildren: false,
                            //     width: 100,
                            //     // topHeader: "count",
                            //     // sortable: true,
                            //     filter:true
                            //   },
                            //   {
                            //     field: "pppp211",
                            //     headerName: "PPPP211",
                            // haveChildren: false,
                            //     width: 100,
                            //     // topHeader: "count",
                            filter: true,
                            //   },
                            // ],
                          },
                          {
                            field: "pppp2",
                            headerName: "PPPP2",
                            // haveChildren: false,
                            width: 100,
                            // topHeader: "count",
                            sortable: true,
                            filter: true,
                            cellEditor: textEditor,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        field: "oooo",
        headerName: "OOOO",

        width: 100,
        // haveChildren: false,
        topHeader: "count",
        sortable: true,
        // filter: true,
      },
      {
        field: "qqqq",
        headerName: "QQQQ",
        width: 100,
        // haveChildren: false,
        // topHeader: "count",
        sortable: true,
        // filter: true,
      },
    ],
  },
];

function createRows() {
  const rows = [];

  for (let i = 0; i < 25000; i++) {
    rows.push({
      id: `${i}`,

      erer: faker.internet.email(),
      title: faker.name.prefix(),
      ffff: faker.name.firstName(),
      cvcv: faker.name.lastName(),
      qqqq: faker.internet.email(),
      oooo: faker.address.zipCode(),
      // dffd: faker.date.past().toLocaleDateString(),
      // pppp2: faker.company.bs(),
      xxxx: faker.name.firstName(),
      eeee1: faker.company.name(),
      rdrd: faker.lorem.words(),
      pppp2: faker.lorem.sentence(),
    });
  }

  return rows;
}

export default function MultilineHeader({ direction }) {
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState([]);

  return (
    // <FilterContext.Provider value={filters}>
    <DataGrid
      columnData={columns}
      rowData={rows}
      onRowsChange={setRows}
      renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
      // frameworkComponents={frameworkComponents}
      // selectedCellHeaderStyle={selectedCellHeaderStyle}
      //selectedCellRowStyle={selectedCellRowStyle}
      headerRowHeight={24}
      rowKeyGetter={rowKeyGetter}
      rowSelection={"single"}
      classheaderName="fill-grid"
      className="fill-grid"
      // direction={direction}
    />
    // </FilterContext.Provider>
  );
}
