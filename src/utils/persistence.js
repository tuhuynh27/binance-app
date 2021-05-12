export function usePersistence(name) {
  return {
    get() {
      const valueStr = localStorage.getItem(name)
      if (!valueStr) return null
      return JSON.parse(valueStr)
    },
    set(value) {
      const valueStr = JSON.stringify(value)
      localStorage.setItem(name, valueStr)
    }
  }
}
