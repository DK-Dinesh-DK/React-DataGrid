import { css } from "@linaria/core";
import moment from "moment";

export default function timeEditor({ row, column, onRowChange }) {
  const value = row[column.key]
    ? row[column.key]
    : moment(new Date()).format("hh:mm");

  const timeEditorClassName = css`
    @layer rdg.TimeEditor {
      font-size: var(--rdg-font-size);
      font-family: var(--rdg-font-family);
    }
  `;
  return (
    <>
      <input
        type={"time"}
        value={value}
        className={`rdg-time-editor ${timeEditorClassName}`}
        disabled={column.editable ? column.editable : false}
        {...column.inputProps}
        onChange={(e) => {
          onRowChange({ ...row, [column.key]: e.target.value });
        }}
      />
    </>
  );
}
