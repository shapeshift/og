import { Avatar, Button, Text } from '@chakra-ui/react'

type AssetSelectionProps = {
  onClick: () => void
  label: string
}

export const AssetSelection: React.FC<AssetSelectionProps> = ({ label, onClick }) => {
  return (
    <Button flexDir='column' height='auto' py={4} gap={4} flex={1} onClick={onClick}>
      <Text color='text.subtle'>{label}</Text>
      <Avatar />
      <Text>Bitcoin</Text>
    </Button>
  )
}
