import { useState } from "react";

import { Popover, Typography } from "@mui/material";

export default function FilterRendererWithSvg({
  filterClassname,
  filters,
  setFilters,
  column,
  setFilterType,
}) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const [iValue, setIvalue] = useState("");

  const getFilterValue = (event) => {
    const value = event.target.value;
    setFilterType(value);
  };

  const getInputValue = (event, filters) => {
    event.preventDefault();
    const value = event.target.value;

    setFilters({
      ...filters,
      [column.field]: value,
    });
  };

  return (
    <div className={filterClassname}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="10px"
        height="10px"
        version="1.1"
        // style="shapeRendering:geometricPrecision; textRendering:geometricPrecision; imageRendering:optimizeQuality; fillRule:evenodd; clipRule:evenodd"
        viewBox="0 0 507 511.644"
        onClick={handleClick}
        fill="white"
      >
        <g id="Layer_x0020_1">
          <metadata id="CorelCorpID_0Corel-Layer" />
          <path
            className="fil0"
            d="M192.557 241.772c5.368,5.842 8.316,13.476 8.316,21.371l0 232.663c0,14.002 16.897,21.109 26.898,11.265l64.905 -74.378c8.684,-10.422 13.475,-15.581 13.475,-25.901l0 -143.597c0,-7.897 3.001,-15.529 8.318,-21.373l186.236 -202.081c13.947,-15.159 3.21,-39.741 -17.424,-39.741l-459.536 0c-14.188,0 -23.722,11.594 -23.745,23.784 -0.01,5.541 1.945,11.204 6.321,15.957l186.236 202.031 0 0z"
          />
        </g>
      </svg>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Typography sx={{ p: 2 }}>
          <select style={{ width: "100%" }} onChange={getFilterValue}>
            <option>Contain</option>
            <option>Starts With...</option>
            <option>Ends With...</option>
            <option>Equals</option>
            <option>Not Equals</option>
          </select>

          <div>
            <input
              value={filters?.[column.field]}
              placeholder="Search..."
              onChange={(e) => getInputValue(e, filters)}
              onKeyDown={inputStopPropagation}
            />
          </div>
        </Typography>
      </Popover>
    </div>
  );
}

function inputStopPropagation(event) {
  if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.stopPropagation();
  }
}
