import { Button, Card, CardBody, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react'
import { useCallback, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router'
import { useAssetById } from 'store/assets'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import type { Asset } from 'types/Asset'
import type { SwapFormData } from 'types/form'

import { AssetSelection } from './AssetSelection'
import { AssetSelectModal } from './AssetSelectModal/AssetSelectModal'
import { AssetType } from './AssetSelectModal/types'

const switchIcon = <FaArrowRightArrowLeft />

export const SelectPair = () => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [assetSelectType, setAssetSelectType] = useState<AssetType>(AssetType.BUY)
  const navigate = useNavigate()
  const { setValue, watch } = useFormContext<SwapFormData>()
  const { sellAssetId, buyAssetId } = watch()

  const sellAsset = useAssetById(sellAssetId || '')
  const buyAsset = useAssetById(buyAssetId || '')

  const handleSubmit = useCallback(() => {
    if (!(sellAsset && buyAsset)) return

    mixpanel?.track(MixPanelEvent.PairSelected, {
      sellAsset,
      buyAsset,
    })

    navigate('/input')
  }, [navigate, sellAsset, buyAsset])

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
    },
    [assetSelectType, setValue],
  )

  const handleSwitchAssets = useCallback(() => {
    const currentSellAssetId = sellAssetId
    const currentBuyAssetId = buyAssetId

    setValue('sellAssetId', currentBuyAssetId)
    setValue('buyAssetId', currentSellAssetId)
  }, [sellAssetId, buyAssetId, setValue])

  return (
    <Card width='full' maxWidth='450px'>
      <CardBody display='flex' flexDir='column' gap={8}>
        <Heading as='h4' fontSize='md' textAlign='center'>
          Choose which assets to trade
        </Heading>
        <Flex alignItems='center' gap={4} color='text.subtle' width='full'>
          <AssetSelection label='Deposit' onClick={handleSellAssetClick} assetId={sellAssetId} />
          <IconButton
            variant='ghost'
            icon={switchIcon}
            aria-label='Switch assets'
            onClick={handleSwitchAssets}
          />
          <AssetSelection label='Receive' onClick={handleBuyAssetClick} assetId={buyAssetId} />
        </Flex>
        <Button
          size='lg'
          colorScheme='blue'
          onClick={handleSubmit}
          isDisabled={!sellAssetId || !buyAssetId}
        >
          Continue
        </Button>
      </CardBody>
      <AssetSelectModal isOpen={isOpen} onClose={onClose} onClick={handleAssetSelect} />
    </Card>
  )
}
