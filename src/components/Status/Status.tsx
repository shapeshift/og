import {
  Avatar,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Collapse,
  Divider,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Tag,
  Text,
  useSteps,
} from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { FaArrowDown, FaArrowRightArrowLeft, FaCheck, FaRegCopy } from 'react-icons/fa6'
import { useCopyToClipboard } from 'hooks/useCopyToClipboard'
import { BTCImage, ETHImage } from 'lib/const'

import type { StepProps } from './components/StatusStepper'
import { StatusStepper } from './components/StatusStepper'

const steps: StepProps[] = [
  {
    title: 'Awaiting Deposit',
    icon: FaArrowDown,
  },
  {
    title: 'Awaiting Exchange',
    icon: FaArrowRightArrowLeft,
  },
  {
    title: 'Trade Complete',
    icon: FaCheck,
  },
]

export const Status = () => {
  const { activeStep } = useSteps({
    index: 0,
    count: steps.length,
  })
  const CopyIcon = useMemo(() => <FaRegCopy />, [])
  const CheckIcon = useMemo(() => <FaCheck />, [])
  const { copyToClipboard: copyToAddress, isCopied: isToAddressCopied } = useCopyToClipboard({
    timeout: 3000,
  })
  const { copyToClipboard: copyDepositAddress, isCopied: isDepositAddressCopied } =
    useCopyToClipboard({ timeout: 3000 })

  const handleCopyToAddress = useCallback(() => {
    copyToAddress('1234')
  }, [copyToAddress])

  const handleCopyDepositAddress = useCallback(() => {
    copyDepositAddress('1234')
  }, [copyDepositAddress])

  return (
    <Card width='full' maxW='465px'>
      <CardHeader
        bg='background.surface.raised.base'
        display='flex'
        justifyContent='center'
        gap={1}
        borderTopRadius='xl'
        fontSize='sm'
        py={2}
      >
        <Text color='text.subtle'>TX ID</Text>
        <Text>0x124567</Text>
      </CardHeader>
      <Collapse in={activeStep === 0}>
        <CardBody display='flex' flexDir='row-reverse' gap={6} px={4}>
          <Flex flexDir='column' gap={4}>
            <Center boxSize='150px' bg='background.surface.raised.base' borderRadius='xl' />
            <Tag colorScheme='green' size='sm' justifyContent='center'>
              Time remaining 06:23
            </Tag>
          </Flex>
          <Stack spacing={4} flex={1}>
            <Stack>
              <Text fontWeight='bold'>Send</Text>
              <Flex alignItems='center' gap={2}>
                <Avatar size='sm' src={BTCImage} />
                <Text>0.002 BTC</Text>
              </Flex>
            </Stack>
            <Stack>
              <Text fontWeight='bold'>To</Text>
              <InputGroup>
                <Input isReadOnly value='bc1q8n6t65jpm6k0...x7gl' />
                <InputRightElement>
                  <IconButton
                    borderRadius='lg'
                    size='sm'
                    variant='ghost'
                    icon={isToAddressCopied ? CheckIcon : CopyIcon}
                    aria-label='Copy address'
                    onClick={handleCopyToAddress}
                  />
                </InputRightElement>
              </InputGroup>
            </Stack>
            <Divider borderColor='border.base' />
            <Stack>
              <Text fontWeight='bold'>You will receive</Text>
              <Flex gap={2} alignItems='center'>
                <Avatar size='xs' src={ETHImage} />
                <Text>0.000158162 ETH</Text>
              </Flex>
            </Stack>
          </Stack>
        </CardBody>
      </Collapse>
      <StatusStepper steps={steps} activeStep={activeStep} />
      <CardFooter
        flexDir='column'
        gap={4}
        px={4}
        bg='background.surface.raised.base'
        borderBottomRadius='xl'
      >
        <Text fontWeight='bold'>Order Details</Text>
        <Stack>
          <Flex width='full' justifyContent='space-between'>
            <Flex alignItems='center' gap={2}>
              <Avatar size='xs' src={BTCImage} />
              <Text>Deposit</Text>
            </Flex>
            <Text color='text.subtle'>0.002 BTC</Text>
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>bc1q8n6t65jpm6k048ejvwgfa69xp5laqr2sexx7gl</Text>
            <IconButton
              size='sm'
              variant='ghost'
              icon={isDepositAddressCopied ? CheckIcon : CopyIcon}
              aria-label='Copy deposit address'
              onClick={handleCopyDepositAddress}
            />
          </Flex>
        </Stack>
        <Stack>
          <Flex width='full' justifyContent='space-between'>
            <Flex alignItems='center' gap={2}>
              <Avatar size='xs' src={ETHImage} />
              <Text>Receive</Text>
            </Flex>
            <Text color='text.subtle'>0.00158162 ETH</Text>
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>0x1234484844949494949</Text>
          </Flex>
        </Stack>
        <Divider borderColor='border.base' />
        <Flex alignItems='center' justifyContent='space-between'>
          <Text>Estimated Rate</Text>
          <Text>1 BTC = 12.90126 ETH</Text>
        </Flex>
      </CardFooter>
    </Card>
  )
}
