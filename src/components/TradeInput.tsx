import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Flex,
  HStack,
  IconButton,
  Input,
  Link,
  Skeleton,
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { getChainflipId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'
import { useChainflipSwapMutation } from 'queries/chainflip/swap'
import { useMarketDataByAssetIdQuery } from 'queries/marketData'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { NumericFormat } from 'react-number-format'
import { useNavigate } from 'react-router'
import { useAssetById } from 'store/assets'
import { useDebounce } from 'hooks/useDebounce'
import { bn, bnOrZero, fromBaseUnit, toBaseUnit } from 'lib/bignumber/bignumber'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import { isValidAddress } from 'lib/validation'
import type { Asset } from 'types/Asset'
import type { SwapFormData } from 'types/form'

import { Amount } from './Amount/Amount'
import { AssetIcon } from './AssetIcon'
import { AssetSelectModal } from './AssetSelectModal/AssetSelectModal'
import { AssetType } from './AssetSelectModal/types'
import { CountdownSpinner } from './CountdownSpinner/CountdownSpinner'

const QUOTE_REFETCH_INTERVAL = 15_000

const divider = <StackDivider borderColor='border.base' />

const skeletonInputSx = {
  bg: 'background.surface.raised.base',
  _hover: { bg: 'background.surface.raised.base' },
  _focus: { bg: 'background.surface.raised.base' },
}

export const TradeInput = () => {
  const navigate = useNavigate()
  const {
    register,
    watch,
    setValue,
    setError,
    clearErrors,
    trigger,
    formState: { errors, isValid },
    control,
  } = useFormContext<SwapFormData>()
  const destinationAddress = useWatch({ control, name: 'destinationAddress' })
  const sellAmountCryptoBaseUnit = useWatch({ control, name: 'sellAmountCryptoBaseUnit' })
  const refundAddress = useWatch({ control, name: 'refundAddress' })
  const sellAssetId = useWatch({ control, name: 'sellAssetId' })
  const buyAssetId = useWatch({ control, name: 'buyAssetId' })

  const [isFiat, toggleIsFiat] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)
  const [assetSelectType, setAssetSelectType] = useState<AssetType>(AssetType.BUY)
  const [sellAmountInput, setSellAmountInput] = useState('')
  const [sellAmountFiatInput, setSellAmountFiatInput] = useState('')
  const debouncedSellAmount = useDebounce(sellAmountInput, 500)
  const debouncedSellAmountFiat = useDebounce(sellAmountFiatInput, 500)

  useEffect(() => {
    trigger(['destinationAddress', 'refundAddress'])
  }, [trigger, destinationAddress, refundAddress, sellAssetId, buyAssetId])

  const sellAsset = useAssetById(sellAssetId)
  const buyAsset = useAssetById(buyAssetId)

  const sellAmountCryptoPrecision = useMemo(() => {
    if (!sellAsset) return

    return fromBaseUnit(sellAmountCryptoBaseUnit, sellAsset.precision)
  }, [sellAsset, sellAmountCryptoBaseUnit])

  const { data: sellAssetMarketData } = useMarketDataByAssetIdQuery(sellAssetId || '')
  const { data: buyAssetMarketData } = useMarketDataByAssetIdQuery(buyAssetId || '')

  // virtual as in, derived from the fiat amount in fiat mode, or the input as-is if crypto mode
  const virtualDebouncedSellAmountCryptoBaseUnit = useMemo(() => {
    // In fiat mode, use the debounced fiat amount
    if (isFiat && sellAssetMarketData?.price && sellAsset?.precision) {
      const debouncedFiatValue = debouncedSellAmountFiat || '0'
      const cryptoValue = bnOrZero(debouncedFiatValue).div(sellAssetMarketData.price).toFixed()
      return toBaseUnit(cryptoValue, sellAsset.precision)
    }

    // In crypto mode, use the debounced crypto amount
    if (!isFiat && sellAsset?.precision) {
      const debouncedCryptoValue = debouncedSellAmount || '0'
      return toBaseUnit(debouncedCryptoValue, sellAsset.precision)
    }

    return sellAmountCryptoBaseUnit
  }, [
    isFiat,
    sellAmountCryptoBaseUnit,
    sellAssetMarketData?.price,
    sellAsset?.precision,
    debouncedSellAmountFiat,
    debouncedSellAmount,
  ])

  const {
    data: quote,
    isFetching: isQuoteFetching,
    error: quoteError,
  } = useChainflipQuoteQuery(
    {
      sourceAsset: sellAsset ? getChainflipId(sellAsset.assetId) : '',
      destinationAsset: buyAsset ? getChainflipId(buyAsset.assetId) : '',
      amount: virtualDebouncedSellAmountCryptoBaseUnit,
    },
    {
      refetchInterval: QUOTE_REFETCH_INTERVAL,
      enabled:
        !isSwitching &&
        !!sellAsset &&
        !!buyAsset &&
        bnOrZero(virtualDebouncedSellAmountCryptoBaseUnit).gt(0),
    },
  )

  const buyAmountCryptoPrecision = useMemo(() => {
    if (!(quote?.egressAmountNative && buyAsset)) return

    return fromBaseUnit(quote.egressAmountNative, buyAsset.precision)
  }, [quote?.egressAmountNative, buyAsset])

  const rate = useMemo(() => {
    if (!(quote && sellAmountCryptoPrecision)) return '0'

    return bnOrZero(buyAmountCryptoPrecision).div(sellAmountCryptoPrecision).toString()
  }, [buyAmountCryptoPrecision, quote, sellAmountCryptoPrecision])

  const SellAssetIcon = useMemo(() => <AssetIcon assetId={sellAssetId} size='sm' />, [sellAssetId])
  const BuyAssetIcon = useMemo(() => <AssetIcon assetId={buyAssetId} size='sm' />, [buyAssetId])
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

  const { isOpen, onClose, onOpen } = useDisclosure()

  // Rehydrate sell amount input, since we only store amounts in base unit
  useEffect(() => {
    if (!sellAsset?.precision || !sellAmountCryptoBaseUnit) return
    // Run on rehydration only
    if (sellAmountInput !== '') return
    const amountCryptoPrecision = fromBaseUnit(sellAmountCryptoBaseUnit, sellAsset.precision)

    // Don't rehydrate 0 value or problems
    if (bnOrZero(amountCryptoPrecision).isZero()) return

    setSellAmountInput(amountCryptoPrecision)
  }, [sellAsset?.precision, sellAmountCryptoBaseUnit, sellAmountInput])

  const sellAmountFiat = useMemo(() => {
    if (!sellAssetMarketData?.price || !sellAmountCryptoPrecision) return '0'
    return bnOrZero(sellAmountCryptoPrecision).times(sellAssetMarketData.price).toString()
  }, [sellAssetMarketData?.price, sellAmountCryptoPrecision])

  const buyAmountFiat = useMemo(() => {
    if (!buyAssetMarketData?.price || !buyAmountCryptoPrecision) return '0'
    return bnOrZero(buyAmountCryptoPrecision).times(buyAssetMarketData.price).toString()
  }, [buyAssetMarketData?.price, buyAmountCryptoPrecision])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!(quote && sellAsset && buyAsset)) return
      if (!buyAmountCryptoPrecision || !sellAmountCryptoPrecision) return

      const slippageTolerancePercentageDecimal = bnOrZero(
        quote.recommendedSlippageTolerancePercent,
      ).div(100)

      const estimatedRate = bnOrZero(buyAmountCryptoPrecision).div(sellAmountCryptoPrecision)

      // This is called minimumPrice upstream but this really is a rate, let's not honour confusing terminology
      const minimumRate = estimatedRate
        .times(bn(1).minus(slippageTolerancePercentageDecimal))
        .toFixed(buyAsset.precision)

      const sourceAsset = getChainflipId(sellAsset.assetId)
      const destinationAsset = getChainflipId(buyAsset.assetId)

      const createSwapPayload = {
        sourceAsset,
        destinationAsset,
        destinationAddress: destinationAddress || '',
        refundAddress: refundAddress || '',
        minimumPrice: minimumRate,
        retryDurationInBlocks: 150,
      }

      mixpanel?.track(MixPanelEvent.StartTransaction, {
        sourceAsset,
        destinationAsset,
        sellAmountCryptoPrecision,
        sellAmountFiat,
        buyAmountCryptoPrecision,
        buyAmountFiat,
      })

      createSwap(createSwapPayload)
    },
    [
      quote,
      sellAsset,
      buyAsset,
      buyAmountCryptoPrecision,
      sellAmountCryptoPrecision,
      destinationAddress,
      refundAddress,
      sellAmountFiat,
      buyAmountFiat,
      createSwap,
    ],
  )

  const handleSellAssetClick = useCallback(() => {
    setAssetSelectType(AssetType.SELL)
    onOpen()
  }, [onOpen])

  const handleBuyAssetClick = useCallback(() => {
    setAssetSelectType(AssetType.BUY)
    onOpen()
  }, [onOpen])

  const handleAssetSelect = useCallback(
    (asset: Asset) => {
      if (assetSelectType === AssetType.BUY) {
        setValue('buyAssetId', asset.assetId)
      }
      if (assetSelectType === AssetType.SELL) {
        setValue('sellAssetId', asset.assetId)
      }
      onClose()
    },
    [assetSelectType, setValue, onClose],
  )

  const handleSwitchAssets = useCallback(() => {
    const currentSellAsset = sellAsset
    const currentBuyAsset = buyAsset

    if (!(currentSellAsset && currentBuyAsset)) return

    setIsSwitching(true)
    // Another day in react land - avoids flashes of (wrong) content by making the transition state a loading state
    setTimeout(() => setIsSwitching(false), 250)

    if (!sellAssetMarketData?.price || !buyAssetMarketData?.price) {
      setSellAmountInput('')
      setSellAmountFiatInput('')
      setValue('sellAmountCryptoBaseUnit', '0')
      setValue('sellAssetId', currentBuyAsset.assetId)
      setValue('buyAssetId', currentSellAsset.assetId)
      return
    }

    setValue('sellAssetId', currentBuyAsset.assetId)
    setValue('buyAssetId', currentSellAsset.assetId)

    if (isFiat) {
      setSellAmountFiatInput(sellAmountFiatInput)

      const cryptoValue = bnOrZero(sellAmountFiatInput).div(buyAssetMarketData.price).toString()
      setValue('sellAmountCryptoBaseUnit', toBaseUnit(cryptoValue, currentBuyAsset.precision))
      return
    }

    // Prorate sell amount in fiat terms
    const sellAmountUsd = bnOrZero(sellAmountCryptoPrecision).times(sellAssetMarketData.price)
    const newAmount = sellAmountUsd.div(buyAssetMarketData.price).toFixed()

    setValue('sellAmountCryptoBaseUnit', toBaseUnit(newAmount, currentBuyAsset.precision))
    setSellAmountInput(newAmount)
  }, [
    sellAsset,
    buyAsset,
    sellAmountCryptoPrecision,
    sellAmountFiatInput,
    sellAssetMarketData?.price,
    buyAssetMarketData?.price,
    setValue,
    isFiat,
  ])

  const onToggleFiatMode = useCallback(() => {
    if (!isFiat) {
      const fiatValue = bnOrZero(sellAmountInput)
        .times(sellAssetMarketData?.price ?? 0)
        .toString()

      // Update the displayed fiat input immediately
      setSellAmountFiatInput(fiatValue)
    } else {
      const cryptoValue = bnOrZero(sellAmountFiatInput)
        .div(sellAssetMarketData?.price ?? 0)
        .toString()

      // Update the displayed crypto input immediately
      setSellAmountInput(cryptoValue)

      // Update form state immediately
      setValue('sellAmountCryptoBaseUnit', toBaseUnit(cryptoValue, sellAsset?.precision ?? 0))
    }

    toggleIsFiat(!isFiat)
  }, [
    sellAssetMarketData?.price,
    sellAsset?.precision,
    sellAmountInput,
    sellAmountFiatInput,
    setValue,
    isFiat,
  ])

  const handleSellAmountChange = useCallback(
    (values: { value: string }) => {
      if (!sellAsset?.precision) return

      if (isFiat) {
        setSellAmountFiatInput(values.value)

        // Update inverted (crypto) value immediately
        if (sellAssetMarketData?.price && sellAsset?.precision) {
          const cryptoValue = bnOrZero(values.value).div(sellAssetMarketData.price).toString()
          setValue('sellAmountCryptoBaseUnit', toBaseUnit(cryptoValue, sellAsset.precision))
        }
        return
      }

      // Store crypto input immediately
      setSellAmountInput(values.value)

      // Update form state immediately
      setValue('sellAmountCryptoBaseUnit', toBaseUnit(values.value, sellAsset.precision))
    },
    [setValue, isFiat, sellAssetMarketData?.price, sellAsset?.precision],
  )

  const validateDestinationAddress = useCallback(
    async (value: string) => {
      if (!buyAsset) return 'Please select a destination asset'

      const chainId = buyAsset.chainId
      const isValid = await isValidAddress(value, chainId)
      return isValid ? true : `Invalid address for ${buyAsset?.symbol || 'selected asset'}`
    },
    [buyAsset],
  )

  const validateRefundAddress = useCallback(
    async (value: string) => {
      if (!sellAsset) return 'Please select a source asset'

      const chainId = sellAsset.chainId
      const isValid = await isValidAddress(value, chainId)
      return isValid ? true : `Invalid address for ${sellAsset?.symbol || 'selected asset'}`
    },
    [sellAsset],
  )

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

  const isLoading = isQuoteFetching || isSwitching

  const formattedBuyAmountCryptoPrecision = useMemo(() => {
    if (
      (isFiat && bnOrZero(debouncedSellAmountFiat).eq(0)) ||
      (!isFiat && bnOrZero(debouncedSellAmount).eq(0))
    ) {
      return '0'
    }
    // We have a quote error, most likely because of amount too high/low
    if (quoteError) return 'N/A'
    // We have a quote, show the estimated buy amount
    return buyAmountCryptoPrecision
  }, [buyAmountCryptoPrecision, debouncedSellAmount, debouncedSellAmountFiat, isFiat, quoteError])

  if (!(sellAsset && buyAsset)) return null

  return (
    <>
      <Card width='full' maxWidth='450px' overflow='hidden' as='form' onSubmit={handleSubmit}>
        <CardHeader px={0} py={0} bg='background.surface.raised.base'>
          <Flex
            fontSize='sm'
            gap={1}
            justifyContent='center'
            alignItems='center'
            py={2}
            px={4}
            bg='background.surface.raised.base'
            position='relative'
            minH={37}
          >
            {bn(rate).gt(0) ? (
              <>
                <Text color='text.subtle' mr={2}>
                  Your rate
                </Text>
                <Flex gap={1}>
                  {isLoading ? (
                    <Skeleton height='20px' width='200px'>
                      <Flex gap={1}>
                        <Amount.Crypto value='1' symbol={sellAsset.symbol} suffix='=' />
                        <Amount.Crypto value='0' symbol={buyAsset.symbol} />
                      </Flex>
                    </Skeleton>
                  ) : (
                    <>
                      <Amount.Crypto value='1' symbol={sellAsset.symbol} suffix='=' />
                      {bn(rate).isZero() ? (
                        <Text>N/A</Text>
                      ) : (
                        <Amount.Crypto value={rate} symbol={buyAsset.symbol} />
                      )}
                    </>
                  )}
                </Flex>
              </>
            ) : null}
            {bnOrZero(isFiat ? debouncedSellAmountFiat : debouncedSellAmount).gt(0) && (
              <Box position='absolute' right='4' top='50%' transform='translateY(-50%)'>
                <CountdownSpinner
                  isLoading={isQuoteFetching}
                  initialTimeMs={QUOTE_REFETCH_INTERVAL}
                />
              </Box>
            )}
          </Flex>
          <HStack divider={divider} fontSize='sm'>
            <Stat size='sm' textAlign='center' py={4}>
              <StatLabel color='text.subtle'>Deposit This</StatLabel>
              <StatNumber>
                {isLoading ? (
                  <Skeleton width='140px' textAlign='center' margin='0 auto'>
                    <VStack spacing={0}>
                      <Amount.Crypto value='0' symbol={sellAsset.symbol} />
                      <Amount.Fiat value='0' color='text.subtle' fontSize='sm' />
                    </VStack>
                  </Skeleton>
                ) : (
                  <VStack spacing={0}>
                    <Amount.Crypto
                      value={sellAmountCryptoPrecision ?? '0'}
                      symbol={sellAsset.symbol}
                    />
                    <Amount.Fiat value={sellAmountFiat} color='text.subtle' fontSize='sm' />
                  </VStack>
                )}
              </StatNumber>
            </Stat>
            <Stat size='sm' textAlign='center' py={4}>
              <StatLabel color='text.subtle'>To Get This</StatLabel>
              <StatNumber>
                {isLoading ? (
                  <Skeleton width='140px' textAlign='center' margin='0 auto'>
                    <VStack spacing={0}>
                      <Amount.Crypto value='0' symbol={buyAsset.symbol} />
                      <Amount.Fiat value='0' color='text.subtle' fontSize='sm' />
                    </VStack>
                  </Skeleton>
                ) : (
                  <VStack spacing={0}>
                    <Amount.Crypto
                      value={buyAmountCryptoPrecision ?? '0'}
                      symbol={buyAsset.symbol}
                    />
                    <Amount.Fiat value={buyAmountFiat} color='text.subtle' fontSize='sm' />
                  </VStack>
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
            <Flex direction='column' width='50%'>
              {isLoading && isSwitching ? (
                <VStack width='full' spacing={1} align='stretch'>
                  <Skeleton height='40px' width='full'>
                    <Input
                      variant='filled'
                      placeholder={`Enter ${sellAsset.symbol} amount`}
                      isReadOnly
                      value=''
                      {...skeletonInputSx}
                    />
                  </Skeleton>
                  <Skeleton height='18px' width='80px'>
                    <Amount.Fiat value='0' color='text.subtle' fontSize='sm' />
                  </Skeleton>
                </VStack>
              ) : (
                <>
                  <NumericFormat
                    customInput={Input}
                    variant='filled'
                    placeholder={isFiat ? 'Enter USD amount' : `Enter ${sellAsset.symbol} amount`}
                    value={isFiat ? sellAmountFiatInput : sellAmountInput}
                    onValueChange={handleSellAmountChange}
                    allowNegative={false}
                    decimalScale={isFiat ? 2 : sellAsset.precision}
                    isInvalid={!!errors.sellAmountCryptoBaseUnit}
                    allowLeadingZeros
                    prefix={isFiat ? '$' : undefined}
                  />
                  <Link
                    color='text.subtle'
                    fontSize='sm'
                    mt={1}
                    onClick={onToggleFiatMode}
                    userSelect='none'
                  >
                    {isFiat
                      ? `≈ ${sellAmountCryptoPrecision} ${sellAsset.symbol}`
                      : `≈ $${bnOrZero(sellAmountFiat).toFixed(2)}`}
                  </Link>
                  {errors.sellAmountCryptoBaseUnit && (
                    <Text fontSize='sm' color='red.500' mt={1}>
                      {errors.sellAmountCryptoBaseUnit.message}
                    </Text>
                  )}
                </>
              )}
            </Flex>
            <Flex direction='column' width='50%'>
              {isLoading ? (
                <VStack width='full' spacing={1} align='stretch'>
                  <Skeleton height='40px' width='full'>
                    <Input
                      variant='filled'
                      placeholder={`0.0 ${buyAsset.symbol}`}
                      isReadOnly
                      value=''
                      {...skeletonInputSx}
                    />
                  </Skeleton>
                  <Skeleton height='18px' width='80px'>
                    <Amount.Fiat value='0' color='text.subtle' fontSize='sm' />
                  </Skeleton>
                </VStack>
              ) : (
                <VStack width='full' spacing={1} align='stretch'>
                  <Input
                    variant='filled'
                    placeholder={`0.0 ${buyAsset.symbol}`}
                    isReadOnly
                    value={formattedBuyAmountCryptoPrecision}
                    {...skeletonInputSx}
                  />
                  <Amount.Fiat value={buyAmountFiat} color='text.subtle' fontSize='sm' />
                </VStack>
              )}
            </Flex>
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
            isDisabled={!quote || !isValid}
            isLoading={isSwapPending}
            loadingText='Creating Swap'
          >
            Start Transaction
          </Button>
        </CardFooter>
      </Card>
      <AssetSelectModal isOpen={isOpen} onClose={onClose} onClick={handleAssetSelect} />
    </>
  )
}
