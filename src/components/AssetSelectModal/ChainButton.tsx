import { Avatar, IconButton } from '@chakra-ui/react'
import type { ChainId } from '@shapeshiftoss/caip'
import { useCallback, useMemo } from 'react'
export type ChainRow = {
  chainId: ChainId
  icon: string
  name: string
}

type ChainButtonProps = {
  onClick: (chainId: ChainId) => void
  isActive?: boolean
} & ChainRow

export const ChainButton: React.FC<ChainButtonProps> = ({
  name,
  chainId,
  icon,
  onClick,
  isActive,
}) => {
  const chainIcon = useMemo(() => {
    return <Avatar size='sm' src={icon} />
  }, [icon])

  const handleClick = useCallback(() => {
    onClick(chainId)
  }, [chainId, onClick])

  return (
    <IconButton
      isActive={isActive}
      variant='outline'
      size='lg'
      aria-label={name}
      icon={chainIcon}
      onClick={handleClick}
    />
  )
}
