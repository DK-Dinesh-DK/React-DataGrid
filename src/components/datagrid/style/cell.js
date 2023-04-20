import React from "react";
import { css } from "@linaria/core";

export const cell = css`
  @layer rdg.Cell {
    /* max-content does not work with size containment
     * dynamically switching between different containment styles incurs a heavy relayout penalty
     * Chromium bug: at odd zoom levels or subpixel positioning, layout/paint containment can make cell borders disappear
     *   https://bugs.chromium.org/p/chromium/issues/detail?id=1326946
     */
    contain: style;
    position: relative; /* needed for absolute positioning to work */
    padding-block: 0;
    padding-inline: 0px;
    border-inline-end: 1px solid var(--rdg-border-color);
    border-block-end: 1px solid var(--rdg-border-color);
    grid-row-start: var(--rdg-grid-row-start);
    background-color: inherit;
    text-align: center;
    display: flex;
    justify-content: center;

    white-space: nowrap;
    overflow: hidden;
    overflow: clip;
    text-overflow: ellipsis;
    outline: none;

    &[aria-selected="true"] {
      outline: 1px solid var(--rdg-selection-color);
      outline-offset: -2px;
    }
   
  }
`;

export const cellClassname = `rdg-cell ${cell}`;

export const cellFrozen = css`
  @layer rdg.Cell {
    position: sticky;
    /* Should have a higher value than 0 to show up above unfrozen cells */
    z-index: 1;
  }
`


export const cellFrozenClassname = `rdg-cell-frozen ${cellFrozen}`;

export const cellFrozenLast = css`
  @layer rdg.Cell {
    box-shadow: calc(2px * var(--rdg-sign)) 0 5px -2px rgba(136, 136, 136, 0.3);
  }
`;

export const cellFrozenLastClassname = `rdg-cell-frozen-last ${cellFrozenLast}`;

export const cellEditorClassname = css`
  @layer rdg.Cell {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
`;
export const rowIsSelected = css`
  @layer rdg.Cell {
    border-block-start: 1px solid #9bbb59;
    border-block-end: 1px solid #9bbb59;
  }
`;
export const rowIsSelectedClassName = `rdg-middle-row-is-selected ${rowIsSelected}`;
export const topRowIsSelected = css`
  @layer rdg.Cell {
    border-block-end: 1px solid #9bbb59;
  }
`;
export const topRowIsSelectedClassName = `rdg-top-row-is-selected ${topRowIsSelected}`;
export const bottomRowIsSelected = css`
  @layer rdg.Cell {
    border-block-start: 1px solid #9bbb59;
  }
`;
export const bottomRowIsSelectedClassName = `rdg-bottom-row-is-selected ${bottomRowIsSelected}`;
