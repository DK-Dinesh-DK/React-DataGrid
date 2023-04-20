import AllFeatures from "./demos/AllFeatures";
import CommonFeatures from "./demos/CommonFeatures";
import { css } from "@linaria/core";
import React, {  useState } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Nav from "./demos/Nav";
import CellNavigation from "./demos/CellNavigation";
import NoRows from "./demos/NoRows";
import ColumnsReordering from "./demos/ColumnsReordering";
import ColumnSpanning from "./demos/ColumnSpanning";
import ContextMenuDemo from "./demos/ContextMenu";
import CustomizableComponents from "./demos/CustomizableComponents";
import Grouping from "./demos/Grouping";
import HeaderFilters from "./demos/HeaderFilters";
import InfiniteScrolling from "./demos/InfiniteScrolling";
import MasterDetail from "./demos/MasterDetail";
import MillionCells from "./demos/MillionCells";
import ResizableGrid from "./demos/Resizable";
import RowsReordering from "./demos/RowsReordering";
import ScrollToRow from "./demos/ScrollToRow";
import TreeView from "./demos/TreeView";
import VariableRowHeight from "./demos/VariableRowHeight";
import Animation from "./demos/Animation"
import Pagination from "./demos/Pagination";
import ExportFile from "./demos/ExportFile"
import Demos from "./demos/demo";
import AlignmentDataTypes from "./demos/AlignmentDataTypes";
import MultilineHeader from "./demos/MultilineHeader";

css`
  @at-root {
    :root,
    body {
      padding: 0;
      margin: 0;
      font-family: sans-serif;
    }

    :root {
      color-scheme: light dark;

      @media (prefers-color-scheme: light) {
        background-color: #fff;
        color: #111;
      }

      @media (prefers-color-scheme: dark) {
        background-color: hsl(0deg 0% 10%);
        color: #fff;
      }
    }

    #root {
      display: grid;
      /* flex-direction: column; */
      grid-template-columns: auto 1fr;
    }

    .rdg.fill-grid {
    }
    .rdg.small-grid {
      block-size: 300px;
    }
  }
`;

function App() {
  const [direction, setDirection] = useState("ltr");
  return (
    <Router>
      <Nav direction={direction} onDirectionChange={setDirection} />
      <main className="view-container" dir={direction}>
        <Routes>
          <Route index element={<Navigate to="common-features" replace />} />
          <Route
            path="common-features"
            element={<CommonFeatures direction={direction} />}
          />
          <Route
            path="all-features"
            element={<AllFeatures direction={direction} />}
          />
          <Route
            path="cell-navigation"
            element={<CellNavigation direction={direction} />}
          />
          <Route
            path="column-spanning"
            element={<ColumnSpanning direction={direction} />}
          />
          <Route
            path="columns-reordering"
            element={<ColumnsReordering direction={direction} />}
          />
          <Route
            path="context-menu"
            element={<ContextMenuDemo direction={direction} />}
          />
          <Route
            path="customizable-components"
            element={<CustomizableComponents direction={direction} />}
          />
          <Route path="grouping" element={<Grouping direction={direction} />} />
          <Route
            path="header-filters"
            element={<HeaderFilters direction={direction} />}
          />
          <Route
            path="infinite-scrolling"
            element={<InfiniteScrolling direction={direction} />}
          />
          <Route
            path="master-detail"
            element={<MasterDetail direction={direction} />}
          />
          <Route
            path="million-cells"
            element={<MillionCells direction={direction} />}
          />
          <Route path="no-rows" element={<NoRows direction={direction} />} />
          <Route
            path="resizable-grid"
            element={<ResizableGrid direction={direction} />}
          />
          <Route
            path="rows-reordering"
            element={<RowsReordering direction={direction} />}
          />
          <Route
            path="pagination-table"
            element={<Pagination direction={direction} />}
          />
          <Route
            path="scroll-to-row"
            element={<ScrollToRow direction={direction} />}
          />
          <Route
            path="tree-view"
            element={<TreeView direction={direction} />}
          />
            <Route
            path="export"
            element={<ExportFile direction={direction} />}
          />
          <Route
            path="variable-row-height"
            element={<VariableRowHeight direction={direction} />}
          />
            <Route
            path="demo"
            element={<Demos direction={direction} />}
          />
          <Route path="chnageinheight" element={<Animation direction={direction} />} />

          <Route path="alingment" element={<AlignmentDataTypes direction={direction} />} />

          <Route path="multilineheader" element={<MultilineHeader direction={direction} />} />
          <Route path="*" element="Nothing to see here" />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
