export type ChainflipAsset = {
  id: string // e.g. "flip.eth"
  direction: 'both' | 'ingress' | 'egress'
  ticker: string
  name: string
  network: string
  contractAddress?: string
  networkLogo: string
  assetLogo: string
  decimals: number
  minimalAmount: number
  minimalAmountNative: string
  usdPrice: number
  usdPriceNative: string
}

export type ChainflipAssetsResponse = {
  assets: ChainflipAsset[]
} 