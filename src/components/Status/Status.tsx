import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Circle,
  Divider,
  Flex,
  HStack,
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
import type { AssetId } from '@shapeshiftoss/caip'
import { useQueries } from '@tanstack/react-query'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { chainflipToAssetId, getChainflipAssetId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'
import { useChainflipStatusQuery } from 'queries/chainflip/status'
import type { ChainflipQuote, ChainflipSwapStatus } from 'queries/chainflip/types'
import { reactQueries } from 'queries/react-queries'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FaArrowDown, FaArrowRightArrowLeft, FaCheck, FaClock, FaRegCopy } from 'react-icons/fa6'
import { useSearchParams } from 'react-router'
import { useAssetById } from 'store/assets'
import { Amount } from 'components/Amount/Amount'
import { QRCode } from 'components/QRCode/QRCode'
import { useCopyToClipboard } from 'hooks/useCopyToClipboard'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit } from 'lib/bignumber/conversion'
import type { SwapFormData } from 'types/form'

import { CHAINFLIP_COMMISSION_BPS } from '../../lib/const'
import type { StepProps } from './components/StatusStepper'
import { StatusStepper } from './components/StatusStepper'

dayjs.extend(duration)
dayjs.extend(relativeTime)

const pendingSlideFadeSx = { position: 'absolute', top: 0, left: 0, right: 0 } as const

const copyIcon = <FaRegCopy />
const checkIcon = <FaCheck />

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
  sellAssetId,
  buyAssetId,
  sellAmountCryptoPrecision,
  buyAmountCryptoPrecision,
  handleCopyToAddress,
  isToAddressCopied,
  estimatedExpiryTime,
  isStatusLoading,
  isExpired,
}: {
  swapData: { address: string; channelId?: number }
  sellAssetId: AssetId
  buyAssetId: AssetId
  sellAmountCryptoPrecision: string
  buyAmountCryptoPrecision: string
  handleCopyToAddress: () => void
  isToAddressCopied: boolean
  estimatedExpiryTime?: string
  isStatusLoading: boolean
  isExpired?: boolean
}) => {
  const sellAsset = useAssetById(sellAssetId)
  const buyAsset = useAssetById(buyAssetId)
  const qrCodeIcon = useMemo(() => <Avatar size='xs' src={sellAsset?.icon} />, [sellAsset?.icon])

  const timeToExpiry = useMemo(() => {
    if (isStatusLoading) return 'N/A'
    if (!estimatedExpiryTime) return 'N/A'
    if (isExpired) return null
    return dayjs.duration(dayjs(estimatedExpiryTime).diff(dayjs())).humanize()
  }, [estimatedExpiryTime, isExpired, isStatusLoading])

  if (!(sellAsset && buyAsset)) return null

  return (
    <CardBody display='flex' flexDir='row-reverse' gap={6} px={4}>
      <Flex flexDir='column' gap={4}>
        {!isExpired && (
          <Box bg='white' p={4} borderRadius='xl'>
            <QRCode content={swapData.address || ''} width={150} icon={qrCodeIcon} />
          </Box>
        )}
        <Tag colorScheme={isExpired ? 'red' : 'yellow'} size='sm' justifyContent='center'>
          {isExpired ? 'Expired' : `Expires in: ${timeToExpiry}`}
        </Tag>
      </Flex>
      <Stack spacing={4} flex={1}>
        <Stack>
          <Text fontWeight='bold'>Send</Text>
          <Flex alignItems='center' gap={2}>
            <Avatar size='sm' src={sellAsset.icon} />
            <Amount.Crypto value={sellAmountCryptoPrecision} symbol={sellAsset.symbol} />
          </Flex>
        </Stack>
        {!isExpired && (
          <Stack>
            <Text fontWeight='bold'>To</Text>
            <InputGroup>
              <Input isReadOnly value={swapData.address || ''} />
              <InputRightElement>
                <IconButton
                  borderRadius='lg'
                  size='sm'
                  variant='ghost'
                  icon={isToAddressCopied ? checkIcon : copyIcon}
                  aria-label='Copy address'
                  onClick={handleCopyToAddress}
                />
              </InputRightElement>
            </InputGroup>
          </Stack>
        )}
        <Divider borderColor='border.base' />
        <Stack>
          <Text fontWeight='bold'>You will receive</Text>
          <Flex gap={2} alignItems='center'>
            <Avatar size='xs' src={buyAsset.icon} />
            <Amount.Crypto value={buyAmountCryptoPrecision || '0'} symbol={buyAsset.symbol} />
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
    status: ChainflipSwapStatus
  }
}) => {
  const getStatusConfig = (state?: string, swapEgress?: { transactionReference?: string }) => {
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
  const isCompleted = swapStatus?.status.state === 'completed'

  const handleLaunchApp = useCallback(() => {
    window.open('https://app.shapeshift.com', '_blank')
  }, [])

  return (
    <CardBody height='full' display='flex' alignItems='center' justifyContent='center'>
      <Flex direction='column' alignItems='center' py={8}>
        <Circle size='36px' bg={config.color} mb={3}>
          <StatusIcon size={18} color='black' />
        </Circle>
        <Text fontSize='lg' fontWeight='medium'>
          {config.message}
        </Text>
        {isCompleted && (
          <VStack spacing={4} mt={2}>
            <Text fontSize='md' color='gray.500'>
              Do more with the ShapeShift platform
            </Text>
            <Button colorScheme='blue' size='md' onClick={handleLaunchApp}>
              Launch Shapeshift App
            </Button>
          </VStack>
        )}
      </Flex>
    </CardBody>
  )
}

const calculateShapeshiftFee = (quote: ChainflipQuote | undefined) => {
  if (!quote) return '0'
  const ingressAmountUsd = bnOrZero(quote.ingressAmount).times(quote.estimatedPrice)
  return ingressAmountUsd.times(CHAINFLIP_COMMISSION_BPS).div(10000).toString()
}

export const Status = () => {
  const [searchParams] = useSearchParams()

  const swapId = searchParams.get('swapId')
  const { data: swapStatus, isLoading: isStatusLoading } = useChainflipStatusQuery({
    swapId: Number(swapId),
    enabled: Boolean(swapId),
  })

  const isCompleted = swapStatus?.status.state === 'completed'
  const shouldDisplayPendingSwapBody = useMemo(
    () => swapStatus?.status && swapStatus?.status.state !== 'waiting',
    [swapStatus?.status],
  )

  const { activeStep, setActiveStep } = useSteps({
    index: 0,
    count: SWAP_STEPS.length,
  })

  useEffect(() => {
    if (swapStatus?.status.state === 'completed') {
      return setActiveStep(2)
    }
    if (shouldDisplayPendingSwapBody) {
      return setActiveStep(1)
    }
  }, [shouldDisplayPendingSwapBody, setActiveStep, swapStatus?.status.state])

  const { control } = useFormContext<SwapFormData>()

  const sellAmountCryptoBaseUnit = useWatch({ control, name: 'sellAmountCryptoBaseUnit' })
  const destinationAddress = useWatch({ control, name: 'destinationAddress' })
  const sellAssetId = useWatch({ control, name: 'sellAssetId' })
  const buyAssetId = useWatch({ control, name: 'buyAssetId' })

  const sellAsset = useAssetById(sellAssetId)
  const buyAsset = useAssetById(buyAssetId)

  const quoteParams = useMemo(
    () => ({
      sourceAsset: sellAsset ? getChainflipAssetId(sellAsset.assetId) : undefined,
      destinationAsset: buyAsset ? getChainflipAssetId(buyAsset.assetId) : undefined,
      amount: sellAmountCryptoBaseUnit,
    }),
    [sellAsset, buyAsset, sellAmountCryptoBaseUnit],
  )

  const { data: quote } = useChainflipQuoteQuery(quoteParams)

  const swapData = useMemo(() => {
    const channelId = searchParams.get('channelId')
    const depositAddress = searchParams.get('depositAddress')
    return {
      channelId: channelId ? Number(channelId) : undefined,
      address: depositAddress || '',
    }
  }, [searchParams])

  const sellAmountCryptoPrecision = useMemo(() => {
    if (!sellAsset?.precision || !sellAmountCryptoBaseUnit) return '0'
    return fromBaseUnit(sellAmountCryptoBaseUnit, sellAsset.precision)
  }, [sellAsset?.precision, sellAmountCryptoBaseUnit])

  const buyAmountCryptoPrecision = useMemo(() => {
    if (!quote?.egressAmountNative || !buyAsset?.precision) return '0'
    return fromBaseUnit(quote.egressAmountNative, buyAsset.precision)
  }, [quote?.egressAmountNative, buyAsset?.precision])

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

  const cardHeaderStyle = useMemo(
    () => ({
      bg: 'background.surface.raised.base',
      display: 'flex',
      justifyContent: 'center',
      gap: 1,
      borderTopRadius: 'xl',
      fontSize: 'sm',
      py: 2,
    }),
    [],
  )

  // Collect feeAssetIds
  const feeAssetIds = useMemo(() => {
    if (!quote?.includedFees) return []
    return [
      ...new Set(
        quote.includedFees
          .filter(fee => fee.type !== 'broker')
          .map(fee => chainflipToAssetId[fee.asset])
          .filter(Boolean),
      ),
    ]
  }, [quote?.includedFees])

  // Ensure we have market-data for all fee assets so we can sum em up
  const feeMarketData = useQueries({
    queries: feeAssetIds.map(assetId => ({
      ...reactQueries.marketData.byAssetId(assetId),
    })),
  })

  // And finally, do sum em up
  const protocolFeesFiat = useMemo(() => {
    if (!quote?.includedFees) return '0'

    return quote.includedFees
      .filter(fee => fee.type !== 'broker')
      .reduce((total, fee) => {
        const assetId = chainflipToAssetId[fee.asset]
        if (!assetId) return total

        const marketData = feeMarketData[feeAssetIds.indexOf(assetId)]?.data
        if (marketData?.price) {
          return total.plus(bnOrZero(fee.amount).times(marketData.price))
        }
        return total
      }, bnOrZero(0))
      .toString()
  }, [quote?.includedFees, feeMarketData, feeAssetIds])

  if (!(sellAssetId && buyAssetId)) return null
  if (!(sellAsset && buyAsset)) return null

  return (
    <Card width='full' maxW='465px'>
      <CardHeader {...cardHeaderStyle}>
        <Text color='text.subtle'>Channel ID:</Text>
        <Text>{swapData.channelId?.toString() || 'Loading...'}</Text>
      </CardHeader>
      <Box position='relative' minH={isCompleted ? '250px' : '150px'}>
        <SlideFade in={!shouldDisplayPendingSwapBody} unmountOnExit>
          <IdleSwapCardBody
            sellAssetId={sellAssetId}
            buyAssetId={buyAssetId}
            swapData={swapData}
            sellAmountCryptoPrecision={sellAmountCryptoPrecision}
            buyAmountCryptoPrecision={buyAmountCryptoPrecision}
            handleCopyToAddress={handleCopyToAddress}
            isToAddressCopied={isToAddressCopied}
            estimatedExpiryTime={swapStatus?.status.depositChannel?.estimatedExpiryTime}
            isStatusLoading={isStatusLoading}
            isExpired={swapStatus?.status.depositChannel?.isExpired}
          />
        </SlideFade>
        <SlideFade in={shouldDisplayPendingSwapBody} unmountOnExit style={pendingSlideFadeSx}>
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
              <Avatar size='xs' src={sellAsset.icon} />
              <Text>Deposit</Text>
            </Flex>
            <Amount.Crypto
              value={sellAmountCryptoPrecision || '0'}
              symbol={sellAsset?.symbol || 'BTC'}
            />
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{swapData.address || ''}</Text>
            <IconButton
              size='sm'
              variant='ghost'
              icon={isDepositAddressCopied ? checkIcon : copyIcon}
              aria-label='Copy deposit address'
              onClick={handleCopyDepositAddress}
            />
          </Flex>
        </Stack>
        <Stack>
          <Flex width='full' justifyContent='space-between'>
            <Flex alignItems='center' gap={2}>
              <Avatar size='xs' src={buyAsset.icon} />
              <Text>Receive</Text>
            </Flex>
            <Amount.Crypto
              value={buyAmountCryptoPrecision || '0'}
              symbol={buyAsset?.symbol || 'ETH'}
            />
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{destinationAddress || 'No destination address'}</Text>
          </Flex>
        </Stack>
        <Divider borderColor='border.base' />
        <Stack spacing={2}>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>Estimated Time</Text>
            <Text>
              {quote?.estimatedDurationSeconds
                ? dayjs.duration(quote.estimatedDurationSeconds, 'seconds').humanize()
                : 'N/A'}
            </Text>
          </Flex>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>Estimated Rate</Text>
            <Flex gap={1}>
              <Amount.Crypto value='1' symbol={sellAsset.symbol} suffix='=' />
              <Amount.Crypto
                value={quote?.estimatedPrice.toString() || '0'}
                symbol={buyAsset.symbol}
              />
            </Flex>
          </Flex>
          <HStack justify='space-between'>
            <Text>ShapeShift Fee</Text>
            <Amount.Fiat value={calculateShapeshiftFee(quote)} />
          </HStack>
          <HStack justify='space-between'>
            <Text>Protocol Fee</Text>
            <Amount.Fiat value={protocolFeesFiat} />
          </HStack>
        </Stack>
      </CardFooter>
    </Card>
  )
}
