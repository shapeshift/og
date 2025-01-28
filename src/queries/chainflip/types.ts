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

export type ChainflipQuoteFee = {
  type: 'ingress' | 'network' | 'broker' | 'egress' | 'liquidity'
  asset: string
  amount: number
  amountNative: string
}

export type ChainflipPoolInfo = {
  baseAsset: string
  quoteAsset: string
  fee: {
    asset: string
    amount: number
    amountNative: string
  }
}

export type ChainflipQuote = {
  type: 'regular' | 'dca'
  ingressAsset: string
  ingressAmount: number
  ingressAmountNative: string
  intermediateAsset: string | null
  intermediateAmount: number | null
  intermediateAmountNative: string | null
  egressAsset: string
  egressAmount: number
  egressAmountNative: string
  includedFees: ChainflipQuoteFee[]
  recommendedSlippageTolerancePercent: number
  lowLiquidityWarning: boolean
  poolInfo: ChainflipPoolInfo[]
  estimatedDurationSeconds: number
  estimatedDurationsSeconds: {
    deposit: number
    swap: number
    egress: number
  }
  estimatedPrice: number
  chunkIntervalBlocks?: number | null
  numberOfChunks?: number | null
  boostQuote?: ChainflipQuote
}

export type ChainflipQuoteParams = {
  sourceAsset: string
  destinationAsset: string
  amount: string
  commissionBps?: number
} 