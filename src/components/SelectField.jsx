import { ChevronDown } from 'lucide-react'

export function SelectField({ label, value, options = [], onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="select-wrap">
        <select value={value} onChange={(event) => onChange?.(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={15} />
      </div>
    </label>
  )
}
export default SelectField
