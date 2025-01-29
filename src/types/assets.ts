export type AssetId = string
export type ChainId = string

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

export type AssetsByIdPartial = Record<AssetId, Asset> 