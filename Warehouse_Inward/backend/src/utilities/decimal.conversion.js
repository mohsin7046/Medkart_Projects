export function decimalConversion(val) {
  if (typeof val !== 'number') return null
  if (val > 0) {
    return val.toFixed(3)
  }
  return null
}
