import React from 'react'

const FiltersDropdown = ({options, filters, setFilters, column}) => {
  return (
    <select style={{width:"100%"}}
      onChange={(e) =>
      setFilters({
        ...filters,
        [column.key]: e.target.value
      })
    }>
    {options.map((x) => <option key={x.value} value={x.value}>{x.listname}</option>)}
    </select>
  )
}

export default FiltersDropdown
