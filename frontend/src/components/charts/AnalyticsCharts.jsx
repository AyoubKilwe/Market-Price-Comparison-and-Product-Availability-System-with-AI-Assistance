const palette = ['#0d9488', '#2563eb', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export function BarChart({ data = [], valueKey = 'value', labelKey = 'label', format = (value) => value }) {
  const max = Math.max(1, ...data.map((item) => Number(item[valueKey]) || 0));
  return <div className="analytics-bar-chart">{data.length ? data.map((item, index) => <div className="analytics-bar-row" key={item[labelKey] || index}>
    <span title={item[labelKey]}>{item[labelKey]}</span><div><i style={{ width: `${((Number(item[valueKey]) || 0) / max) * 100}%`, background: palette[index % palette.length] }} /></div><b>{format(item[valueKey])}</b>
  </div>) : <div className="analytics-empty">No activity recorded yet.</div>}</div>;
}

export function DonutChart({ data = [], valueKey = 'value', labelKey = 'label' }) {
  const total = data.reduce((sum, item) => sum + (Number(item[valueKey]) || 0), 0);
  let cursor = 0;
  const stops = data.map((item, index) => { const start = cursor; cursor += total ? (item[valueKey] / total) * 100 : 0; return `${palette[index % palette.length]} ${start}% ${cursor}%`; });
  return <div className="analytics-donut-wrap"><div className="analytics-donut" style={{ background: total ? `conic-gradient(${stops.join(',')})` : '#e2e8f0' }}><strong>{total}</strong><span>Total</span></div><div className="analytics-legend">{data.map((item, index) => <div key={item[labelKey]}><i style={{ background: palette[index % palette.length] }} /><span>{item[labelKey]}</span><b>{item[valueKey]}</b></div>)}</div></div>;
}

export function LineChart({ data = [], valueKey = 'value', labelKey = 'label', format = (value) => value }) {
  const values = data.map((item) => Number(item[valueKey]) || 0);
  const min = Math.min(...values, 0); const max = Math.max(...values, 1); const range = max - min || 1;
  const points = data.map((item, index) => ({ ...item, x: data.length === 1 ? 300 : 25 + index * (550 / (data.length - 1)), y: 175 - ((item[valueKey] - min) / range) * 145 }));
  const path = points.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ');
  return <div className="analytics-line-chart">{data.length ? <><svg viewBox="0 0 600 210" role="img" aria-label="Price changes over time"><line x1="25" y1="175" x2="575" y2="175" /><path d={path} />{points.map((point) => <g key={`${point[labelKey]}-${point.x}`}><circle cx={point.x} cy={point.y} r="5"><title>{point[labelKey]}: {format(point[valueKey])}</title></circle></g>)}</svg><div className="analytics-axis"><span>{data[0]?.[labelKey]}</span><span>{data.at(-1)?.[labelKey]}</span></div></> : <div className="analytics-empty">No price history recorded yet.</div>}</div>;
}
