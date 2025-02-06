import { Avatar, Button, Text } from '@chakra-ui/react'
import type { AssetId } from '@shapeshiftoss/caip'
import { memo, useMemo } from 'react'
import { useAssetById } from 'store/assets'

type AssetSelectionProps = {
  onClick: () => void
  label: string
  assetId?: AssetId
}

export const AssetSelection = memo(function AssetSelection({
  label,
  onClick,
  assetId,
}: AssetSelectionProps) {
  const assetData = useAssetById(assetId || '')
  const asset = useMemo(() => (assetId ? assetData : undefined), [assetId, assetData])

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
