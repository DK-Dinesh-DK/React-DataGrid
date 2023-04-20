import React from "react";
import { css } from "@linaria/core";
import { SelectCellFormatter } from "./formatters";
import { useRowSelection } from "./hooks/useRowSelection";
export const SERIAL_NUMBER_COLUMN_KEY = "serial-number";
export const SELECT_COLUMN_KEY = "select-row";

const headerCellClassName = css`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #16365d;
  color: white;
  font-weight: bold;
`;

function SelectFormatter(props) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select"
      isCellSelected={props.isCellSelected}
      value={isRowSelected}
      onChange={(checked, isShiftClick) => {
        onRowSelectionChange({ row: props.row, checked, isShiftClick });
      }}
    />
  );
}

function SelectGroupFormatter(props) {
  const [isRowSelected, onRowSelectionChange] = useRowSelection();

  return (
    <SelectCellFormatter
      aria-label="Select Group"
      isCellSelected={props.isCellSelected}
      value={isRowSelected}
      onChange={(checked) => {
        onRowSelectionChange({ row: props.row, checked, isShiftClick: false });
      }}
    />
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SelectColumn = {
  key: SELECT_COLUMN_KEY,
  name: "",
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  filter: false,
  haveChildren: false,
  headerRenderer(props) {
    return (
      <SelectCellFormatter
        aria-label="Select All"
        isCellSelected={props.isCellSelected}
        value={props.allRowsSelected}
        onChange={props.onAllRowsSelectionChange}
      />
    );
  },
  cellRenderer(props) {
    return <SelectFormatter {...props} />;
  },
  groupFormatter(props) {
    return <SelectGroupFormatter {...props} />;
  },
};
export const SerialNumberColumn = {
  key: `${SERIAL_NUMBER_COLUMN_KEY}`,
  name: "Sr. No.",
  width: 45,
  resizable: false,
  sortable: false,
  frozen: true,
  filter: false,
  haveChildren: false,
  headerRenderer: () => {
    return <div>{SerialNumberColumn.name}</div>;
  },
  cellClass: headerCellClassName,
  cellRenderer: (props) => {
    return <>{props.column.rowIndex + 1} </>;
  },
};
