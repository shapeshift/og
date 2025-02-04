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
import { useCallback, useEffect, useMemo } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { BTCImage, ETHImage } from 'lib/const'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import { useMarketDataByAssetIdQuery } from 'queries/marketData'
import { useAssetById } from 'store/assets'
import type { SwapFormData } from 'types/form'

import { Amount } from './Amount/Amount'

export const TradeInput = () => {
  const navigate = useNavigate()
  const { register, watch, setValue } = useFormContext<SwapFormData>()
  const { sellAmount, destinationAddress, refundAddress, sellAsset, buyAsset } = watch()
  
  const fromAsset = sellAsset ? useAssetById(sellAsset) : undefined
  const toAsset = buyAsset ? useAssetById(buyAsset) : undefined
  
  const { data: fromMarketData, isFetching: isFromFetching } = useMarketDataByAssetIdQuery(sellAsset || '')
  const { data: toMarketData, isFetching: isToFetching } = useMarketDataByAssetIdQuery(buyAsset || '')
  
  const isLoading = isFromFetching || isToFetching
  
  const rate = useMemo(() => {
    if (!fromMarketData?.price || !toMarketData?.price) return '0'
    const fromPrice = parseFloat(fromMarketData.price)
    const toPrice = parseFloat(toMarketData.price)
    return (fromPrice / toPrice).toString()
  }, [fromMarketData?.price, toMarketData?.price])
  
  const toAmount = useMemo(() => {
    if (!sellAmount || !rate) return '0'
    return (parseFloat(sellAmount) * parseFloat(rate)).toString()
  }, [rate, sellAmount])

  // Update buyAmount in form whenever toAmount changes
  useEffect(() => {
    setValue('buyAmount', toAmount)
  }, [toAmount, setValue])
  
  const Divider = useMemo(() => <StackDivider borderColor='border.base' />, [])
  const FromAssetIcon = useMemo(() => <Avatar size='sm' src={fromAsset?.icon || BTCImage} />, [fromAsset?.icon])
  const ToAssetIcon = useMemo(() => <Avatar size='sm' src={toAsset?.icon || ETHImage} />, [toAsset?.icon])
  const SwitchIcon = useMemo(() => <FaArrowRightArrowLeft />, [])
  
  const handleSubmit = useCallback(() => {
    mixpanel?.track(MixPanelEvent.StartTransaction, {
      'some key': 'some val',
    })
    navigate('/status')
  }, [navigate])

  const handleFromAssetClick = useCallback(() => {
    console.info('asset click')
  }, [])
  
  const handleToAssetClick = useCallback(() => {
    console.info('to asset click')
  }, [])

  return (
    <Card width='full' maxWidth='450px' overflow='hidden'>
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
              <Amount.Crypto value={sellAmount || '0'} symbol={fromAsset?.symbol || 'BTC'} />
            </StatNumber>
          </Stat>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>To Get This</StatLabel>
            <StatNumber>
              <Skeleton isLoaded={!isLoading}>
                <Amount.Crypto 
                  value={toAmount} 
                  symbol={toAsset?.symbol || 'ETH'} 
                />
              </Skeleton>
            </StatNumber>
          </Stat>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>Miner Fee</StatLabel>
            <StatNumber>
              <Amount.Fiat value='10' />
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
          <IconButton variant='ghost' icon={SwitchIcon} aria-label='Switch Assets' />
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
          <Input 
            variant='filled' 
            placeholder={`0.0 ${fromAsset?.symbol || 'BTC'}`}
            {...register('sellAmount', { required: true })}
          />
          <Input 
            variant='filled' 
            placeholder={`0.0 ${toAsset?.symbol || 'ETH'}`}
            isReadOnly
            value={toAmount}
            bg="background.surface.raised.base"
            _hover={{ bg: "background.surface.raised.base" }}
            _focus={{ bg: "background.surface.raised.base" }}
          />
        </Flex>
        <Input 
          placeholder={`Destination address (${toAsset?.symbol || 'ETH'})`}
          {...register('destinationAddress', { required: true })}
        />
        <Input 
          placeholder={`Refund address (${fromAsset?.symbol || 'BTC'})`}
          {...register('refundAddress', { required: true })}
        />
      </CardBody>
      <CardFooter>
        <Button 
          colorScheme='blue' 
          size='lg' 
          width='full' 
          onClick={handleSubmit}
          isDisabled={!sellAmount || !destinationAddress || !refundAddress}
        >
          Start Transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
