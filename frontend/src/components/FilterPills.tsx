interface FilterOption {
  key: string
  label: string
  count: number
}

export function FilterPills({
  options,
  active,
  onChange,
}: {
  options: FilterOption[]
  active: string
  onChange: (key: string) => void
}) {
  return (
    <div className="filter-pills">
      {options.map((opt) => (
        <button
          key={opt.key}
          className={`filter-pill${active === opt.key ? ' active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
          <span className="count">{opt.count}</span>
        </button>
      ))}
    </div>
  )
}
