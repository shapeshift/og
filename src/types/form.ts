import type { AssetId } from '@shapeshiftoss/caip'

export type SwapFormData = {
  sellAsset: AssetId | undefined
  buyAsset: AssetId | undefined
  sellAmount: string
  buyAmount: string
  destinationAddress: string
  refundAddress: string
} 