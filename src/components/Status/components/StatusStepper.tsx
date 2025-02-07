import { Flex, Progress } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { IconType } from 'react-icons'

export type StepProps = {
  title: string
  icon: IconType
}

const getProgressPercentage = (state?: string, isRefunded?: boolean, isFailed?: boolean) => {
  if (isFailed) return 100
  if (isRefunded) return 100

  // Map states to progress percentages
  switch (state) {
    case 'waiting':
      return 1
    case 'receiving':
      return 20
    case 'swapping':
      return 40
    case 'sending':
      return 60
    case 'sent':
      return 80
    case 'completed':
      return 100
    default:
      return 1
  }
}

export const StatusStepper = ({
  state,
  isRefunded,
  isFailed,
}: {
  state?: string
  isRefunded?: boolean
  isFailed?: boolean
}) => {
  const progress = getProgressPercentage(state, isRefunded, isFailed)

  const colorScheme = useMemo(() => {
    if (isFailed || isRefunded) return 'red'
    if (state === 'completed') return 'green'
  }, [isFailed, isRefunded, state])

  return (
    <Flex
      bg='background.surface.raised.base'
      px={4}
      flexDir='column'
      gap={4}
      borderBottomWidth={1}
      borderColor='border.base'
    >
      <Progress
        isAnimated
        hasStripe
        value={progress}
        size='sm'
        colorScheme={colorScheme}
        bg='gray.100'
        borderRadius='full'
        mb={4}
      />
      <Flex gap={4} justify='space-between'></Flex>
    </Flex>
  )
}
