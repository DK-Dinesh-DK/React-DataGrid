import { useMemo } from 'react';
import { css } from '@linaria/core';
import clsx from 'clsx';

import DataGrid from '../components/datagrid/DataGrid';


const rows= [...Array(11).keys()];

const colSpanClassname = css`
.rdg-cell[aria-colspan] {
  background-color: #ffb300;
  color: black;
  text-align: center;
}
`;

const rowSpanClassname = css`
  .rdg-cell[aria-rowspan] {
    background-color: #97ac8e;
    color: black;
    text-align: center;
    z-index: 2;
  }
`;


function cellFormatter(props) {
  return (
    <>
      {props.column.key}&times;{props.row}
    </>
  );
}

export default function ColumnSpanning({ direction }) {
  const columns = useMemo(() => {
    const columns = [];

    for (let i = 0; i < 11; i++) {
      const key = String(i);
      columns.push({
        field : key,
        headerName: key,
        topHeader:key,
        haveChildren:false,
        // frozen: i < 5,
        resizable: true,
        cellRenderer: cellFormatter,
        colSpan(args) {
          if (args.type === 'ROW') {
            if (key === '2' && args.row === 2) return 3;
            // if (key === '4' && args.row === 4) return 6; // Will not work as colspan includes both frozen and regular columns
            // if (key === '0' && args.row === 5) return 5;
            // if (key === '27' && args.row === 8) return 3;
            // if (key === '6' && args.row < 8) return 2;
          }
          if (args.type === 'HEADER' && key === '8') {
            return 3;
          }
          return undefined;
        },
        rowSpan(args) {
          if (args.type === 'ROW') {
            if (key === '0' && args.row === 2) return 5;
            if (key === '1' && args.row === 4) return 6;
          }
          return undefined;
        }
      });
    }

    return columns;
  }, []);

  return (
    <DataGrid
      columnData={columns}
      rowData={rows}
      rowHeight={22}
      className={clsx('fill-grid', colSpanClassname, rowSpanClassname)}
      direction={direction}
      headerRowHeight={24}
        classheaderName="fill-grid"
    />
  );
}
