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
  Box,
} from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaArrowDown, FaArrowRightArrowLeft, FaCheck, FaRegCopy } from 'react-icons/fa6'
import { Amount } from 'components/Amount/Amount'
import { QRCode } from 'components/QRCode/QRCode'
import { useCopyToClipboard } from 'hooks/useCopyToClipboard'
import { fromBaseUnit } from 'lib/bignumber/conversion'
import { BTCImage, ETHImage } from 'lib/const'
import { useAssetById } from 'store/assets'
import type { SwapFormData } from 'types/form'
import { getChainflipAssetId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'

import type { StepProps } from './components/StatusStepper'
import { StatusStepper } from './components/StatusStepper'

// Mock values - will come from API later
const MOCK_CHANNEL_ID = '0xa5567...8c'
const MOCK_SHAPESHIFT_FEE = 4.00
const MOCK_PROTOCOL_FEE = '0.000'

const SWAP_STEPS: StepProps[] = [
  {
    title: 'Awaiting Deposit',
    icon: FaArrowDown,
  },
  {
    title: 'Awaiting Exchange',
    icon: FaArrowRightArrowLeft,
  }
]

export const Status = () => {
  const { activeStep } = useSteps({
    index: 0,
    count: SWAP_STEPS.length,
  })
  const { watch } = useFormContext<SwapFormData>()
  const { sellAmountCryptoBaseUnit, destinationAddress, refundAddress, sellAsset, buyAsset } = watch()

  const fromAsset = sellAsset ? useAssetById(sellAsset) : undefined
  const toAsset = buyAsset ? useAssetById(buyAsset) : undefined

  // Convert base units to crypto precision for display
  const sellAmountCryptoPrecision = useMemo(() => {
    if (!fromAsset?.precision || !sellAmountCryptoBaseUnit) return '0'
    return fromBaseUnit(sellAmountCryptoBaseUnit, fromAsset.precision)
  }, [fromAsset?.precision, sellAmountCryptoBaseUnit])

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
    copyToAddress(destinationAddress)
  }, [copyToAddress, destinationAddress])

  const handleCopyDepositAddress = useCallback(() => {
    copyDepositAddress(refundAddress)
  }, [copyDepositAddress, refundAddress])

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
        <Text>{MOCK_CHANNEL_ID}</Text>
      </CardHeader>
      <Collapse in={activeStep === 0}>
        <CardBody display='flex' flexDir='row-reverse' gap={6} px={4}>
          <Flex flexDir='column' gap={4}>
            <Box bg='white' p={4} borderRadius='xl'>
              <QRCode
                content={refundAddress || ''}
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
                <Input isReadOnly value={refundAddress} />
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
                <Amount.Crypto value={buyAmountCryptoPrecision || '0'} symbol={toAsset?.symbol || 'ETH'} />
              </Flex>
            </Stack>
          </Stack>
        </CardBody>
      </Collapse>
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
            <Amount.Crypto value={sellAmountCryptoPrecision || '0'} symbol={fromAsset?.symbol || 'BTC'} />
          </Flex>
          <Flex alignItems='center' gap={2}>
            <Text>{refundAddress}</Text>
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
            <Amount.Crypto value={buyAmountCryptoPrecision || '0'} symbol={toAsset?.symbol || 'ETH'} />
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
              <Amount.Crypto value={quote?.estimatedPrice.toString() || '0'} symbol={toAsset?.symbol || 'ETH'} />
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
