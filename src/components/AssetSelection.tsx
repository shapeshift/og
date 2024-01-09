import { Avatar, Button, Text } from '@chakra-ui/react'
import type { Asset } from 'types/Asset'

type AssetSelectionProps = {
  onClick: () => void
  label: string
  asset?: Asset
}

export const AssetSelection: React.FC<AssetSelectionProps> = ({ label, onClick, asset }) => {
  return (
    <Button flexDir='column' height='auto' py={4} gap={4} flex={1} onClick={onClick}>
      <Text color='text.subtle'>{label}</Text>
      <Avatar src={asset ? asset.icon : ''} />
      <Text textOverflow='ellipsis' overflow='hidden' width='full'>
        {asset ? asset.name : 'Select Asset'}
      </Text>
    </Button>
  )
}
