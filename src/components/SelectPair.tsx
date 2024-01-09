import { Button, Card, CardBody, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import type { Asset } from 'types/Asset'

import { AssetSelection } from './AssetSelection'
import { AssetSelectModal } from './AssetSelectModal/AssetSelectModal'
import { AssetType } from './AssetSelectModal/types'

export const SelectPair = () => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [sellAsset, setSellAsset] = useState<Asset>()
  const [buyAsset, setBuyAsset] = useState<Asset>()
  const [assetSelectType, setAssetSelectType] = useState<AssetType>(AssetType.BUY)
  const navigate = useNavigate()
  const switchIcon = useMemo(() => <FaArrowRightArrowLeft />, [])
  const handleSubmit = useCallback(() => {
    mixpanel?.track(MixPanelEvent.PairSelected, {
      'some key': 'some val',
    })

    navigate('/input')
  }, [navigate])

  const handleFromAssetClick = useCallback(() => {
    setAssetSelectType(AssetType.SELL)
    onOpen()
  }, [onOpen])

  const handleToAssetClick = useCallback(() => {
    setAssetSelectType(AssetType.BUY)
    onOpen()
  }, [onOpen])

  const handleAssetSelect = useCallback(
    (asset: Asset) => {
      if (assetSelectType === AssetType.BUY) {
        setBuyAsset(asset)
      }
      if (assetSelectType === AssetType.SELL) {
        setSellAsset(asset)
      }
    },
    [assetSelectType],
  )

  return (
    <Card width='full' maxWidth='450px'>
      <CardBody display='flex' flexDir='column' gap={8}>
        <Heading as='h4' fontSize='md' textAlign='center'>
          Choose which assets to trade
        </Heading>
        <Flex alignItems='center' gap={4} color='text.subtle' width='full'>
          <AssetSelection label='Deposit' onClick={handleFromAssetClick} asset={sellAsset} />
          <IconButton variant='ghost' icon={switchIcon} aria-label='Switch assets' />
          <AssetSelection label='Receive' onClick={handleToAssetClick} asset={buyAsset} />
        </Flex>
        <Button size='lg' colorScheme='blue' onClick={handleSubmit}>
          Continue
        </Button>
      </CardBody>
      <AssetSelectModal isOpen={isOpen} onClose={onClose} onClick={handleAssetSelect} />
    </Card>
  )
}
