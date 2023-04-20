import { SelectCellFormatter } from "../formatters";

export default function checkboxEditor({
  row,
  column,
  onRowChange,
  isCellSelected,
}) {
  return (
    <>
      <SelectCellFormatter
        value={row[column.key]}
        onChange={() => {
          onRowChange({ ...row, [column.key]: !row[column.key] });
        }}
        isCellSelected={isCellSelected}
      />
    </>
  );
}
