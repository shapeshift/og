import { btcAssetId, ethAssetId } from 'constants/caip'
import { bnOrZero } from 'lib/bignumber/bignumber'
import type { SwapFormData } from 'types/form'

// Form fields that are never read from or written to the URL. Addresses must not be pre-filled
// by a link, and must not leak into a URL that gets shared or logged.
const URL_EXCLUDED_FIELDS: readonly string[] = [
  'destinationAddress',
  'refundAddress',
] satisfies (keyof SwapFormData)[]

export const isUrlExcludedField = (key: string): boolean => URL_EXCLUDED_FIELDS.includes(key)

export const getFormDefaultsFromSearchParams = (
  searchParams: URLSearchParams,
): Partial<SwapFormData> => {
  const sellAmountCryptoBaseUnit = searchParams.get('sellAmountCryptoBaseUnit')

  return {
    sellAssetId: searchParams.get('sellAssetId') || ethAssetId,
    buyAssetId: searchParams.get('buyAssetId') || btcAssetId,
    sellAmountCryptoBaseUnit: bnOrZero(sellAmountCryptoBaseUnit).gt(0)
      ? sellAmountCryptoBaseUnit!
      : undefined,
  }
}

// Picks the URL-backed form fields out of the query string, ignoring anything else.
export const getFormValuesFromSearchParams = (
  searchParams: URLSearchParams,
): Partial<SwapFormData> => {
  const urlBackedKeys = Object.keys(getFormDefaultsFromSearchParams(new URLSearchParams()))
  const formData: Partial<SwapFormData> = {}
  searchParams.forEach((value, key) => {
    if (urlBackedKeys.includes(key) && !isUrlExcludedField(key)) {
      formData[key as keyof SwapFormData] = value
    }
  })
  return formData
}
