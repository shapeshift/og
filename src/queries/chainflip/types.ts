export type ChainflipAsset = {
  id: string
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

export type ChainflipQuoteError = {
  errors?: {
    minimalAmount?: string[]
    minimalAmountNative?: string[]
  }
  detail?: string
  status?: number
}

export type ChainflipQuoteParams = {
  sourceAsset: string | undefined
  destinationAsset: string | undefined
  amount: string
  commissionBps?: number
}

export type ChainflipSwapResponse = {
  id: number
  address: string
  issuedBlock: number
  network: string
  channelId: number
  sourceExpiryBlock: number
  explorerUrl: string
  channelOpeningFee: number
  channelOpeningFeeNative: string
}

export type ChainflipSwapParams = {
  sourceAsset: string
  destinationAsset: string
  destinationAddress: string
  minimumPrice: string
  refundAddress: string
  maxBoostFee?: number
  retryDurationInBlocks?: number
  commissionBps?: number
  numberOfChunks?: number
  chunkIntervalBlocks?: number
}

export type ChainflipSwapEgress = {
  transactionReference?: string
}

export type ChainflipSwapStatus = {
  state: 'waiting' | 'receiving' | 'swapping' | 'sending' | 'sent' | 'completed' | 'failed'
  swapId?: string
  swapEgress?: ChainflipSwapEgress
  depositChannel?: {
    id: string
    estimatedExpiryTime: string
    isExpired: boolean
  }
  sourceAsset: string
  destinationAsset: string
  destinationAddress: string
  estimatedDurationSeconds: number
  fees: any[]
  swap?: {
    regular?: {
      retryCount: number
      inputAmount: number
      inputAmountNative: string
      scheduledAt: number
      scheduledAtDate: string
      scheduledBlockIndex: string
    }
  }
}

export type ChainflipStatusResponse = {
  id: number
  status: ChainflipSwapStatus
}
