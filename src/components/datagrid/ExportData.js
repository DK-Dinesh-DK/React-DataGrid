import React, { useState } from 'react'
import { css } from "@linaria/core"
import { exportToCsv, exportToPdf, exportToXlsx } from './exportUtils'

const toolbarClassname = css`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-block-end: 8px;
`

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
  
