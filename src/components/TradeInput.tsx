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
  StackDivider,
  Stat,
  StatLabel,
  StatNumber,
  Text,
} from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { BTCImage, ETHImage } from 'lib/const'
import { getMixPanel, MixPanelEvent } from 'lib/mixpanel'

import { Amount } from './Amount/Amount'

export const TradeInput = () => {
  const mixpanel = getMixPanel()
  const navigate = useNavigate()
  const Divider = useMemo(() => <StackDivider borderColor='border.base' />, [])
  const FromAssetIcon = useMemo(() => <Avatar size='sm' src={BTCImage} />, [])
  const ToAssetIcon = useMemo(() => <Avatar size='sm' src={ETHImage} />, [])
  const SwitchIcon = useMemo(() => <FaArrowRightArrowLeft />, [])
  const handleSubmit = useCallback(() => {
    mixpanel?.track(MixPanelEvent.StartTransaction, {
      'some key': 'some val',
    })
    navigate('/status')
  }, [mixpanel, navigate])

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
          <Flex gap={1}>
            <Amount.Crypto value='1' symbol='BTC' suffix='=' />
            <Amount.Crypto value='12.90126' symbol='ETH' />
          </Flex>
        </Flex>
        <HStack divider={Divider} fontSize='sm'>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>Deposit This</StatLabel>
            <StatNumber>
              <Amount.Crypto value='0.002' symbol='BTC' />
            </StatNumber>
          </Stat>
          <Stat size='sm' textAlign='center' py={4}>
            <StatLabel color='text.subtle'>To Get This</StatLabel>
            <StatNumber>
              <Amount.Crypto value='0.0248' symbol='ETH' />
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
          <Input variant='filled' placeholder='0.0 BTC' />
          <Input variant='filled' placeholder='0.0 ETH' />
        </Flex>
        <Input placeholder='Destionation address (ETH)' />
        <Input placeholder='Refund address (BTC)' />
      </CardBody>
      <CardFooter>
        <Button colorScheme='blue' size='lg' width='full' onClick={handleSubmit}>
          Start Transaction
        </Button>
      </CardFooter>
    </Card>
  )
}
