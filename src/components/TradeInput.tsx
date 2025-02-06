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
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router'
import { useAssetById } from 'store/assets'
import { bnOrZero } from 'lib/bignumber/bignumber'
import { fromBaseUnit, toBaseUnit } from 'lib/bignumber/conversion'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import { validateAddress } from 'lib/validation'
import type { SwapFormData } from 'types/form'

import { Amount } from './Amount/Amount'

const divider = <StackDivider borderColor='border.base' />

export const TradeInput = () => {
  const navigate = useNavigate()
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isValid },
    control,
  } = useFormContext<SwapFormData>()
  const destinationAddress = useWatch({ control, name: 'destinationAddress' })
  const sellAmountCryptoBaseUnit = useWatch({ control, name: 'sellAmountCryptoBaseUnit' })
  const refundAddress = useWatch({ control, name: 'refundAddress' })
  const sellAssetId = useWatch({ control, name: 'sellAssetId' })
  const buyAssetId = useWatch({ control, name: 'buyAssetId' })

  const sellAsset = useAssetById(sellAssetId)
  const buyAsset = useAssetById(buyAssetId)

  const { data: sellAssetMarketData } = useMarketDataByAssetIdQuery(sellAsset?.assetId || '')
  const { data: buyAssetMarketData } = useMarketDataByAssetIdQuery(buyAsset?.assetId || '')

  const sellAmountCryptoPrecision = useMemo(() => {
    if (!sellAsset) return

    return fromBaseUnit(sellAmountCryptoBaseUnit, sellAsset.precision)
  }, [sellAsset, sellAmountCryptoBaseUnit])

  const {
    data: quote,
    isFetching: isQuoteFetching,
    error: quoteError,
  } = useChainflipQuoteQuery({
    sourceAsset: sellAsset ? getChainflipAssetId(sellAsset.assetId) : '',
    destinationAsset: buyAsset ? getChainflipAssetId(buyAsset.assetId) : '',
    amount: sellAmountCryptoBaseUnit,
  })

  const buyAmountCryptoPrecision = useMemo(() => {
    if (!(quote?.egressAmountNative && buyAsset)) return

    return fromBaseUnit(quote.egressAmountNative, buyAsset.precision)
  }, [quote?.egressAmountNative, buyAsset])

  const rate = useMemo(() => {
    if (quote && sellAmountCryptoPrecision)
      return bnOrZero(buyAmountCryptoPrecision).div(sellAmountCryptoPrecision).toString()

    // Fallback to market-data if no quote
    const sellAssetPrice = bnOrZero(sellAssetMarketData?.price)
    const buyAssetPrice = bnOrZero(buyAssetMarketData?.price)

    return sellAssetPrice.div(buyAssetPrice).toString()
  }, [
    buyAmountCryptoPrecision,
    quote,
    sellAmountCryptoPrecision,
    sellAssetMarketData?.price,
    buyAssetMarketData?.price,
  ])

  const SellAssetIcon = useMemo(() => <Avatar size='sm' src={sellAsset?.icon} />, [sellAsset?.icon])
  const BuyAssetIcon = useMemo(() => <Avatar size='sm' src={buyAsset?.icon} />, [buyAsset?.icon])
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

  const handleSubmit = useCallback(() => {
    if (!(quote && sellAsset && buyAsset)) return

    const createSwapPayload = {
      sourceAsset: getChainflipAssetId(sellAsset.assetId),
      destinationAsset: getChainflipAssetId(buyAsset.assetId),
      destinationAddress: destinationAddress || '',
      refundAddress: refundAddress || '',
      minimumPrice: quote.egressAmountNative,
    }

    mixpanel?.track(MixPanelEvent.StartTransaction, createSwapPayload)

    createSwap(createSwapPayload)
  }, [quote, sellAsset, buyAsset, destinationAddress, refundAddress, createSwap])

  const handleCardSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (isValid) handleSubmit()
    },
    [isValid, handleSubmit],
  )

  const handleSellAssetClick = useCallback(() => {
    console.info('asset click')
  }, [])

  const handleBuyAssetClick = useCallback(() => {
    console.info('to asset click')
  }, [])

  const handleSwitchAssets = useCallback(() => {
    const currentSellAsset = sellAsset
    const currentBuyAsset = buyAsset

    if (
      !(
        currentSellAsset &&
        currentBuyAsset &&
        sellAssetMarketData &&
        buyAssetMarketData &&
        sellAmountCryptoBaseUnit
      )
    )
      return

    // Get current fiat value using market rates only
    const currentSellAmountCryptoPrecision = fromBaseUnit(
      sellAmountCryptoBaseUnit,
      currentSellAsset.precision,
    )
    const sellAmountUsd = bnOrZero(currentSellAmountCryptoPrecision).times(
      sellAssetMarketData.price,
    )

    // Calculate new sell amount in crypto using market rates, avoiding division by zero
    const newSellAmountCryptoPrecision = bnOrZero(buyAssetMarketData.price).isZero()
      ? '0'
      : sellAmountUsd.div(buyAssetMarketData.price).toString()

    // Convert to base units with new precision
    const newSellAmountBaseUnit = toBaseUnit(
      newSellAmountCryptoPrecision,
      currentBuyAsset.precision,
    )

    setValue('sellAmountCryptoBaseUnit', newSellAmountBaseUnit)

    setValue('sellAssetId', currentBuyAsset.assetId)
    setValue('buyAssetId', currentSellAsset.assetId)
  }, [
    sellAsset,
    buyAsset,
    sellAssetMarketData,
    buyAssetMarketData,
    sellAmountCryptoBaseUnit,
    setValue,
  ])

  const handleSellAmountChange = useCallback(
    (values: { value: string }) => {
      if (!sellAsset?.precision) return
      setValue('sellAmountCryptoBaseUnit', toBaseUnit(values.value, sellAsset.precision))
    },
    [sellAsset?.precision, setValue],
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
      placeholder: `0.0 ${buyAsset?.symbol || 'ETH'}`,
      isReadOnly: true,
      value: buyAmountCryptoPrecision,
      bg: 'background.surface.raised.base',
      _hover: { bg: 'background.surface.raised.base' },
      _focus: { bg: 'background.surface.raised.base' },
    }),
    [buyAmountCryptoPrecision, buyAsset?.symbol],
  )

  useEffect(() => {
    const minAmountCryptoBaseUnit = quoteError?.response?.data.errors?.minimalAmountNative?.[0]
    if (quoteError?.response?.data.errors && minAmountCryptoBaseUnit && sellAsset?.precision) {
      const minAmountCryptoPrecision = fromBaseUnit(minAmountCryptoBaseUnit, sellAsset.precision)
      setError('sellAmountCryptoBaseUnit', {
        type: 'amountTooLow',
        message: `Minimum Amount: ${minAmountCryptoPrecision} ${sellAsset.symbol}`,
      })
    } else {
      clearErrors('sellAmountCryptoBaseUnit')
    }
  }, [quoteError, setError, clearErrors, sellAsset])

  if (!(sellAsset && buyAsset)) return null

  return (
    <Card width='full' maxWidth='450px' overflow='hidden' as='form' onSubmit={handleCardSubmit}>
      <CardHeader px={0} py={0} bg='background.surface.raised.base'>
        <Flex
          fontSize='sm'
          gap={1}
          justifyContent='center'
          py={2}
          bg='background.surface.raised.base'
        >
          <Text color='text.subtle'>Your rate</Text>
          <Skeleton isLoaded={!isQuoteFetching}>
            <Flex gap={1}>
              <Amount.Crypto value='1' symbol={sellAsset.symbol} suffix='=' />
              <Amount.Crypto value={rate} symbol={buyAsset.symbol} />
            </Flex>
          </Skeleton>
        </Flex>
        <HStack divider={divider} fontSize='sm'>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>Deposit This</StatLabel>
            <StatNumber>
              <Amount.Crypto value={sellAmountCryptoPrecision || '0'} symbol={sellAsset.symbol} />
            </StatNumber>
          </Stat>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>To Get This</StatLabel>
            <StatNumber>
              {isQuoteFetching ? (
                <Skeleton height='24px' width='100px' />
              ) : (
                <Amount.Crypto value={buyAmountCryptoPrecision ?? '0'} symbol={buyAsset.symbol} />
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
              icon={SellAssetIcon}
              aria-label='From Asset'
              onClick={handleSellAssetClick}
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
              icon={BuyAssetIcon}
              aria-label='To Asset'
              onClick={handleBuyAssetClick}
            />
          </Flex>
        </Flex>
        <Flex gap={6}>
          <Flex direction='column' flex={1}>
            <NumericFormat
              customInput={Input}
              variant='filled'
              placeholder={`Enter ${sellAsset.symbol} amount`}
              value={sellAmountCryptoPrecision}
              onValueChange={handleSellAmountChange}
              allowNegative={false}
              decimalScale={sellAsset.precision}
              isInvalid={!!errors.sellAmountCryptoBaseUnit}
            />
            {errors.sellAmountCryptoBaseUnit && (
              <Text fontSize='sm' color='red.500' mt={1}>
                {errors.sellAmountCryptoBaseUnit.message}
              </Text>
            )}
          </Flex>
          {!buyAmountCryptoPrecision ? (
            <Skeleton height='40px' width='full' flex={1}>
              <Input
                variant='filled'
                placeholder={`0.0 ${buyAsset.symbol}`}
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
            placeholder={`Enter ${buyAsset.symbol || ''} address`}
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
            placeholder={`Enter ${sellAsset.symbol || ''} address`}
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
          isDisabled={!quote}
          isLoading={isSwapPending}
          loadingText='Creating Swap'
        >
          Start Transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
