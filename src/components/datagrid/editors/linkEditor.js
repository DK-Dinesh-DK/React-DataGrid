import { css } from "@linaria/core";

const linkEditorInternalClassname = css`
  @layer rdg.LinkEditor {
    letter-spacing: 0px;
    color: #000000;
    opacity: 1;
    text-decoration: underline !important;
    height: 14px;
    font-size: var(--rdg-font-size);
    font-family: var(--rdg-font-family);
  }
`;

export const linkEditorClassname = `rdg-link-editor ${linkEditorInternalClassname}`;
export default function linkEditor({ row, column }) {
  return (
    <>
      <a href={row[column.key]} className={linkEditorClassname} target="blank">
        {row[column.key]}
      </a>
    </>
  );
}
