// export function valueFormatter(props) {
//   try {
//     return(
//       <>

// import { useState } from "react";

//       <span>{props.row[props.column.field]}</span>
//       </>
//       )
//   } catch {
//     return null;
//   }
// }

export function valueFormatter(props) {
  function selectCellWrapper(openEditor) {
    let sampleColumn;
    props.subColumn.map((data) => {
      if (props.column.field === data.field) {
        sampleColumn = data;
      }
    });
    // console.log("sampleColumn12", sampleColumn, openEditor);
    props.selectCell(props.row, sampleColumn, openEditor);
  }

  function handleClick() {
    selectCellWrapper(props.column.editorOptions?.editOnClick);
    props.onRowClick?.(props.row, props.column);
    //console.log("werttt", props.column);
  }

  function handleContextMenu() {
    selectCellWrapper();
  }

  function handleDoubleClick() {
    selectCellWrapper(true);
    props.onRowDoubleClick?.(props.row, props.column);
    //console.log("werttty", props.column);
  }

  if (props.column.haveChildren === true) {
    return (
      <>
        <div
          key={props.column.idx}
          style={{
            display: "flex",
            height: "100%",
            justifyContent: "center",
            alignItems: "center",
            // gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
            // gridTemplateColumns: "1frb ".repeat(
            //   Object.fields(props.column.children).length
            // ),
          }}>
          {childData(props.column.children, props)}
        </div>
      </>
    );
  } else {
    var isCellSelected;
    if (props.selectedCellIdx === props.column.idx) {
      isCellSelected = true;
    } else {
      isCellSelected = false;
    }
    //console.log("idxxxx15",Array.isArray( props.column));

    return (
      // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div
        key={props.column.field}
        style={{
          width: "100%",
          textAlign: "center",
          textOverflow: "ellipsis",
          overflow: "hidden",
          height: "inherit",
          paddingInline:
            isCellSelected && props.selectedCellEditor ? "0px" : "6px",
        }}
        // className={props.className}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}>
        {isCellSelected && props.selectedCellEditor
          ? props.selectedCellEditor
          : props.row[props.column.field]}
      </div>
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

  //   const daataa = React.useMemo(() => {items.map(info => {
  //     return info.field;
  //   })
  //  }, [items]);

  //console.log("rowCol23", rowCol);
  return rowSubData.map((info1, index) => {
    const func = (a, b) => {
      if (a.field === b) {
        return a.width;
      } else {
        return null;
      }
    };
    function selectCellWrapper(openEditor) {
      let sampleColumn;
      props.subColumn?.map((obj) => {
        if (obj.field === info1.field) {
          sampleColumn = obj;
        }
      });
      //console.log("sampleColumn", sampleColumn, openEditor);
      props.selectCell(props.row, sampleColumn, openEditor);
    }

    function handleClick() {
      selectCellWrapper(info1.editorOptions?.editOnClick);
      props.onRowClick?.(props.row, info1);
    }

    function handleContextMenu() {
      selectCellWrapper();
    }

    function handleDoubleClick() {
      selectCellWrapper(true);
      props.onRowDoubleClick?.(props.row, info1);
      //console.log("werttt", info1);
    }

    var isCellSelected;
    if (props.selectedCellIdx === info1.idx) {
      isCellSelected = true;
    } else {
      isCellSelected = false;
    }

    // }

    //console.log("idxxxx155", isCellSelected);

    return (
      // rome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
      <div
        onClick={handleClick}
        key={info1.idx}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        style={{
          borderInlineEnd:
            isCellSelected && props.selectedCellEditor
              ? "none"
              : "1px solid var(--rdg-border-color)",
          textAlign: "center",
          textOverflow: "ellipsis",
          overflow: "hidden",
          height: "inherit",
          outline:
            props.selectedCellIdx === info1.idx && isCellSelected
              ? "1px solid var(--rdg-selection-color)"
              : "none",
          outlineOffset:
            props.selectedCellIdx === info1.idx && isCellSelected
              ? "-1px"
              : "0px",
          paddingInline:
            isCellSelected && props.selectedCellEditor ? "0px" : "6px",
          width: `${rowCol.map((info2) => {
            return func(info2, info1.field);
          })}px`.replace(/,/g, ""),
        }}>
        {/* <div style={{ borderInlineEnd: sdsd, textAlign: "center",height:"24px",width:100 }}> */}

        {isCellSelected && props.selectedCellEditor
          ? props.selectedCellEditor
          : props.row[info1.field]}
      </div>
    );
  });
};
