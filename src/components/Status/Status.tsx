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
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  SlideFade,
  Stack,
  Tag,
  Text,
  useSteps,
  VStack,
} from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { getChainflipAssetId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'
import { useChainflipStatusQuery } from 'queries/chainflip/status'
import type { ChainflipSwapStatus } from 'queries/chainflip/types'
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import {
  FaArrowDown,
  FaArrowRightArrowLeft,
  FaArrowUpRightFromSquare,
  FaCheck,
  FaClock,
  FaRegCopy,
  FaRotate,
} from 'react-icons/fa6'
import { useSearchParams } from 'react-router'
import { useAssetById } from 'store/assets'
import { Amount } from 'components/Amount/Amount'
import { QRCode } from 'components/QRCode/QRCode'
import { useCopyToClipboard } from 'hooks/useCopyToClipboard'
import { fromBaseUnit } from 'lib/bignumber/conversion'
import type { SwapFormData } from 'types/form'

import type { StepProps } from './components/StatusStepper'
import { StatusStepper } from './components/StatusStepper'

const MOCK_SHAPESHIFT_FEE = 4.0
const MOCK_PROTOCOL_FEE = '0.000'

const pendingSlideFadeSx = { position: 'absolute', top: 0, left: 0, right: 0 } as const
const linkHoverSx = { color: 'blue.600' }

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
}: {
  swapData: { address: string; channelId?: number }
  sellAssetId: AssetId
  buyAssetId: AssetId
  sellAmountCryptoPrecision: string
  buyAmountCryptoPrecision: string
  handleCopyToAddress: () => void
  isToAddressCopied: boolean
}) => {
  const sellAsset = useAssetById(sellAssetId)
  const buyAsset = useAssetById(buyAssetId)
  const qrCodeIcon = useMemo(() => <Avatar size='xs' src={sellAsset?.icon} />, [sellAsset?.icon])

  if (!(sellAsset && buyAsset)) return null

  return (
    <CardBody display='flex' flexDir='row-reverse' gap={6} px={4}>
      <Flex flexDir='column' gap={4}>
        <Box bg='white' p={4} borderRadius='xl'>
          <QRCode content={swapData.address || ''} width={150} icon={qrCodeIcon} />
        </Box>
        <Tag colorScheme='green' size='sm' justifyContent='center'>
          Time remaining 06:23
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
    const retryCount = swapStatus?.status.swap?.regular?.retryCount ?? 0
    const isRetrying = state === 'swapping' && retryCount > 0

    if (isRetrying) {
      return {
        icon: FaRotate,
        message: 'Retrying Swap...',
        color: 'green.200',
      }
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
  console.log({ config, swapStatus })
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
        <Flex gap={2} alignItems='center'>
          <Text fontSize='lg' fontWeight='medium'>
            {config.message}
          </Text>
          {swapStatus?.status.state !== 'waiting' && (
            <Link
              href={`https://scan.chainflip.io/swaps/${swapStatus?.status.swapId}`}
              isExternal
              color='blue.500'
              _hover={linkHoverSx}
            >
              <FaArrowUpRightFromSquare size={14} />
            </Link>
          )}
        </Flex>
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

export const Status = () => {
  const [searchParams] = useSearchParams()

  const swapId = searchParams.get('swapId')
  const { data: swapStatus } = useChainflipStatusQuery({
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
  const refundAddress = useWatch({ control, name: 'refundAddress' })
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
  const { copyToClipboard: copyReceiveAddress, isCopied: isReceiveAddressCopied } =
    useCopyToClipboard({ timeout: 3000 })
  const { copyToClipboard: copyRefundAddress, isCopied: isRefundAddressCopied } =
    useCopyToClipboard({
      timeout: 3000,
    })

  const handleCopyToAddress = useCallback(() => {
    if (destinationAddress) {
      copyToAddress(destinationAddress)
    }
  }, [copyToAddress, destinationAddress])

  const handleCopyReceiveAddress = useCallback(() => {
    if (destinationAddress) {
      copyReceiveAddress(destinationAddress)
    }
  }, [destinationAddress, copyReceiveAddress])

  const handleCopyRefundAddress = useCallback(() => {
    if (refundAddress) {
      copyRefundAddress(refundAddress)
    }
  }, [copyRefundAddress, refundAddress])

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

  if (!(sellAssetId && buyAssetId)) return null
  if (!(sellAsset && buyAsset)) return null

  return (
    <Card width='full' maxW='465px'>
      <CardHeader {...cardHeaderStyle}>
        <Text color='text.subtle'>Channel ID:</Text>
        <Flex gap={2} alignItems='center'>
          <Text>{swapData.channelId?.toString() || 'Loading...'}</Text>
          {swapData.channelId && (
            <Link
              href={`https://scan.chainflip.io/channels/${swapStatus?.status.depositChannel?.id}`}
              isExternal
              color='blue.500'
              _hover={linkHoverSx}
            >
              <FaArrowUpRightFromSquare size={12} />
            </Link>
          )}
        </Flex>
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
              <Text>Refund Address</Text>
            </Flex>
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{refundAddress || ''}</Text>
            <IconButton
              size='sm'
              variant='ghost'
              icon={isRefundAddressCopied ? checkIcon : copyIcon}
              aria-label='Copy refund address'
              onClick={handleCopyRefundAddress}
            />
          </Flex>
        </Stack>
        <Stack>
          <Flex width='full' justifyContent='space-between'>
            <Flex alignItems='center' gap={2}>
              <Avatar size='xs' src={buyAsset.icon} />
              <Text>Receive Address</Text>
            </Flex>
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{destinationAddress || ''}</Text>
            <IconButton
              size='sm'
              variant='ghost'
              icon={isReceiveAddressCopied ? checkIcon : copyIcon}
              aria-label='Copy receive address'
              onClick={handleCopyReceiveAddress}
            />
          </Flex>
        </Stack>
        <Divider borderColor='border.base' />
        <Stack spacing={2}>
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
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>ShapeShift Fee</Text>
            <Amount.Fiat value={MOCK_SHAPESHIFT_FEE.toString()} prefix='$' />
          </Flex>
          <Flex alignItems='center' justifyContent='space-between'>
            <Text>Protocol Fee</Text>
            <Amount.Crypto value={MOCK_PROTOCOL_FEE} symbol={sellAsset?.symbol || 'BTC'} />
          </Flex>
        </Stack>
      </CardFooter>
    </Card>
  )
}
