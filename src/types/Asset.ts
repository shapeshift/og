import type { AssetId, ChainId } from '@shapeshiftoss/caip'

export type Asset = {
  assetId: AssetId
  chainId: ChainId
  description?: string
  isTrustedDescription?: boolean
  symbol: string
  name: string
  id?: string
  networkName?: string
  precision: number
  color: string
  networkColor?: string
  icon: string
  icons?: string[]
  networkIcon?: string
  explorer: string
  explorerTxLink: string
  explorerAddressLink: string
}
