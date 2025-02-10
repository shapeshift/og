import {
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
  useDisclosure,
} from '@chakra-ui/react'
import { getChainflipId } from 'queries/chainflip/assets'
import { useChainflipQuoteQuery } from 'queries/chainflip/quote'
import { useChainflipSwapMutation } from 'queries/chainflip/swap'
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

  useEffect(() => {
    trigger(['destinationAddress', 'refundAddress'])
  }, [trigger, destinationAddress, refundAddress, sellAssetId, buyAssetId])

  const sellAsset = useAssetById(sellAssetId)
  const buyAsset = useAssetById(buyAssetId)

  // Rehydrate sell amount input, since we only store amounts in base unit
  useEffect(() => {
    if (!sellAsset?.precision || !sellAmountCryptoBaseUnit) return
    const amountCryptoPrecision = fromBaseUnit(sellAmountCryptoBaseUnit, sellAsset.precision)
    setSellAmountInput(amountCryptoPrecision)
  }, [sellAsset?.precision, sellAmountCryptoBaseUnit])

  const sellAmountCryptoPrecision = useMemo(() => {
    if (!sellAsset) return

    return fromBaseUnit(sellAmountCryptoBaseUnit, sellAsset.precision)
  }, [sellAsset, sellAmountCryptoBaseUnit])

  const {
    data: quote,
    isFetching: isQuoteFetching,
    error: quoteError,
  } = useChainflipQuoteQuery(
    {
      sourceAsset: sellAsset ? getChainflipId(sellAsset.assetId) : '',
      destinationAsset: buyAsset ? getChainflipId(buyAsset.assetId) : '',
      amount: sellAmountCryptoBaseUnit,
    },
    { refetchInterval: 5000 },
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
  const [assetSelectType, setAssetSelectType] = useState<AssetType>(AssetType.BUY)
  const [sellAmountInput, setSellAmountInput] = useState('')
  const debouncedSellAmount = useDebounce(sellAmountInput, 200)

  useEffect(() => {
    if (!sellAsset?.precision) return
    setValue('sellAmountCryptoBaseUnit', toBaseUnit(debouncedSellAmount, sellAsset.precision))
  }, [debouncedSellAmount, sellAsset?.precision, setValue])

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

      const createSwapPayload = {
        sourceAsset: getChainflipId(sellAsset.assetId),
        destinationAsset: getChainflipId(buyAsset.assetId),
        destinationAddress: destinationAddress || '',
        refundAddress: refundAddress || '',
        minimumPrice: minimumRate,
      }

      mixpanel?.track(MixPanelEvent.StartTransaction, createSwapPayload)

      createSwap(createSwapPayload)
    },
    [
      quote,
      sellAsset,
      buyAsset,
      destinationAddress,
      refundAddress,
      createSwap,
      buyAmountCryptoPrecision,
      sellAmountCryptoPrecision,
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

    if (!(currentSellAsset && currentBuyAsset && quote)) return

    // New sell amount is the previous buy amount. Easy as!
    // Note, we set it *before* switching the assets because something something debounce.
    const newSellAmountCryptoPrecision = bnOrZero(buyAmountCryptoPrecision)
    setSellAmountInput(newSellAmountCryptoPrecision.toString())

    setValue('sellAssetId', currentBuyAsset.assetId)
    setValue('buyAssetId', currentSellAsset.assetId)
  }, [sellAsset, buyAsset, quote, buyAmountCryptoPrecision, setValue, setSellAmountInput])

  const handleSellAmountChange = useCallback((values: { value: string }) => {
    setSellAmountInput(values.value)
  }, [])

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

  if (!(sellAsset && buyAsset)) return null

  return (
    <>
      <Card width='full' maxWidth='450px' overflow='hidden' as='form' onSubmit={handleSubmit}>
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
                  <Skeleton height='24px' width='100px' textAlign='center' margin='0 auto'>
                    <Amount.Crypto value='0' symbol={buyAsset.symbol} />
                  </Skeleton>
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
            <Flex direction='column' width='50%'>
              <NumericFormat
                customInput={Input}
                variant='filled'
                placeholder={`Enter ${sellAsset.symbol} amount`}
                value={sellAmountInput}
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
            <Flex width='50%'>
              {isQuoteFetching ? (
                <Skeleton height='40px' width='full'>
                  <Input
                    variant='filled'
                    placeholder={`0.0 ${buyAsset.symbol}`}
                    isReadOnly
                    value=''
                    {...skeletonInputSx}
                  />
                </Skeleton>
              ) : (
                <Input
                  variant='filled'
                  placeholder={`0.0 ${buyAsset.symbol}`}
                  isReadOnly
                  value={buyAmountCryptoPrecision || 'N/A'}
                  {...skeletonInputSx}
                />
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
