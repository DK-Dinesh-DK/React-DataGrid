import { useContext } from "react";
import { useFocusRef } from "./hooks";
import FilterContext from "./filterContext";

export default function FilterRenderer({ isCellSelected, column, children,onFocus,onClick,onDoubleClick,selectedCellHeaderStyle ,selectedPosition }) {
    const filters = useContext(FilterContext);
    const { ref, tabIndex } = useFocusRef(isCellSelected);

    var style = {paddingLeft:"8px"};
    selectedCellHeaderStyle && selectedPosition.idx === column.idx
      ? (style = { ...style, ...selectedCellHeaderStyle })
      : style;
  
    return (
      <>
        {!column.sortable && <div  style={{ ...style }}>{column.headerName}</div>}
        {filters.enabled && <div >{children({ ref, tabIndex, filters })}</div>}
      </>
    );
  }