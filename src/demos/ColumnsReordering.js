import { useState } from 'react';
import DataGrid from '../components/datagrid/DataGrid';

function createRows() {
  const rows= [];
  for (let i = 1; i < 10; i++) {
    rows.push({
      id: i,
      task: `Task ${i}`,
      complete: Math.min(100, Math.round(Math.random() * 110)),
      priority: ['Critical', 'High', 'Medium', 'Low'][Math.round(Math.random() * 3)],
      issueType: ['Bug', 'Improvement', 'Epic', 'Story'][Math.round(Math.random() * 3)]
    });
  }
  return rows;
}

  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 80
    },
    {
      field: 'task',
      headerName: 'Title',
      resizable: true,
      sortable: true
    },
    {
      field: 'priority',
      headerName: 'Priority',
      resizable: true,
      sortable: true
    },
    {
      field: 'issueType',
      headerName: 'Issue Type',
      resizable: true,
      sortable: true
    },
    {
      field: 'complete',
      headerName: '% Complete',
      resizable: true,
      sortable: true
    }
  ];

export default function ColumnsReordering({ direction }) {
  const [rows] = useState(createRows);

  
  return (
      <DataGrid
        columnData={columns}
        rowData={rows}
        columnReordering={true}
        direction={direction}
        defaultColumnOptions={{ width: '1fr' }}
      />
  );
}
