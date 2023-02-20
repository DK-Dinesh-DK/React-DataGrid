import React from "react";
// import { ComboBox } from "lai_webui";
// import ComboBox from "lai_webui/dist/UI/ComboBox";

export default function dropDownEditor({ row, onRowChange, column }) {
  const option = column.option;

  return (
    // <ComboBox
    //   options={option}
    //   {...column.inputProps}
    //   disabled={column.editable ? column.editable : false}
    //   onChange={(event) =>
    //     onRowChange({ ...row, [column.key]: event.target.value }, true)
    //   }
    //   value={row[column.key]}
    // />
    <>
      <select
        value={row[column.key]}
        onChange={(event) => {
          onRowChange({ ...row, [column.key]: event.target.value }, true);
        }}
        style={{width:"100%"}}
      >
        {option?.map((data, index) => {
          return <option key={data.value}>{data.label}</option>;
        })}
      </select>
    </>
  );
}
