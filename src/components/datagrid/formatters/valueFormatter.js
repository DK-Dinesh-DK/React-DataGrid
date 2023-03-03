import { useRovingCellRef } from "../hooks";
import { getCellClassname } from "../utils";
import { css } from "@linaria/core";

export function valueFormatter(props) {
  function selectCellWrapper(openEditor) {
    let sampleColumn;
    subColumn?.map((data) => {
      if (props.column.field === data.field) {
        sampleColumn = data;
      }
    });

    props.selectCell(props.row, sampleColumn, openEditor);
  }

  function handleClick() {
    selectCellWrapper(props.column.editorOptions?.editOnClick);
    props.onRowClick?.(props.row, props.column);
  }

  function handleContextMenu() {
    selectCellWrapper();
  }

  function handleDoubleClick() {
    selectCellWrapper(true);
    props.onRowDoubleClick?.(props.row, props.column);
  }

  if (props.column.haveChildren === true) {
    return (
      <>
        <div
          style={{
            display: "flex",
            // gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
            // gridTemplateColumns: "1frb ".repeat(
            //   Object.fields(props.column.children).length
            // ),
          }}
        >
          {childData(props.column.children, props)}
        </div>
      </>
    );
  } else {
    return (
      // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <span
        style={{ width: "100%" }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        {props.row[props.column.field]}
      </span>
    );
  }
}

const childData = (subData, props) => {
  function flatten(into, node) {
    if (node == null) return into;
    if (Array.isArray(node)) return node.reduce(flatten, into);
    into.push(node);

    return flatten(into, node.children);
  }

  var rowSubData = flatten([], subData);
  var value1 = false;

  rowSubData = rowSubData.filter(function (item) {
    return item !== value1;
  });

  for (var i = 0; i < rowSubData.length; i++) {
    if (rowSubData[i].haveChildren) {
      rowSubData.splice(i, 1);
      i--;
    }
  }

  const rowCol = props.rowArray;
  const daataa = rowSubData.map((info, index) => {
    return info.field;
  });
  const { ref, tabIndex, onFocus } = useRovingCellRef(props.isCellSelected);
  return daataa.map((info1, index) => {
    var sdsd;
    if (index === daataa.length - 1) {
      sdsd = "none";
    } else {
      sdsd = "1px solid var(--rdg-border-color)";
    }
    const func = (a, b) => {
      if (a.field === b) {
        return a.width;
      } else {
        return null;
      }
    };
    var sampleColumn;
    props.subColumn?.map((obj) => {
      if (obj.field == info1) {
        sampleColumn = obj;
      }
    });
    function selectCellWrapper(openEditor) {
      props.selectCell(props.row, sampleColumn, openEditor);
    }

    function handleClick() {
      // alert("ggg",props)
      selectCellWrapper(props.column.editorOptions?.editOnClick);
      props.onRowClick?.(props.row, props.column);
    }

    function handleContextMenu() {
      selectCellWrapper();
    }

    function handleDoubleClick() {
      selectCellWrapper(true);
      props.onRowDoubleClick?.(props.row, props.column);
    }

    const cellCopied = css`
      @layer rdg.Cell {
        background-color: #ccccff;
      }
    `;

    const cellCopiedClassname = `rdg-cell-copied ${cellCopied}`;

    const cellDraggedOver = css`
      @layer rdg.Cell {
        background-color: #ccccff;

        &.${cellCopied} {
          background-color: #9999ff;
        }
      }
    `;

    const cellDraggedOverClassname = `rdg-cell-dragged-over ${cellDraggedOver}`;
    const className = getCellClassname(
      sampleColumn,
      `rdg-cell-column-${sampleColumn?.idx % 2 === 0 ? "even" : "odd"}`,
      {
        [cellCopiedClassname]: props.isCopied,
        [cellDraggedOverClassname]: props.isDraggedOver,
      },
      typeof props.cellClass === "function" ? cellClass(row) : props.cellClass
    );

    return (
      // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <span
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        aria-colindex={sampleColumn?.idx}
        ref={ref}
        tabIndex={tabIndex}
        className={className}
        aria-selected={props.selectedCellIdx == sampleColumn?.idx}
        style={{
          borderInlineEnd: "1px solid white",
          textAlign: "center",
          width: `${rowCol.map((info2) => {
            return func(info2, info1);
          })}px`.replace(/,/g, ""),
          borderBlockColor:
            props.selectedCellIdx == sampleColumn?.idx ? "red" : "yellow",
        }}
      >
        {/* <div style={{ borderInlineEnd: sdsd, textAlign: "center",height:"24px",width:100 }}> */}
        {props.row[info1]}
      </span>
    );
  });
};
