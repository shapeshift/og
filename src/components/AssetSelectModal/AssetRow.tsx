import { Box, Button, Flex, SkeletonCircle, Text } from '@chakra-ui/react'
import type { FC } from 'react'
import { memo, useCallback, useState } from 'react'
import type { Asset } from 'types/Asset'

import { AssetIcon } from '../AssetIcon'

const focus = {
  shadow: 'outline-inset',
}

type AssetRowProps = {
  onClick: (asset: Asset) => void
} & Asset

export const AssetRow: FC<AssetRowProps> = memo(({ onClick, ...asset }) => {
  const [imgLoaded, setImgLoaded] = useState(false)
  const { name, symbol } = asset
  const handleClick = useCallback(() => {
    onClick(asset)
  }, [asset, onClick])

  const handleImageLoad = useCallback(() => {
    setImgLoaded(true)
  }, [])

  if (!asset) return null

  return (
    <Button
      width='full'
      variant='ghost'
      onClick={handleClick}
      justifyContent='space-between'
      _focus={focus}
      height='auto'
      py={4}
    >
      <Flex gap={4} alignItems='center'>
        <SkeletonCircle isLoaded={imgLoaded}>
          <AssetIcon asset={asset} size='sm' onLoad={handleImageLoad} />
        </SkeletonCircle>
        <Box textAlign='left'>
          <Text
            lineHeight={1}
            textOverflow='ellipsis'
            whiteSpace='nowrap'
            maxWidth='200px'
            overflow='hidden'
            color='text.base'
            fontSize='sm'
            mb={1}
          >
            {name}
          </Text>
          <Text fontWeight='normal' fontSize='xs' color='text.subtle'>
            {symbol}
          </Text>
        </Box>
      </Flex>
    </Button>
  )
})
