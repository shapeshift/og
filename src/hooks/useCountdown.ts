import { useCallback, useEffect, useState } from 'react'

export const useCountdown = (initialTimeMs: number, startImmediately = true) => {
  const [timeRemainingMs, setTimeRemainingMs] = useState(initialTimeMs)
  const [isRunning, setIsRunning] = useState(startImmediately)

  const reset = useCallback(() => {
    setTimeRemainingMs(initialTimeMs)
    setIsRunning(false)
  }, [initialTimeMs])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeRemainingMs(prev => {
        const next = Math.max(0, prev - 100)
        if (next === 0) setIsRunning(false)
        return next
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isRunning])

  return { timeRemainingMs, reset, start }
}

