import { createContext, useContext, useMemo, useState } from "react";

// import { SelectColumn } from "../components/datagrid/Columns";

import textEditor from "../components/datagrid/editors/textEditor";

import DataGrid from "../components/datagrid/DataGrid";

import dropDownEditor from "../components/datagrid/editors/dropDownEditors";
import ImageFormatter from "./ImageFormatter";
import { useFocusRef } from "../components/datagrid/hooks";
import { css } from "@linaria/core";
import { SerialNumberColumn } from "../components/datagrid/Columns";

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

const frameworkComponents = {
  CheckBox: (props) => <button style={{ width: "100%" }}>Save</button>,
};

const FilterContext = createContext(undefined);

function rowKeyGetter(row) {
  return row.id;
}

export default function NoRows({ direction }) {
  const [selectedRows, onSelectedRowsChange] = useState(() => new Set());
  const [filters, setFilters] = useState({
    title: "",
    count: "",
    enabled: true,
  });

  const columns = useMemo(() => {
    return [
      SerialNumberColumn,
      {
        field: "id",
        headerName: "ID",
        width: 50,
        haveChildren: false,
        topHeader: "id",
        width: 60,
        frozen: true,
        cellEditor: textEditor,
      },
      {
        field: "rdrd",
        headerName: "AASS",
        haveChildren: false,
        topHeader: "rdrd",
        width: 60,
        sortable: true,
      },

      {
        field: "title",
        headerName: "Title",
        haveChildren: true,
        cellEditor: textEditor,
        // frozen: true,

        children: [
          // SelectColumn,
          {
            field: "aaaa",
            headerName: "AAAA",

            haveChildren: true,
            children: [
              {
                field: "cccc",
                headerName: "CCCC",
                haveChildren: false,
                width: 100,
                topHeader: "title",
              },

              {
                field: "dddd",
                headerName: "DDDD",
                haveChildren: false,
                width: 100,
                topHeader: "title",
              },
              {
                field: "eeee",
                headerName: "EEEE",
                haveChildren: false,
                width: 100,
                topHeader: "title",
              },
            ],
          },
          {
            field: "bbbb",
            headerName: "BBBB",
            haveChildren: true,
            children: [
              {
                field: "gggg",
                headerName: "GGGG",
                haveChildren: false,
                width: 100,
                topHeader: "title",
              },
              {
                field: "hhhh",
                headerName: "HHHH",
                haveChildren: false,
                width: 100,
                topHeader: "title",
              },
            ],
          },
          {
            field: "zzzz",
            headerName: "ZZZZ",
            width: 100,
            haveChildren: true,
            children: [
              {
                field: "jjjj",
                headerName: "JJJJ",
                haveChildren: false,
                width: 100,
                topHeader: "title",
              },
              {
                field: "kkkk",
                headerName: "KKKK",
                haveChildren: true,
                topHeader: "title",
                width: 100,
                children: [
                  {
                    field: "llll",
                    headerName: "LLLL",
                    haveChildren: false,
                    topHeader: "title",
                    sortable: true,
                    width: 60,
                  },
                  {
                    field: "mmmm",
                    headerName: "MMMM",
                    haveChildren: false,
                    topHeader: "title",
                    width: 60,
                  },
                ],
              },
            ],
          },
        ],
      },
    ];
  }, []);

  function createRows(numberOfRows) {
    const row = [];

    for (let i = 0; i < numberOfRows; i++) {
      row[i] = {
        id: i,
        rdrd: `column ${i}`,
        cccc: `column ${i}`,
        dddd: `column ${i}`,
        eeee: `column ${i}`,
        ffff: `column ${i}`,
        gggg: `column ${i}`,
        hhhh: `column ${i}`,
        iiii: `column ${i}`,
        jjjj: `column ${i}`,
        kkkk: `column ${i}`,
        llll: `column ${i}`,
        mmmm: `column ${i}`,
      };
    }

    return row;
  }
  const rows = createRows(10);
  const selectedCellHeaderStyle = {
    backgroundColor: "red",
    fontSize: "12px",
  };
  const selectedCellRowStyle = {
    backgroundColor: "yellow",
  };
  return (
    <FilterContext.Provider value={filters}>
      <DataGrid
        columnData={columns}
        rowData={rows}
        renderers={{ noRowsFallback: <EmptyRowsRenderer /> }}
        selectedRows={selectedRows}
        onSelectedRowsChange={onSelectedRowsChange}
        frameworkComponents={frameworkComponents}
        headerRowHeight={24}
        rowKeyGetter={rowKeyGetter}
        selectedCellHeaderStyle={selectedCellHeaderStyle}
        selectedCellRowStyle={selectedCellRowStyle}
        className="fill-grid"
      />
    </FilterContext.Provider>
  );
}
