import { useState, useReducer, useCallback } from "react";
import { css } from "@linaria/core";
import { faker } from "@faker-js/faker";
import DataGrid from "../components/datagrid/DataGrid";

css`
  @at-root {
    .react-contextmenu-wrapper {
      display: contents;
    }

    .react-contextmenu {
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: 0.25rem;
      color: #373a3c;
      font-size: 16px;
      margin-block-start: 2px;
      margin-block-end: 0;
      margin-inline-start: 0;
      margin-inline-end: 0;
      min-inline-size: 160px;
      outline: none;
      opacity: 0;
      padding-block: 5px;
      padding-inline: 0;
      pointer-events: none;
      text-align: start;
      transition: opacity 250ms ease !important;
    }

    .react-contextmenu.react-contextmenu--visible {
      opacity: 1;
      pointer-events: auto;
    }

    .react-contextmenu-item {
      background: 0 0;
      border: 0;
      color: #373a3c;
      cursor: pointer;
      font-weight: 400;
      line-height: 1.5;
      padding-block: 3px;
      padding-inline: 20px;
      text-align: inherit;
      white-space: nowrap;
    }

    .react-contextmenu-item.react-contextmenu-item--active,
    .react-contextmenu-item.react-contextmenu-item--selected {
      color: #fff;
      background-color: #20a0ff;
      border-color: #20a0ff;
      text-decoration: none;
    }

    .react-contextmenu-item.react-contextmenu-item--disabled,
    .react-contextmenu-item.react-contextmenu-item--disabled:hover {
      background-color: transparent;
      border-color: rgba(0, 0, 0, 0.15);
      color: #878a8c;
    }

    .react-contextmenu-item--divider {
      border-block-end: 1px solid rgba(0, 0, 0, 0.15);
      cursor: inherit;
      margin-block-end: 3px;
      padding-block: 2px;
      padding-inline: 0;
    }

    .react-contextmenu-item--divider:hover {
      background-color: transparent;
      border-color: rgba(0, 0, 0, 0.15);
    }

    .react-contextmenu-item.react-contextmenu-submenu {
      padding: 0;
    }

    .react-contextmenu-item.react-contextmenu-submenu
      > .react-contextmenu-item::after {
      content: "▶";
      display: inline-block;
      position: absolute;
      inset-inline-end: 7px;
    }

    .example-multiple-targets::after {
      content: attr(data-count);
      display: block;
    }
  }
`;

function createRows() {
  const rows = [];

  for (let i = 1; i < 1000; i++) {
    rows.push({
      id: i,
      product: faker.commerce.productName(),
      price: faker.commerce.price(),
    });
  }

  return rows;
}

const columns = [
  { field: "id", headerName: "ID", haveChildren: false },
  { field: "product", headerName: "Product", haveChildren: false },
  { field: "price", headerName: "Price", haveChildren: false },
];

function rowKeyGetter(row) {
  return row.id;
}

export default function ContextMenuDemo({ direction }) {
  const getContextMenuItems = useCallback((params) => {
    var result = [
      {
        // custom item
        name: "Alert ",
        action: () => {
          window.alert("Alerting about ");
        },
        cssClasses: ["redFont", "bold"],
      },
      {
        // custom item
        name: "Always Disabled",
        disabled: true,
        tooltip:
          "Very long tooltip, did I mention that I am very long, well I am! Long!  Very Long!",
      },
      {
        name: "Country",
      },
      {
        name: "Person",
        subMenu: [
          {
            name: "Niall",
            action: () => {
              console.log("Niall was pressed");
            },
          },
          {
            name: "Sean",
            action: () => {
              console.log("Sean was pressed");
            },
          },
          {
            name: "John",
            action: () => {
              console.log("John was pressed");
            },
          },
          {
            name: "Alberto",
            action: () => {
              console.log("Alberto was pressed");
            },
          },
          {
            name: "Tony",
            action: () => {
              console.log("Tony was pressed");
            },
          },
          {
            name: "Andrew",
            action: () => {
              console.log("Andrew was pressed");
            },
          },
          {
            name: "Kev",
            action: () => {
              console.log("Kev was pressed");
            },
          },
          {
            name: "Will",
            action: () => {
              console.log("Will was pressed");
            },
          },
          {
            name: "Armaan",
            action: () => {
              console.log("Armaan was pressed");
            },
          },
        ],
      },
      {
        // custom item
        name: "Windows",
        shortcut: "Alt + W",
        action: () => {
          console.log("Windows Item Selected");
        },
        icon: '<img src="https://www.ag-grid.com/example-assets/skills/windows.png" />',
      },
      {
        // custom item
        name: "Mac",
        shortcut: "Alt + M",
        action: () => {
          console.log("Mac Item Selected");
        },
        icon: '<img src="https://www.ag-grid.com/example-assets/skills/mac.png"/>',
      },
      {
        // custom item
        name: "Checked",
        checked: true,
        action: () => {
          console.log("Checked Selected");
        },
        icon: '<img src="https://www.ag-grid.com/example-assets/skills/mac.png"/>',
      },
    ];
    return result;
  }, []);

  return (
    <DataGrid
      rowKeyGetter={rowKeyGetter}
      columnData={columns}
      rowData={createRows()}
      className="fill-grid"
      direction={direction}
      headerRowHeight={24}
      getContextMenuItems={getContextMenuItems}
    />
  );
}
