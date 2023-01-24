import React from "react";
import { css } from "@linaria/core";
import { row } from "./row";

const lightTheme = `
  --rdg-color: #000;
  --rdg-border-color: #FFFFFF;
  --rdg-summary-border-color: #aaa;
  --rdg-background-color: hsl(0deg 0% 100%);
  --rdg-header-background-color: #16365D;
  --rdg-header-row-color: #FFFFFF;
  --rdg-row-hover-background-color: #D7E3BC;
  --rdg-row-selected-background-color: hsl(207deg 76% 92%);
  --rdg-row-selected-hover-background-color: hsl(207deg 76% 88%);

  --rdg-checkbox-color: hsl(207deg 100% 29%);
  --rdg-checkbox-focus-color: hsl(207deg 100% 69%);
  --rdg-checkbox-disabled-border-color: #ccc;
  --rdg-checkbox-disabled-background-color: #ddd;
`;

const darkTheme = `
  --rdg-color: #ddd;
  --rdg-border-color: #FFFFFF;
  --rdg-summary-border-color: #555;
  --rdg-background-color: hsl(0deg 0% 13%);
  --rdg-header-background-color: #16365D;
  --rdg-row-hover-background-color: #D7E3BC;
  --rdg-row-selected-background-color: hsl(207deg 76% 42%);
  --rdg-row-selected-hover-background-color: hsl(207deg 76% 38%);

  --rdg-checkbox-color: hsl(207deg 100% 79%);
  --rdg-checkbox-focus-color: hsl(207deg 100% 89%);
  --rdg-checkbox-disabled-border-color: #000;
  --rdg-checkbox-disabled-background-color: #333;
`;

const root = css`
  @layer rdg {
    @layer Defaults,
      FocusSink,
      CheckboxInput,
      CheckboxIcon,
      CheckboxLabel,
      Cell,
      HeaderCell,
      SummaryCell,
      EditCell,
      Row,
      HeaderRow,
      SummaryRow,
      GroupedRow,
      Root;

    @layer Defaults {
      *,
      *::before,
      *::after {
        box-sizing: inherit;
      }
    }
    .rdg-row-even,
    .rdg-row-summary-row-even,
    .rdg-row-groupRow-even {
      background-color: #e5edf8;
    }
    .rdg-row-odd,
    .rdg-row-summary-row-odd,
    .rdg-row-groupRow-odd {
      background-color: #f3f8fc;
    }
    @layer Root {
      ${lightTheme}
      --rdg-selection-color: #66afe9;
      --rdg-font-size: 11px;

      display: grid;

      color-scheme: var(--rdg-color-scheme, light dark);

      /* https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Positioning/Understanding_z_index/The_stacking_context */
      /* We set a stacking context so internal elements don't render on top of external elements. */
      contain: strict;
      content-visibility: auto;
      block-size: 350px;
      border: 1px solid var(--rdg-border-color);
      box-sizing: border-box;
      overflow: auto;
      background-color: var(--rdg-background-color);
      color: var(--rdg-color);
      font-size: var(--rdg-font-size);
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;

      /* needed on Firefox */
      &::before {
        content: "";
        grid-column: 1/-1;
        grid-row: 1/-1;
      }

      &.rdg-dark {
        --rdg-color-scheme: dark;
        ${darkTheme}
      }

      &.rdg-light {
        --rdg-color-scheme: light;
      }

      @media (prefers-color-scheme: dark) {
        &:not(.rdg-light) {
          ${darkTheme}
        }
      }
    }
  }
`;

export const rootClassname = `rdg ${root}`;

const viewportDragging = css`
  @layer rdg.Root {
    user-select: none;

    & .${row} {
      cursor: move;
    }
  }
`;

export const viewportDraggingClassname = `rdg-viewport-dragging ${viewportDragging}`;

export const focusSinkClassname = css`
  @layer rdg.FocusSink {
    grid-column: 1/-1;
    pointer-events: none;
    /* Should have a higher value than 2 to show up above header row */
    z-index: 3;
  }
`;

export const filterColumnClassName = 'filter-cell';

export const filterContainerClassname = css`
  .${filterColumnClassName} {
    line-height: 35px;
    padding: 0;

    > div {
      padding-block: 0;
      padding-inline: 8px;

      &:last-child {
        border-block-start: 1px solid var(--rdg-border-color);
      }
    }
  }
`;
