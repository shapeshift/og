import { Button, Card, CardBody, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { BTCImage, ETHImage } from 'lib/const'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'

import { AssetSelection } from './AssetSelection'
import { AssetSelectModal } from './AssetSelectModal/AssetSelectModal'

export const SelectPair = () => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const navigate = useNavigate()
  const switchIcon = useMemo(() => <FaArrowRightArrowLeft />, [])
  const handleSubmit = useCallback(() => {
    mixpanel?.track(MixPanelEvent.PairSelected, {
      'some key': 'some val',
    })

    navigate('/input')
  }, [navigate])

  const handleFromAssetClick = useCallback(() => {
    onOpen()
    console.info('asset click')
  }, [onOpen])
  const handleToAssetClick = useCallback(() => {
    onOpen()
  }, [onOpen])

  return (
    <Card width='full' maxWidth='450px'>
      <CardBody display='flex' flexDir='column' gap={8}>
        <Heading as='h4' fontSize='md' textAlign='center'>
          Choose which assets to trade
        </Heading>
        <Flex alignItems='center' gap={4} color='text.subtle' width='full'>
          <AssetSelection
            label='Deposit'
            onClick={handleFromAssetClick}
            assetIcon={BTCImage}
            assetName='Bitcoin'
          />
          <IconButton variant='ghost' icon={switchIcon} aria-label='Switch assets' />
          <AssetSelection
            label='Receive'
            onClick={handleToAssetClick}
            assetIcon={ETHImage}
            assetName='Ethereum'
          />
        </Flex>
        <Button size='lg' colorScheme='blue' onClick={handleSubmit}>
          Continue
        </Button>
      </CardBody>
      <AssetSelectModal isOpen={isOpen} onClose={onClose} />
    </Card>
  )
}
