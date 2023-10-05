import React from "react";

export default function QtySelect({name, quantity = 1, onChange}) {  

  const options = [];
  for (let i = 1; i <= 10; i++) {
    if (i === quantity) {
      options.push(<option key={i} selected={i}>{i}</option>)    
    } else {
      options.push(<option key={i} value={i}>{i}</option>)    
    }
  }

  return (
    <select
      className="form-select d-flex"
      name={name}
      onChange={onChange}
    >
      {options}
    </select>
  )
}