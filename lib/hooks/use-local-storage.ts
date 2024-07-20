import { useState, useEffect } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value))
        window.dispatchEvent(new Event('local-storage-change'))
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  }

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item))
        }
      } catch (error) {
        console.error('Error handling storage change:', error)
      }
    }

    window.addEventListener('local-storage-change', handleStorageChange)
    return () =>
      window.removeEventListener('local-storage-change', handleStorageChange)
  }, [key])

  return [storedValue, setValue]
}
