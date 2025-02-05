import { Avatar, Button, Text } from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { useAssetById } from 'store/assets'
import { memo } from 'react'

type AssetSelectionProps = {
  onClick: () => void
  label: string
  assetId?: AssetId
}

export const AssetSelection = memo(function AssetSelection({ label, onClick, assetId }: AssetSelectionProps) {
  const asset = assetId ? useAssetById(assetId) : undefined

  return (
    <Button flexDir='column' height='auto' py={4} gap={4} flex={1} onClick={onClick}>
      <Text color='text.subtle'>{label}</Text>
      <Avatar src={asset?.icon || ''} />
      <Text textOverflow='ellipsis' overflow='hidden' width='full'>
        {asset?.name || 'Select Asset'}
      </Text>
    </Button>
  )
})
