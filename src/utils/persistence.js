export function get(name) {
  const valueStr = localStorage.getItem(name)
  if (!valueStr) return null
  return JSON.parse(valueStr)
}

export function set(name, value) {
  const valueStr = JSON.stringify(value)
  localStorage.setItem(name, valueStr)
}