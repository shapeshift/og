import type { AssetId } from '@shapeshiftoss/caip'

export type SwapFormData = {
  sellAssetId: AssetId | undefined
  buyAssetId: AssetId | undefined
  sellAmountCryptoBaseUnit: string
  destinationAddress: string
  refundAddress: string
}
