import React, { useState } from 'react'
import { css } from "@linaria/core"
import { exportToCsv, exportToPdf, exportToXlsx } from './exportUtils'

const toolbarClassname = css`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-block-end: 8px;
`
const ExportData = (props) => {
  return (
    <>
    <div className={toolbarClassname}>
        <ExportButton
          onExport={() => exportToCsv(props.gridElement, "CommonFeatures.csv")}
        >
          Export to CSV
        </ExportButton>
        <ExportButton
          onExport={() => exportToXlsx(props.gridElement, "CommonFeatures.xlsx")}
        >
          Export to XSLX
        </ExportButton>
        <ExportButton
          onExport={() => exportToPdf(props.gridElement, "CommonFeatures.pdf")}
        >
          Export to PDF
        </ExportButton>
      </div>
      {props.gridElement}
    </>
  )
}
export function ExportButton({ onExport, children }) {
    const [exporting, setExporting] = useState(false)
    return (
      <button
        disabled={exporting}
        onClick={async () => {
          setExporting(true)
          await onExport()
          setExporting(false)
        }}
      >
        {exporting ? "Exporting" : children}
      </button>
    )
  }
  
export default ExportData;