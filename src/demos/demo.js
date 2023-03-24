import {DataGrid} from "../../lib/bundle"
import React from "react";

function Demos(){
    const columns = [
        {
          field: "id",
          headerName: "ID",
          width: 80,
        },
        {
          field: "task",
          headerName: "Title",
        },
        {
          field: "priority",
          headerName: "Priority",
        },
        {
          field: "issueType",
          headerName: "Issue Type",
        },
        {
          field: "complete",
          headerName: "% Complete",
        },
        {
          field: "startDate",
          headerName: "Start Date",
        },
        {
          field: "completeDate",
          headerName: "Expected Complete",
          width: 200,
        },
      ];
return(
    <div>
        <DataGrid
        rowData={[]}
        columnData={columns}
        />
    </div>
)
}
export default Demos;