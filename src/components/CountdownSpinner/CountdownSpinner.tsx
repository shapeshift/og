import { CircularProgress, Tooltip, useColorModeValue } from '@chakra-ui/react'
import { memo, useEffect } from 'react'

import { useCountdown } from '../../hooks/useCountdown'

type CountdownSpinnerProps = {
  isLoading: boolean
  initialTimeMs: number
}

export const CountdownSpinner = memo(({ isLoading, initialTimeMs }: CountdownSpinnerProps) => {
  const { timeRemainingMs, reset, start } = useCountdown(initialTimeMs, false)

  useEffect(() => {
    if (!isLoading) {
      reset()
      start()
    }
  }, [isLoading, reset, start])

  useEffect(() => {
    const handleFocus = () => {
      reset()
      start()
    }

    window.addEventListener('focus', handleFocus)

    return () => window.removeEventListener('focus', handleFocus)
  }, [reset, start])

  const secondsRemaining = Math.ceil(timeRemainingMs / 1000)

  return (
    <Tooltip 
      label={`The quote will refetch in ${secondsRemaining}s`}
      isDisabled={isLoading}
    >
      <CircularProgress
        size='20px'
        color='blue.500'
        trackColor={useColorModeValue('gray.50', 'gray.700')}
        value={timeRemainingMs}
        max={initialTimeMs}
        isIndeterminate={isLoading}
      />
    </Tooltip>
  )
})
