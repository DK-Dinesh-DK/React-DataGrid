import { ImageFormatter } from "../components/Formatters/ImageFormatter";
export default function imageViewer({ row, column }) {
  return <ImageFormatter value={row[column.key]} />;
}
