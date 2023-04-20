import React, { useState, useMemo, useRef } from "react";
import { faker } from "@faker-js/faker";
import DataGrid from "../components/datagrid/DataGrid";
import moment from "moment";
import { ImageFormatter } from "../components/datagrid/components/Formatters/ImageFormatter";
import {
  timeEditor,
  colorPicker,
  dropDownEditor,
  sliderEditor,
  radioButtonEditor,
  progressBarEditor,
  linkEditor,
  dateEditor,
  checkboxEditor,
  textEditor,
  buttonEditor,
  dateTimeEditor,
  imageViewer,
} from "../components/datagrid/editors";

export default function CommonFeatures({ direction }) {
  function getColumns(countries, direction) {
    return [
      {
        field: "id",
        headerName: "ID",
        width: 60,
        resizable: false,
        summaryFormatter: () => {
          return <strong>Total</strong>;
        },
      },
      {
        field: "title",
        headerName: "Task",
        width: 120,
        filter: true,
        cellEditor: textEditor,
        summaryFormatter({ row }) {
          return <>{row.totalCount} records</>;
        },
      },
      {
        field: "client",
        headerName: "Client",
        width: "max-content",
        cellRenderer: textEditor,
      },
      {
        field: "avatar",
        headerName: "Avatar",
        width: 40,
        resizable: true,
        headerRenderer: () => <ImageFormatter value={faker.image.cats()} />,
        cellRenderer: imageViewer,
      },
      {
        field: "color",
        headerName: "Color Picker",
        cellRenderer: colorPicker,
        width: 100,
      },
      {
        field: "button",
        headerName: "Button",
        inputProps: { text: "Save" },
        cellRenderer: buttonEditor,
        onClick: (props) => {
          console.log("Button", props);
        },
      },
      {
        field: "country",
        headerName: "Country",
        width: 180,
        cellRenderer: dropDownEditor,
        options: countries,
        editorOptions: {
          editOnClick: true,
        },
      },
      {
        field: "check",
        headerName: "Check Box",
        cellRenderer: checkboxEditor,
      },
      {
        field: "endTimeStamp",
        headerName: "Deadline",
        valueFormatter: dateEditor,
      },
      {
        field: "endDateTimestamp",
        headerName: "DateandTime",
        cellRenderer: dateTimeEditor,
      },
      {
        field: "link",
        headerName: "Link",
        cellRenderer: linkEditor,
      },
      {
        field: "progress",
        headerName: "Progress",
        width: 150,
        cellRenderer: progressBarEditor,
      },
      {
        field: "slider",
        headerName: "Slider",
        cellRenderer: sliderEditor,
        width: 100,
      },
      {
        field: "gender",
        headerName: "Gender",
        options: [
          {
            label: "Male",
            value: "male",
          },
          {
            label: "FeMale",
            value: "female",
          },
          {
            label: "Others",
            value: "others",
          },
        ],
        cellRenderer: radioButtonEditor,
      },
      {
        field: "time",
        headerName: "Time",
        cellRenderer: timeEditor,
      },
    ];
  }

  function rowKeyGetter(row) {
    return row.id;
  }

  function createRows() {
    const now = Date.now();
    const rows = [];

    for (let i = 0; i < 100; i++) {
      rows.push({
        id: i,
        avatar: faker.image.avatar(),
        title: `Task #${i + 1}`,
        client: faker.company.name(),
        country: faker.address.country(),
        // color: faker.color.rgb(),
        assignee: faker.name.fullName(),
        progress: Math.random() * 100,
        slider: Math.random() * 100,
        endTimeStamp: now + Math.round(Math.random() * 1e10),
        endDateTimestamp: now + Math.round(Math.random() * 1e10),
        link: "www.google.com",
        gender: "male",
        time: moment(new Date()).format("hh:mm"),
      });
    }

    return rows;
  }
  const [rows, setRows] = useState(createRows);
  const [selectedRows, setSelectedRows] = useState([]);
  const countries = useMemo(() => {
    return [
      ...new Set(
        rows.map((r) => {
          return { label: r.country, value: r.country };
        })
      ),
    ].sort(new Intl.Collator().compare);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const columns = useMemo(
    () => getColumns(countries, direction),
    [countries, direction]
  );
  const gridRef = useRef();
  return (
    <>
      <button
        type="button"
        onClick={() => {
          let node = gridRef.current.api.getRowNode(20).data;
          gridRef.current.api.ensureColumnVisible("Count");
        }}
      >
        ensureColumnVisible
      </button>
      <DataGrid
        rowKeyGetter={rowKeyGetter}
        columnData={columns}
        rowData={rows}
        ref={gridRef}
        onRowsChange={setRows}
        selectedRows={selectedRows}
        onSelectedRowsChange={setSelectedRows}
        className="fill-grid"
        direction={direction}
        rowSelection={"multiple"}
        rowMultiSelectWithClick={true}
        selection={true}
      />
    </>
  );
}
