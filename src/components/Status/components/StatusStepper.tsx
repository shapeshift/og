import {
  Center,
  CircularProgress,
  Flex,
  Progress,
  Step,
  Stepper,
  StepStatus,
  Text,
} from '@chakra-ui/react'
import { useMemo } from 'react'
import type { IconType } from 'react-icons'
import { FaCheck } from 'react-icons/fa6'

export type StepProps = {
  title: string
  icon: IconType
}

type StatusStepperProps = {
  steps: StepProps[]
  activeStep: number
  colorScheme?: string
}

const getProgressPercent = (activeStep: number): number => {
  // 6 states total, so each state is worth 16.67% (100/6)
  return Math.min((activeStep + 1) * (100 / 6), 100)
}

export const StatusStepper: React.FC<StatusStepperProps> = ({
  steps,
  activeStep,
  colorScheme = 'green',
}) => {
  const CheckIcon = useMemo(() => <FaCheck />, [])
  const LoadingIcon = useMemo(
    () => <CircularProgress trackColor='background.surface.raised.base' size={5} isIndeterminate />,
    [],
  )

  const progressPercent = getProgressPercent(activeStep)

  const renderSteps = useMemo(() => {
    return steps.map((step, index) => {
      return (
        <Step key={index}>
          <Center boxSize={5}>
            <StepStatus complete={CheckIcon} incomplete={step.icon} active={LoadingIcon} />
          </Center>
          <Text fontSize='sm'>{step.title}</Text>
        </Step>
      )
    })
  }, [CheckIcon, LoadingIcon, steps])

  return (
    <Flex
      bg='background.surface.raised.base'
      py={4}
      flexDir='column'
      gap={4}
      borderBottomWidth={1}
      borderColor='border.base'
    >
      <Stepper size='lg' index={activeStep} variant='vert' gap={0}>
        {renderSteps}
      </Stepper>
      <Flex px={4}>
        <Progress
          colorScheme={colorScheme}
          borderRadius='full'
          height='5px'
          width='full'
          value={progressPercent}
        />
      </Flex>
    </Flex>
  )
}
