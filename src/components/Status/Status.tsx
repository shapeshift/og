import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Circle,
  Collapse,
  Divider,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  SlideFade,
  Stack,
  Tag,
  Text,
  useSteps,
  VStack,
} from '@chakra-ui/react'
import { getChainflipAssetId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'
import { useChainflipStatusQuery } from 'queries/chainflip/status'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaArrowDown, FaArrowRightArrowLeft, FaCheck, FaClock, FaRegCopy } from 'react-icons/fa6'
import { useSearchParams } from 'react-router'
import { useAssetById } from 'store/assets'
import { Amount } from 'components/Amount/Amount'
import { QRCode } from 'components/QRCode/QRCode'
import { useCopyToClipboard } from 'hooks/useCopyToClipboard'
import { fromBaseUnit } from 'lib/bignumber/conversion'
import { BTCImage, ETHImage } from 'lib/const'
import type { SwapFormData } from 'types/form'

import type { StepProps } from './components/StatusStepper'
import { StatusStepper } from './components/StatusStepper'

// Mock values - will come from API later
const MOCK_CHANNEL_ID = '0xa5567...8c'
const MOCK_SHAPESHIFT_FEE = 4.0
const MOCK_PROTOCOL_FEE = '0.000'

const SWAP_STEPS: StepProps[] = [
  {
    title: 'Awaiting Deposit',
    icon: FaArrowDown,
  },
  {
    title: 'Awaiting Exchange',
    icon: FaArrowRightArrowLeft,
  },
]

const IdleSwapCardBody = ({
  swapData,
  fromAsset,
  toAsset,
  sellAmountCryptoPrecision,
  buyAmountCryptoPrecision,
  handleCopyToAddress,
  isToAddressCopied,
}: {
  swapData: { address: string; channelId?: number }
  fromAsset: any
  toAsset: any
  sellAmountCryptoPrecision: string
  buyAmountCryptoPrecision: string
  handleCopyToAddress: () => void
  isToAddressCopied: boolean
}) => {
  const CopyIcon = useMemo(() => <FaRegCopy />, [])
  const CheckIcon = useMemo(() => <FaCheck />, [])

  return (
    <CardBody display='flex' flexDir='row-reverse' gap={6} px={4}>
      <Flex flexDir='column' gap={4}>
        <Box bg='white' p={4} borderRadius='xl'>
          <QRCode
            content={swapData.address || ''}
            width={150}
            icon={<Avatar size='xs' src={fromAsset?.icon} />}
          />
        </Box>
        <Tag colorScheme='green' size='sm' justifyContent='center'>
          Time remaining 06:23
        </Tag>
      </Flex>
      <Stack spacing={4} flex={1}>
        <Stack>
          <Text fontWeight='bold'>Send</Text>
          <Flex alignItems='center' gap={2}>
            <Avatar size='sm' src={fromAsset?.icon || BTCImage} />
            <Amount.Crypto value={sellAmountCryptoPrecision} symbol={fromAsset?.symbol || 'BTC'} />
          </Flex>
        </Stack>
        <Stack>
          <Text fontWeight='bold'>To</Text>
          <InputGroup>
            <Input isReadOnly value={swapData.address || ''} />
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
            <Avatar size='xs' src={toAsset?.icon || ETHImage} />
            <Amount.Crypto
              value={buyAmountCryptoPrecision || '0'}
              symbol={toAsset?.symbol || 'ETH'}
            />
          </Flex>
        </Stack>
      </Stack>
    </CardBody>
  )
}

const PendingSwapCardBody = ({
  swapStatus,
}: {
  swapStatus?: {
    status: {
      state: 'waiting' | 'receiving' | 'swapping' | 'sending' | 'sent' | 'completed' | 'failed'
      swapEgress?: {
        transactionReference?: string
      }
    }
  }
}) => {
  const getStatusConfig = (state?: string, swapEgress?: { transactionReference?: string }) => {
    // TODO(gomes): revert
    return {
      icon: FaCheck,
      message: 'Swap Complete',
      color: 'green.200',
    }

    switch (state) {
      case 'waiting':
        return {
          icon: FaClock,
          message: 'Waiting for deposit...',
          color: 'green.200',
        }
      case 'receiving':
        return {
          icon: FaArrowDown,
          message: 'Deposit detected, waiting for confirmation...',
          color: 'green.200',
        }
      case 'swapping':
        return {
          icon: FaArrowRightArrowLeft,
          message: 'Processing swap...',
          color: 'green.200',
        }
      case 'sending':
        return {
          icon: FaArrowDown,
          message: swapEgress?.transactionReference
            ? 'Outbound transaction initiated...'
            : 'Preparing outbound transaction...',
          color: 'green.200',
        }
      case 'sent':
        return {
          icon: FaArrowDown,
          message: 'Transaction sent, waiting for confirmation...',
          color: 'green.200',
        }
      case 'completed':
        return {
          icon: FaCheck,
          message: 'Swap Complete',
          color: 'green.200',
        }
      case 'failed':
        return {
          icon: FaCheck,
          message: 'Swap failed',
          color: 'red.500',
        }
      default:
        return {
          icon: FaClock,
          message: 'Unknown status',
          color: 'green.200',
        }
    }
  }

  const config = getStatusConfig(swapStatus?.status.state, swapStatus?.status.swapEgress)
  const StatusIcon = config.icon
  const isCompleted = true // TODO(gomes): revert

  return (
    <CardBody height='full' display='flex' alignItems='center' justifyContent='center'>
      <Flex direction='column' alignItems='center' py={8}>
        <Circle size='36px' bg={config.color} mb={3}>
          <StatusIcon size={18} color='black' />
        </Circle>
        <Text fontSize='lg' fontWeight='medium' mb={isCompleted ? 3 : 0}>
          {config.message}
        </Text>
        {isCompleted && (
          <VStack spacing={4} mt={2}>
            <Text fontSize='md' color='gray.500'>
              Do more with the ShapeShift platform
            </Text>
            <Button colorScheme='blue' size='md'>
              Launch Shapeshift App
            </Button>
          </VStack>
        )}
      </Flex>
    </CardBody>
  )
}

export const Status = () => {
  const [searchParams] = useSearchParams()
  // TODO: This is temporary for testing only. Replace with actual waiting state heuristics
  const [shouldDisplayPendingSwapBody, setShouldDisplayPendingSwapBody] = useState(false)

  const swapId = searchParams.get('swapId')
  const { data: swapStatus } = useChainflipStatusQuery({
    swapId: Number(swapId),
    enabled: Boolean(swapId),
  })

  // const isCompleted = swapStatus?.status.state === 'completed'
  const isCompleted = true // TODO(gomes): revert

  useEffect(() => {
    // TODO(gomes): temp, use actual 'waiting' state discrimination to make this proper work
    const timer = setTimeout(() => {
      setShouldDisplayPendingSwapBody(true)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const { activeStep } = useSteps({
    index: 0,
    count: SWAP_STEPS.length,
  })
  const { watch } = useFormContext<SwapFormData>()
  const { sellAmountCryptoBaseUnit, destinationAddress, refundAddress, sellAsset, buyAsset } =
    watch()

  const fromAsset = sellAsset ? useAssetById(sellAsset) : undefined
  const toAsset = buyAsset ? useAssetById(buyAsset) : undefined

  // Get quote for buy amount
  const { data: quote } = useChainflipQuoteQuery(
    {
      sourceAsset: fromAsset ? getChainflipAssetId(fromAsset.assetId) : '',
      destinationAsset: toAsset ? getChainflipAssetId(toAsset.assetId) : '',
      amount: sellAmountCryptoBaseUnit,
    },
    {
      enabled: Boolean(fromAsset && toAsset && sellAmountCryptoBaseUnit),
    },
  )

  // Get swap data from URL params
  const swapData = useMemo(() => {
    const channelId = searchParams.get('channelId')
    const depositAddress = searchParams.get('depositAddress')
    return {
      channelId: channelId ? Number(channelId) : undefined,
      address: depositAddress || '',
    }
  }, [searchParams])

  // Convert base units to crypto precision for display
  const sellAmountCryptoPrecision = useMemo(() => {
    if (!fromAsset?.precision || !sellAmountCryptoBaseUnit) return '0'
    return fromBaseUnit(sellAmountCryptoBaseUnit, fromAsset.precision)
  }, [fromAsset?.precision, sellAmountCryptoBaseUnit])

  // Calculate buy amount from quote
  const buyAmountCryptoPrecision = useMemo(() => {
    if (!quote?.egressAmountNative || !toAsset?.precision) return '0'
    return fromBaseUnit(quote.egressAmountNative, toAsset.precision)
  }, [quote?.egressAmountNative, toAsset?.precision])

  const CopyIcon = useMemo(() => <FaRegCopy />, [])
  const CheckIcon = useMemo(() => <FaCheck />, [])
  const { copyToClipboard: copyToAddress, isCopied: isToAddressCopied } = useCopyToClipboard({
    timeout: 3000,
  })
  const { copyToClipboard: copyDepositAddress, isCopied: isDepositAddressCopied } =
    useCopyToClipboard({ timeout: 3000 })

  const handleCopyToAddress = useCallback(() => {
    if (swapData.address) {
      copyToAddress(swapData.address)
    }
  }, [copyToAddress, swapData.address])

  const handleCopyDepositAddress = useCallback(() => {
    if (swapData.address) {
      copyDepositAddress(swapData.address)
    }
  }, [copyDepositAddress, swapData.address])

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
        <Text color='text.subtle'>Channel ID:</Text>
        <Text>{swapData.channelId?.toString() || 'Loading...'}</Text>
      </CardHeader>
      <Box position='relative' minH={isCompleted ? '250px' : '150px'}>
        <SlideFade in={!shouldDisplayPendingSwapBody} unmountOnExit>
          <IdleSwapCardBody
            swapData={swapData}
            fromAsset={fromAsset}
            toAsset={toAsset}
            sellAmountCryptoPrecision={sellAmountCryptoPrecision}
            buyAmountCryptoPrecision={buyAmountCryptoPrecision}
            handleCopyToAddress={handleCopyToAddress}
            isToAddressCopied={isToAddressCopied}
          />
        </SlideFade>
        <SlideFade
          in={shouldDisplayPendingSwapBody}
          unmountOnExit
          style={{ position: 'absolute', top: 0, left: 0, right: 0 }}
        >
          <PendingSwapCardBody swapStatus={swapStatus} />
        </SlideFade>
      </Box>
      <StatusStepper steps={SWAP_STEPS} activeStep={activeStep} />
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
              <Avatar size='xs' src={fromAsset?.icon || BTCImage} />
              <Text>Deposit</Text>
            </Flex>
            <Amount.Crypto
              value={sellAmountCryptoPrecision || '0'}
              symbol={fromAsset?.symbol || 'BTC'}
            />
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{swapData.address || ''}</Text>
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
              <Avatar size='xs' src={toAsset?.icon || ETHImage} />
              <Text>Receive</Text>
            </Flex>
            <Amount.Crypto
              value={buyAmountCryptoPrecision || '0'}
              symbol={toAsset?.symbol || 'ETH'}
            />
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{destinationAddress || 'No destination address'}</Text>
          </Flex>
        </Stack>
        <Divider borderColor='border.base' />
        <Stack spacing={2}>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>Estimated Rate</Text>
            <Flex gap={1}>
              <Amount.Crypto value='1' symbol={fromAsset?.symbol || 'BTC'} suffix='=' />
              <Amount.Crypto
                value={quote?.estimatedPrice.toString() || '0'}
                symbol={toAsset?.symbol || 'ETH'}
              />
            </Flex>
          </Flex>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>ShapeShift Fee</Text>
            <Amount.Fiat value={MOCK_SHAPESHIFT_FEE.toString()} prefix='$' />
          </Flex>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>Protocol Fee</Text>
            <Amount.Crypto value={MOCK_PROTOCOL_FEE} symbol={fromAsset?.symbol || 'BTC'} />
          </Flex>
        </Stack>
      </CardFooter>
    </Card>
  )
}
