import {
  Avatar,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  HStack,
  IconButton,
  Input,
  Skeleton,
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import { fromAssetId } from '@shapeshiftoss/caip'
import { getChainflipAssetId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'
import { useChainflipSwapMutation } from 'queries/chainflip/swap'
import { useMarketDataByAssetIdQuery } from 'queries/marketData'
import { useCallback, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router'
import { useAssetById } from 'store/assets'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit, toBaseUnit } from 'lib/bignumber/conversion'
import { BTCImage, ETHImage } from 'lib/const'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import { validateAddress } from 'lib/validation'
import type { SwapFormData } from 'types/form'

import { Amount } from './Amount/Amount'

export const TradeInput = () => {
  const navigate = useNavigate()
  const {
    register,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useFormContext<SwapFormData>()
  const { sellAmountCryptoBaseUnit, destinationAddress, refundAddress, sellAssetId, buyAssetId } =
    watch()

  // Always call hooks unconditionally at the top level
  const fromAssetData = useAssetById(sellAssetId || '')
  const toAssetData = useAssetById(buyAssetId || '')
  const fromAsset = useMemo(
    () => (sellAssetId ? fromAssetData : undefined),
    [sellAssetId, fromAssetData],
  )
  const toAsset = useMemo(() => (buyAssetId ? toAssetData : undefined), [buyAssetId, toAssetData])

  // Market data queries for fallback rates
  const { data: fromMarketData } = useMarketDataByAssetIdQuery(fromAsset?.assetId || '')
  const { data: toMarketData } = useMarketDataByAssetIdQuery(toAsset?.assetId || '')

  // Convert display amount to crypto precision for UI
  const sellAmountCryptoPrecision = useMemo(() => {
    if (!fromAsset?.precision || !sellAmountCryptoBaseUnit) return ''
    return fromBaseUnit(sellAmountCryptoBaseUnit, fromAsset.precision)
  }, [fromAsset?.precision, sellAmountCryptoBaseUnit])

  // Quote query (already using base units)
  const { data: quote, isFetching: isQuoteFetching } = useChainflipQuoteQuery(
    {
      sourceAsset: fromAsset ? getChainflipAssetId(fromAsset.assetId) : '',
      destinationAsset: toAsset ? getChainflipAssetId(toAsset.assetId) : '',
      amount: sellAmountCryptoBaseUnit,
    },
    {
      enabled: Boolean(fromAsset && toAsset && sellAmountCryptoBaseUnit),
    },
  )

  // Calculate buy amount from quote only
  const buyAmountCryptoPrecision = useMemo(() => {
    if (quote?.egressAmountNative && toAsset?.precision) {
      return fromBaseUnit(quote.egressAmountNative, toAsset.precision)
    }
    return undefined
  }, [quote?.egressAmountNative, toAsset?.precision])

  // Calculate rate using either quote or market data
  const rate = useMemo(() => {
    const sellBn = bnOrZero(sellAmountCryptoPrecision)
    if (sellBn.isZero()) return '0'

    if (quote) {
      return bnOrZero(buyAmountCryptoPrecision).div(sellBn).toString()
    }

    if (fromMarketData?.price && toMarketData?.price) {
      const fromPrice = bnOrZero(fromMarketData.price)
      const toPrice = bnOrZero(toMarketData.price)
      if (toPrice.isZero()) return '0'

      return fromPrice.div(toPrice).toString()
    }

    return '0'
  }, [
    buyAmountCryptoPrecision,
    quote,
    sellAmountCryptoPrecision,
    fromMarketData?.price,
    toMarketData?.price,
  ])

  const isLoading = isQuoteFetching

  const Divider = useMemo(() => <StackDivider borderColor='border.base' />, [])
  const FromAssetIcon = useMemo(
    () => <Avatar size='sm' src={fromAsset?.icon || BTCImage} />,
    [fromAsset?.icon],
  )
  const ToAssetIcon = useMemo(
    () => <Avatar size='sm' src={toAsset?.icon || ETHImage} />,
    [toAsset?.icon],
  )
  const SwitchIcon = useMemo(() => <FaArrowRightArrowLeft />, [])

  const { mutate: createSwap, isPending: isSwapPending } = useChainflipSwapMutation({
    onSuccess: swapData => {
      const formValues = watch()
      const searchParams = new URLSearchParams()
      Object.entries(formValues).forEach(([key, value]) => {
        if (value) {
          searchParams.set(key, String(value))
        }
      })

      searchParams.set('swapId', swapData.id.toString())
      searchParams.set('channelId', swapData.channelId.toString())
      searchParams.set('depositAddress', swapData.address)

      navigate({
        pathname: '/status',
        search: searchParams.toString(),
      })
    },
  })

  const onSubmit = useCallback(() => {
    if (!(quote && fromAsset && toAsset)) return

    const createSwapPayload = {
      sourceAsset: getChainflipAssetId(fromAsset.assetId),
      destinationAsset: getChainflipAssetId(toAsset.assetId),
      destinationAddress: destinationAddress || '',
      refundAddress: refundAddress || '',
      minimumPrice: quote.egressAmountNative,
    }

    mixpanel?.track(MixPanelEvent.StartTransaction, createSwapPayload)

    createSwap(createSwapPayload)
  }, [quote, fromAsset, toAsset, destinationAddress, refundAddress, createSwap])

  const handleFromAssetClick = useCallback(() => {
    console.info('asset click')
  }, [])

  const handleToAssetClick = useCallback(() => {
    console.info('to asset click')
  }, [])

  const handleSwitchAssets = useCallback(() => {
    const currentSellAsset = sellAssetId
    const currentBuyAsset = buyAssetId
    const currentFromAsset = fromAsset
    const currentToAsset = toAsset

    // Only prorate if we have market data and precision data
    if (
      currentFromAsset?.precision &&
      currentToAsset?.precision &&
      fromMarketData?.price &&
      toMarketData?.price &&
      sellAmountCryptoBaseUnit
    ) {
      // Get current fiat value using market rates only
      const currentSellAmountCryptoPrecision = fromBaseUnit(
        sellAmountCryptoBaseUnit,
        currentFromAsset.precision,
      )
      const sellAmountUsd = bnOrZero(currentSellAmountCryptoPrecision).times(fromMarketData.price)

      // Calculate new sell amount in crypto using market rates, avoiding division by zero
      const newSellAmountCryptoPrecision = bnOrZero(toMarketData.price).isZero()
        ? '0'
        : sellAmountUsd.div(toMarketData.price).toString()

      // Convert to base units with new precision
      const newSellAmountBaseUnit = toBaseUnit(
        newSellAmountCryptoPrecision,
        currentToAsset.precision,
      )

      setValue('sellAmountCryptoBaseUnit', newSellAmountBaseUnit)
    } else {
      // If we can't prorate (no market data), just clear the amount
      setValue('sellAmountCryptoBaseUnit', '')
    }

    setValue('sellAssetId', currentBuyAsset)
    setValue('buyAssetId', currentSellAsset)
  }, [
    sellAssetId,
    buyAssetId,
    fromAsset,
    toAsset,
    fromMarketData?.price,
    toMarketData?.price,
    sellAmountCryptoBaseUnit,
    setValue,
  ])

  // Handle input change to convert to base units
  const handleSellAmountChange = useCallback(
    (values: { value: string }) => {
      if (!fromAsset?.precision) return
      setValue('sellAmountCryptoBaseUnit', toBaseUnit(values.value, fromAsset.precision))
    },
    [fromAsset?.precision, setValue],
  )

  // Validation functions at top level
  const validateDestinationAddress = useCallback(
    async (value: string) => {
      if (!value || !buyAssetId) return true
      const { chainId } = fromAssetId(buyAssetId)
      // If the value hasn't changed and was previously valid, return true immediately
      if (destinationAddress === value && !errors.destinationAddress) {
        return true
      }
      const isValid = await validateAddress(value, chainId)
      return isValid || 'Invalid address format'
    },
    [buyAssetId, destinationAddress, errors.destinationAddress],
  )

  const validateRefundAddress = useCallback(
    async (value: string) => {
      if (!value || !sellAssetId) return true
      const { chainId } = fromAssetId(sellAssetId)
      // If the value hasn't changed and was previously valid, return true immediately
      if (refundAddress === value && !errors.refundAddress) {
        return true
      }
      const isValid = await validateAddress(value, chainId)
      return isValid || 'Invalid address format'
    },
    [sellAssetId, refundAddress, errors.refundAddress],
  )

  // Validation rules using the memoized validation functions
  const destinationAddressRules = useMemo(
    () => ({
      required: true,
      validate: validateDestinationAddress,
    }),
    [validateDestinationAddress],
  )

  const refundAddressRules = useMemo(
    () => ({
      required: true,
      validate: validateRefundAddress,
    }),
    [validateRefundAddress],
  )

  // Memoize style objects
  const skeletonInputStyles = useMemo(
    () => ({
      bg: 'background.surface.raised.base',
      _hover: { bg: 'background.surface.raised.base' },
      _focus: { bg: 'background.surface.raised.base' },
    }),
    [],
  )

  const readOnlyInputStyles = useMemo(
    () => ({
      flex: 1,
      variant: 'filled',
      placeholder: `0.0 ${toAsset?.symbol || 'ETH'}`,
      isReadOnly: true,
      value: buyAmountCryptoPrecision,
      bg: 'background.surface.raised.base',
      _hover: { bg: 'background.surface.raised.base' },
      _focus: { bg: 'background.surface.raised.base' },
    }),
    [buyAmountCryptoPrecision, toAsset?.symbol],
  )

  return (
    <Card
      width='full'
      maxWidth='450px'
      overflow='hidden'
      as='form'
      onSubmit={useCallback(
        (e: React.FormEvent) => {
          e.preventDefault()
          if (isValid) onSubmit()
        },
        [isValid, onSubmit],
      )}
    >
      <CardHeader px={0} py={0} bg='background.surface.raised.base'>
        <Flex
          fontSize='sm'
          gap={1}
          justifyContent='center'
          py={2}
          bg='background.surface.raised.base'
        >
          <Text color='text.subtle'>Your rate</Text>
          <Skeleton isLoaded={!isLoading}>
            <Flex gap={1}>
              <Amount.Crypto value='1' symbol={fromAsset?.symbol || 'BTC'} suffix='=' />
              <Amount.Crypto value={rate} symbol={toAsset?.symbol || 'ETH'} />
            </Flex>
          </Skeleton>
        </Flex>
        <HStack divider={Divider} fontSize='sm'>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>Deposit This</StatLabel>
            <StatNumber>
              <Amount.Crypto
                value={sellAmountCryptoPrecision || '0'}
                symbol={fromAsset?.symbol || 'BTC'}
              />
            </StatNumber>
          </Stat>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>To Get This</StatLabel>
            <StatNumber>
              {!buyAmountCryptoPrecision ? (
                <Skeleton height='24px' width='100px' />
              ) : (
                <Amount.Crypto value={buyAmountCryptoPrecision} symbol={toAsset?.symbol || 'ETH'} />
              )}
            </StatNumber>
          </Stat>
        </HStack>
      </CardHeader>
      <CardBody display='flex' flexDir='column' gap={6}>
        <Flex width='full' alignItems='center' justifyContent='space-between'>
          <Flex flex={1} justifyContent='center'>
            <IconButton
              size='lg'
              variant='ghost'
              icon={FromAssetIcon}
              aria-label='From Asset'
              onClick={handleFromAssetClick}
            />
          </Flex>
          <IconButton
            variant='ghost'
            icon={SwitchIcon}
            aria-label='Switch Assets'
            onClick={handleSwitchAssets}
          />
          <Flex flex={1} justifyContent='center'>
            <IconButton
              size='lg'
              variant='ghost'
              icon={ToAssetIcon}
              aria-label='To Asset'
              onClick={handleToAssetClick}
            />
          </Flex>
        </Flex>
        <Flex gap={6}>
          <NumericFormat
            customInput={Input}
            flex={1}
            variant='filled'
            placeholder={`Enter ${fromAsset?.symbol || 'BTC'} amount`}
            value={sellAmountCryptoPrecision || ''}
            onValueChange={handleSellAmountChange}
            allowNegative={false}
            decimalScale={fromAsset?.precision}
            thousandSeparator=','
            allowLeadingZeros={false}
            isAllowed={useCallback(
              ({ value }: { value: string }) => {
                if (!value) return true
                if (!fromAsset?.precision) return true
                const [, decimals] = value.split('.')
                return !decimals || decimals.length <= fromAsset.precision
              },
              [fromAsset?.precision],
            )}
          />
          {!buyAmountCryptoPrecision ? (
            <Skeleton height='40px' width='full' flex={1}>
              <Input
                variant='filled'
                placeholder={`0.0 ${toAsset?.symbol || 'ETH'}`}
                isReadOnly
                value=''
                {...skeletonInputStyles}
              />
            </Skeleton>
          ) : (
            <Input {...readOnlyInputStyles} />
          )}
        </Flex>
        <Flex direction='column' gap={2}>
          <Text fontSize='sm' color='text.subtle'>
            Destination Address
          </Text>
          <Input
            {...register('destinationAddress', destinationAddressRules)}
            placeholder={`Enter ${toAsset?.symbol || ''} address`}
            isInvalid={!!errors.destinationAddress}
            required
            title='Please enter a valid destination address'
          />
          {errors.destinationAddress && (
            <Text fontSize='sm' color='red.500'>
              {errors.destinationAddress.message}
            </Text>
          )}
        </Flex>
        <Flex direction='column' gap={2}>
          <Text fontSize='sm' color='text.subtle'>
            Refund Address
          </Text>
          <Input
            {...register('refundAddress', refundAddressRules)}
            placeholder={`Enter ${fromAsset?.symbol || ''} address`}
            isInvalid={!!errors.refundAddress}
            required
            title='Please enter a valid refund address'
          />
          {errors.refundAddress && (
            <Text fontSize='sm' color='red.500'>
              {errors.refundAddress.message}
            </Text>
          )}
        </Flex>
      </CardBody>
      <CardFooter>
        <Button
          type='submit'
          colorScheme='blue'
          size='lg'
          width='full'
          isDisabled={
            !sellAmountCryptoBaseUnit || !destinationAddress || !refundAddress || !isValid
          }
          isLoading={isSwapPending}
          loadingText='Creating Swap'
        >
          Start Transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
