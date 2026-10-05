const memoryStorage = new Map<string, string>()

export function readMockStorage<T>(key: string, fallback: T): T {
  try {
    const value = window.localStorage.getItem(key)
    if (!value) return fallback
    return JSON.parse(value) as T
  } catch {
    const value = memoryStorage.get(key)
    if (!value) return fallback
    try {
      return JSON.parse(value) as T
    } catch {
      return fallback
    }
  }
}

export function writeMockStorage<T>(key: string, value: T) {
  const serialized = JSON.stringify(value)
  memoryStorage.set(key, serialized)
  try {
    window.localStorage.setItem(key, serialized)
  } catch {
    // Keep this demo session alive in memory if browser storage is unavailable.
  }
}

export function removeMockStorage(key: string) {
  memoryStorage.delete(key)
  try {
    window.localStorage.removeItem(key)
  } catch {
    // The in-memory demo store is already cleared.
  }
}
