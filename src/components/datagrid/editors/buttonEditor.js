import React from "react";
import { css } from "@linaria/core";

const buttonInternalClassname = css`
  @layer rdg.ButtonEditor {
    height: 22px;
    background-color: #4f81bd;
    color: #ffffff;
    border: 1px solid #ffffff;
    cursor: pointer;
    font-size: var(--rdg-font-size);
    font-family: var(--rdg-font-family);

    &:focus {
      background-color: #446ea1;
    }
  }
`;

export const buttonClassname = `rdg-button-editor ${buttonInternalClassname}`;
export default function buttonEditor({ row, column, ...props }) {
  let text;
  if (column.inputProps?.text !== undefined || column.inputProps?.text !== "") {
    text = column.inputProps?.text;
  } else if (row[column.key] !== undefined || row[column.key] !== "") {
    text = row[column.key];
  } else {
    text = column.headerName;
  }

  return (
    <>
      <button
        className={buttonClassname}
        disabled={column.editable ? column.editable : false}
        onClick={() => column.onClick({ row, column, ...props })}
        {...column.inputProps}
      >
        {text}
      </button>
    </>
  );
}
