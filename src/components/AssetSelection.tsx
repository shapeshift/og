import { Button, Text, VStack } from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { memo } from 'react'
import { useAssetById } from 'store/assets'

import { AssetIcon } from './AssetIcon'

type AssetSelectionProps = {
  onClick: () => void
  label: string
  assetId?: AssetId
}

export const AssetSelection = memo(({ label, onClick, assetId }: AssetSelectionProps) => {
  const asset = useAssetById(assetId)

  if (!asset) return

  return (
    <Button flexDir='column' height='auto' py={4} gap={4} flex={1} onClick={onClick}>
      <Text color='text.subtle'>{label}</Text>
      <AssetIcon asset={asset} />
      <VStack spacing={0} minHeight="42px">
        <Text textOverflow='ellipsis' overflow='hidden' width='full'>
          {asset?.name || 'Select Asset'}
        </Text>
        {asset?.relatedAssetKey && (
          <Text fontSize='xs' color='text.subtle'>
            on {asset.networkName}
          </Text>
        )}
      </VStack>
    </Button>
  )
})
