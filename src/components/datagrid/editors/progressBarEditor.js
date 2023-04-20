import { css } from "@linaria/core";

const progressBar = css`
  @layer rdg.ProgressBar {
    height: 5px;
    width: 90%;
    background-color: #f5f5f5;
    display: flex;
    flex-direction: row;
  }
`;
const progress = css`
  @layer rdg.Progress {
    background-color: #16365D;
    height: 100%;
  }
`;
const progressContainer = css`
  @layer rdg.ProgressContainer {
    display: flex;
    align-items: center;
    flex-direction: row;
    width: 100%;
    height: 100%;
    column-gap: 5%;
    font-size: var(--rdg-font-size);
    font-family: var(--rdg-font-family);
  }
`;

export default function progressBarEditor({ column, row, onRowChange }) {
  const value = row[column.key];
  return (
    <div className={`rdg-progressBar-container ${progressContainer}`}>
      <div class={`rdg-progress-bar ${progressBar}`}>
        <div
          class={`rdg-progress ${progress}`}
          // aria-valuenow={value}
          // aria-valuemin="0"
          // aria-valuemax="100"
          style={{ width: `${value}%` }}
        ></div>
      </div>
      {Math.round(value)}%
    </div>
  );
}
