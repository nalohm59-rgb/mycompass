// 数値を日本円表記に (600000 → "600,000円")
export function fmtYen(n) {
  if (n == null || isNaN(Number(n))) return ''
  return `${Number(n).toLocaleString('ja-JP')}円`
}

// "2027-04" → "2027年4月"
export function fmtYearMonth(ym) {
  if (!ym) return null
  const [y, m] = ym.split('-')
  return `${y}年${parseInt(m, 10)}月`
}

// "2027-06-30" → "2027年6月30日"
export function fmtDate(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

// "2027-06-30" → "2027年6月" (月まで)
export function fmtDateMonth(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return null
  return `${d.getFullYear()}年${d.getMonth() + 1}月`
}
