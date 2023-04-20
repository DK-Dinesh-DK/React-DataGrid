import { css } from "@linaria/core";

export default function radioButtonEditor({ row, column, onRowChange }) {
  const options = column.options ? column.options : column.buttons;

  const radioButtonContainer = css`
    display: flex;
    font-size: var(--rdg-font-size);
    font-family: var(--rdg-font-family);
    flex-direction: row;
    & > div {
      display: flex;
      align-items: center;
    }
  `;
  const radioButton = css`
    width: 12px;
    height: 12px;
    /* UI Properties */
    background: #ffffff;
    border: 0.9998000264167786px solid #95b3d7;
    border-radius: 50%;
    padding: 2px;
    &:checked {
      background-clip: content-box;
      background-color: #366092;
    }
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  `;
  return (
    <div className={`rdg-radio-container${radioButtonContainer}`}>
      {options.map((option, index) => {
        return (
          <div key={index}>
            <input
              type={"radio"}
              value={option.value}
              className={`rdg-radiobutton ${radioButton}`}
              key={index}
              name={`options${column.rowIndex}`}
              checked={row[column.key] === option?.value}
              onChange={(event) => {
                onRowChange({ ...row, [column.key]: event.target.value });
              }}
            />
            <label>{option.label}</label>
          </div>
        );
      })}
    </div>
  );
}
