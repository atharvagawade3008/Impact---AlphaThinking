import { ChevronDown } from 'lucide-react'

export function SelectField({ label, value, options = [], onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="select-wrap">
        <select value={value} onChange={(event) => onChange?.(event.target.value)}>
          {options.map((option) => {
            const optValue = typeof option === 'object' ? option.value : option
            const optLabel = typeof option === 'object' ? option.label : option
            return (
              <option key={optValue} value={optValue}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  )
}

export default SelectField
