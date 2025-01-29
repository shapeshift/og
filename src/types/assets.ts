import type { AssetId, ChainId } from '@shapeshiftoss/caip'

export type Asset = {
  assetId: AssetId
  chainId: ChainId
  symbol: string
  name: string
  precision: number
  color: string
  icon: string
  explorer: string
  explorerAddressLink: string
  explorerTxLink: string
  relatedAssetKey: AssetId | null
  networkName?: string
  networkIcon?: string
  networkColor?: string
}
