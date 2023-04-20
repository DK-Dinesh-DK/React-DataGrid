import { useDefaultComponents } from "./DataGridDefaultComponentsProvider";
import { useFocusRef } from "./hooks";
import { css } from "@linaria/core";
const headerSortCell = css`
  @layer rdg.SortableHeaderCell {
    cursor: pointer;
    padding-left:8px;

    &:focus {
      outline: none;
    }
  }
`;

// gridTemplateColumns: "`100%/Object.keys(subData.children).length` ".repeat(
//   Object.keys(subData.children).length
// ),

const headerSortCellClassname = `rdg-header-sort-cell ${headerSortCell}`;

const headerSortName = css`
  @layer rdg.SortableHeaderCellName {
    flex-grow: 1;
    overflow: hidden;
    overflow: clip;
    text-overflow: ellipsis;
  }
`;
const headerSortNameClassname = `rdg-header-sort-name ${headerSortName}`;

export default function SortableHeaderCell({
  onSort,
  selectedPositionIdx,
  subCellIdx,
  sortDirection,
  priority,
  children,
  isCellSelected,
  column,
  borderBottom,
}) {
  const sortStatus = useDefaultComponents().sortStatus;

  var { ref, tabIndex } = useFocusRef(isCellSelected);

  function handleKeyDown(event) {
    if (event.key === " " || event.key === "Enter") {
      // stop propagation to prevent scrolling
      event.preventDefault();
      onSort(event.ctrlKey || event.metaKey, children);
    }
  }

  function handleClick(event) {
    onSort(event.ctrlKey || event.metaKey, children);
  }
  

  return (
    <span
      ref={ref}
      tabIndex={tabIndex}
      className={headerSortCellClassname}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
     
    >
      <span className={headerSortNameClassname}>{children}</span>
     { selectedPositionIdx===subCellIdx && <span>{sortStatus({ sortDirection, priority })}</span>}
    </span>
  );
}
