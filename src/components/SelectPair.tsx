import { Button, Card, CardBody, Flex, Heading, IconButton, useDisclosure } from '@chakra-ui/react'
import { useCallback, useMemo, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router'
import { mixpanel, MixPanelEvent } from 'lib/mixpanel'
import type { Asset } from 'types/Asset'
import type { SwapFormData } from 'types/form'

import { AssetSelection } from './AssetSelection'
import { AssetSelectModal } from './AssetSelectModal/AssetSelectModal'
import { AssetType } from './AssetSelectModal/types'

export const SelectPair = () => {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const [assetSelectType, setAssetSelectType] = useState<AssetType>(AssetType.BUY)
  const navigate = useNavigate()
  const { setValue, watch } = useFormContext<SwapFormData>()
  const { sellAssetId, buyAssetId } = watch()

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
        setValue('buyAssetId', asset.assetId, { shouldValidate: true })
      }
      if (assetSelectType === AssetType.SELL) {
        setValue('sellAssetId', asset.assetId, { shouldValidate: true })
      }
    },
    [assetSelectType, setValue],
  )

  const handleSwitchAssets = useCallback(() => {
    const currentSellAsset = sellAssetId
    const currentBuyAsset = buyAssetId

    setValue('sellAssetId', currentBuyAsset)
    setValue('buyAssetId', currentSellAsset)
  }, [sellAssetId, buyAssetId, setValue])

  return (
    <Card width='full' maxWidth='450px'>
      <CardBody display='flex' flexDir='column' gap={8}>
        <Heading as='h4' fontSize='md' textAlign='center'>
          Choose which assets to trade
        </Heading>
        <Flex alignItems='center' gap={4} color='text.subtle' width='full'>
          <AssetSelection label='Deposit' onClick={handleFromAssetClick} assetId={sellAssetId} />
          <IconButton
            variant='ghost'
            icon={switchIcon}
            aria-label='Switch assets'
            onClick={handleSwitchAssets}
          />
          <AssetSelection label='Receive' onClick={handleToAssetClick} assetId={buyAssetId} />
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
