import moment from "moment";
import { css } from "@linaria/core";
const dateTimePickerInternalClassname = css`
  @layer rdg.DateTimePicker {
    border: none;
    height: 22px;
    background-color: #ffffff;
    font-size: var(--rdg-font-size);
   font-family: var(--rdg-font-family);
  }
`;

export const dateTimePickerClassname = `rdg-date-picker-editor ${dateTimePickerInternalClassname}`;

export default function dateTimeEditor({ row, column, onRowChange }) {
  return (
    <>
      <input
        type={"datetime-local"}
        value={moment(row[column.key]).format("YYYY-MM-DDThh:mm")}
        className={dateTimePickerClassname}
        disabled={column.editable ? column.editable : false}
        {...column.inputProps}
        onChange={(e) =>
          onRowChange({ ...row, [column.key]: new Date(e.target.value) })
        }
      />
    </>
  );
}
