interface RankingItem {
  key: string | number
  label: string
  value: number
  displayValue: string
}

export function RankingBars({
  items,
  emptyMessage,
  color = 'menta',
}: {
  items: RankingItem[]
  emptyMessage: string
  color?: 'menta' | 'celeste'
}) {
  if (items.length === 0) {
    return <p className="empty-state">{emptyMessage}</p>
  }

  const max = Math.max(...items.map((i) => i.value), 1)

  return (
    <div className="ranking-bars">
      {items.map((item) => (
        <div className="ranking-row" key={item.key}>
          <div className="ranking-row-header">
            <span className="ranking-label">{item.label}</span>
            <span className="ranking-value">{item.displayValue}</span>
          </div>
          <div className="ranking-track">
            <div
              className={color === 'celeste' ? 'ranking-fill celeste' : 'ranking-fill'}
              style={{ width: `${Math.max((item.value / max) * 100, 4)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
