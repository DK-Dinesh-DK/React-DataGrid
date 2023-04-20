import React, { useRef, useState } from "react";
import { css } from "@linaria/core";

const colorInput = css`
  @layer rdg.ColorInput {
    /* display: none; */
    all: unset;
    width: 0;
  }
`;

export const colorInputClassname = `rdg-color-input ${colorInput}`;

export default function colorPicker({ row, column, onRowChange }) {
  let ref = useRef(null);

  const handleClick = () => {
    ref.current.click();
    setClicked(true);
  };

  const checkbox = css`
    @layer rdg.ColorPicker {
      height: 100%;
      width: 80%;
    }
  `;

  const colorPickerClassname = `rdg-colorPicker ${checkbox}`;
  const iconClass = css`
    width: 22px;
    height: 100%;
    background-color: white;
    background-image: linear-gradient(45deg, transparent 50%, white 50%),
      linear-gradient(135deg, white 50%, transparent 50%),
      radial-gradient(#95b3d7 100%, transparent 72%);

    background-position: calc(100% - 10px) calc(8px), calc(100% - 6px) calc(8px),
      calc(100% - 2px) 2px;

    background-size: 5px 5px, 5px 6px, 1.5em 1.5em;
    background-repeat: no-repeat;
  `;
  const iconClassclicked = css`
    width: 22px;
    height: 100%;
    background-image: linear-gradient(45deg, white 50%, transparent 50%),
      linear-gradient(135deg, transparent 50%, white 50%),
      radial-gradient(#95b3d7 100%, transparent 72%);
    background-position: calc(100% - 5px) 8px, calc(100% - 9px) 8px,
      calc(100% - 2px) 2px;
    background-size: 5px 5px, 5px 5px, 1.5em 1.5em;
    background-repeat: no-repeat;
    background-repeat: no-repeat;
  `;
  const [clicked, setClicked] = useState(false);
  return (
    <div
      onClick={handleClick}
      style={{
        display: "flex",
        flexDirection: "row",
        height: "20px",
        margin: "2px 0",
      }}
    >
      <input
        type="color"
        ref={ref}
        id={`color${column.rowIndex}`}
        className={colorInputClassname}
        value={row[column.key]}
        onChange={(event) => {
          onRowChange({ ...row, [column.key]: event.target.value });
          setClicked(false);
        }}
       
      />
      <div
        className={colorPickerClassname}
        style={{ backgroundColor: `${row[column.key] ?? "white"}` }}
      ></div>
      <div className={ iconClass}></div>
    </div>
  );
}
