import React from "react";
import { css } from "@linaria/core";

const sliderContainer = css`
  display: flex;
  align-items: center;
`;
const sliderEditorInternalClassname = css`
  @layer rdg.SliderEditor {
    cursor: pointer;
    width: 85%;
    font-size: var(--rdg-font-size);
    font-family: var(--rdg-font-family);
  }
`;

export const sliderEditorClassname = `rdg-slider-editor ${sliderEditorInternalClassname}`;
export default function sliderEditor({ row, column, onRowChange }) {
  const value = row[column.key];
  return (
    <div className={sliderContainer}>
      <input
        type={"range"}
        value={value}
        className={sliderEditorClassname}
        {...column.inputProps}
        onChange={(e) => {
          onRowChange({ ...row, [column.key]: e.target.value });
        }}
      />
      {Math.round(value)}%
    </div>
  );
}
