import React from "react";
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function CSVContent(fileData, columns) {
  const field = columns?.map((ele) => ele.field);
  const header = columns?.map((ele) => ele.headerName);
  const data = fileData.map((f) => {
    let sample = [];
    field.map((d) => {
      if (d !== undefined) {
        sample.push(f[d]);
      } else {
        sample.push("");
      }
    });
    if (sample.length > 0) {
      return sample;
    }
  });
  const content = [header, ...data]
    .map((cells) => cells.map(serialiseCellValue).join(","))
    .join("\n");
  return content;
}
export async function exportToCsv(fileData, columns, fileName) {
  downloadFile(
    fileName,
    new Blob([CSVContent(fileData, columns)], {
      type: "text/csv;charset=utf-8;",
    })
  );
}

export async function exportToPdf(fileData, columns, fileName) {
  let field = [];
  columns?.map((ele) => {
    if (ele.field) {
      field.push({ dataKey: ele.field, header: ele.headerName });
    }
  });

  let doc = new jsPDF("p", "pt", "letter");
  autoTable(doc, { html: "#my-table" });
  autoTable(doc, {
    margin: { top: 10 },
    styles: { cellWidth: "wrap", overflow: "visible", halign: "center" },
    headStyles: {
      fillColor: "#16365D",
      textColor: "white",
      halign: "center",
      lineColor: "White",
      lineWidth: 1,
    },
    body: fileData,
    theme: "striped",
    columns: field,
  });

  doc.save(fileName);
}

export function exportToXlsx(fileData, columns, fileName) {
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
  const fileExtension = ".xlsx";

  const ws = XLSX.utils.json_to_sheet(fileData);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
}

function serialiseCellValue(value) {
  if (typeof value === "string") {
    const formattedValue = value.replace(/"/g, '""');
    return formattedValue.includes(",")
      ? `"${formattedValue}"`
      : formattedValue;
  }
  return value;
}

function downloadFile(fileName, data) {
  const downloadLink = document.createElement("a");
  downloadLink.download = fileName;
  const url = URL.createObjectURL(data);
  downloadLink.href = url;
  downloadLink.click();
  URL.revokeObjectURL(url);
}
