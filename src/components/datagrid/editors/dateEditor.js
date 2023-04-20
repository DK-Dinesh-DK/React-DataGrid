import { css } from "@linaria/core";
import moment from "moment";

const datePickerInternalClassname = css`
  @layer rdg.DatePicker {
    border: none;
    height: 22px;
    background-color: #ffffff;
    font-size: var(--rdg-font-size);
   font-family: var(--rdg-font-family);
  }
`;

export const datePickerClassname = `rdg-date-picker-editor ${datePickerInternalClassname}`;
export default function dateEditor({ row, column, onRowChange }) {
  const value = row[column.key] ? row[column.key] : new Date();
  return (
    <>
      <input
        type={"date"}
        className={datePickerClassname}
        value={moment(row[column.key]).format("YYYY-MM-DD")}
        placeholder="dd-mmm-yyyy"
        disabled={column.editable ? column.editable : false}
        {...column.inputProps}
        onChange={(e) => {
            onRowChange({ ...row, [column.key]: new Date(e.target.value) });
        }}
      />
    </>
  );
}
