import React from 'react';
import { textEditorClassname } from "../../editors/textEditor";

const titles = ["Dr.", "Mr.", "Mrs.", "Miss", "Ms."]

export default function dropDownEditor({ row, onRowChange }) {
  return (
    <select
      // className={textEditorClassname}
      value={row.title}
      onChange={event =>
        onRowChange({ ...row, title: event.target.value }, true)
      }
      // rome-ignore lint/a11y/noAutofocus: <explanation>
        autoFocus
    >
      {titles.map(title => (
        <option key={title} value={title}>
          {title}
        </option>
      ))}
    </select>
  )
}
