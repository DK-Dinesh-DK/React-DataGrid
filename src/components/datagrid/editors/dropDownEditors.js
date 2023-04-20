import React, { useRef } from "react";
import { css } from "@linaria/core";

const dropDownEditorInternalClassname = css`
  @layer rdg.DropDownEditor {
    width: 100%;
    height: 20px;

    /* styling */
    font-size: var(--rdg-font-size);
    font-family: var(--rdg-font-family);
    background-color: white;
    border: none;
    display: inline-block;
    font: inherit;
    line-height: 1.5em;
    padding: 0 0 0 1em;

    /* reset */

    margin: 0;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-appearance: none;
    -moz-appearance: none;

    /* arrows */

    background-image: linear-gradient(45deg, transparent 50%, white 50%),
      linear-gradient(135deg, white 50%, transparent 50%),
      radial-gradient(#95b3d7 100%, transparent 72%);

    background-position: calc(100% - 10px) calc(8px), calc(100% - 6px) calc(8px),
      calc(100% - 2px) 2px;

    background-size: 5px 5px, 5px 6px, 1.5em 1.5em;
    background-repeat: no-repeat;

    &:focus {
      background-image: linear-gradient(45deg, white 50%, transparent 50%),
        linear-gradient(135deg, transparent 50%, white 50%),
        radial-gradient(#95b3d7 100%, transparent 72%);
      background-position: calc(100% - 5px) 8px, calc(100% - 9px) 8px,
        calc(100% - 2px) 2px;
      background-size: 5px 5px, 5px 5px, 1.5em 1.5em;
      background-repeat: no-repeat;
      border-color: green;
      outline: 0;
    }

    select:-moz-focusring {
      color: transparent;
      text-shadow: 0 0 0 #000;
    }
  }
`;

export const dropDownEditorClassname = `rdg-dropdown-editor ${dropDownEditorInternalClassname}`;
export default function dropDownEditor({ row, onRowChange, column }) {
  const options = column.options;
  const inputRef = useRef(null);
  return (
    <>
      <select
        value={row[column.key]}
        ref={inputRef}
        key={column.rowIndex}
        onBlurCapture={() => {
          console.log("Captureddd");
        }}
        onChange={(event) => {
          onRowChange({ ...row, [column.key]: event.target.value }, true);
          inputRef.current.blur();
        }}
        className={dropDownEditorClassname}
      >
        {options?.map((data, index) => {
          return <option key={index}>{data.label}</option>;
        })}
      </select>
    </>
  );
}
