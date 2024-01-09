import type { ListProps } from '@chakra-ui/react'
import type { FC } from 'react'
import { useCallback } from 'react'
import { Virtuoso } from 'react-virtuoso'
import type { Asset } from 'types/Asset'

import { AssetRow } from './AssetRow'

const style = { height: '400px' }

export type AssetData = {
  assets: Asset[]
  handleClick: (asset: Asset) => void
}

type AssetListProps = AssetData & ListProps

export const AssetList: FC<AssetListProps> = ({ assets, handleClick }) => {
  const renderItemContent = useCallback(
    (index: number, asset: Asset) => {
      return <AssetRow {...asset} key={index} onClick={handleClick} />
    },
    [handleClick],
  )

  return (
    <Virtuoso
      style={style}
      data={assets}
      totalCount={assets.length}
      itemContent={renderItemContent}
    />
  )
}
