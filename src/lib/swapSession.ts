import type { AssetId } from '@shapeshiftoss/caip'
import { getChainflipId } from 'queries/chainflip/assets'
import type { ChainflipSwapStatus } from 'queries/chainflip/types'

// Details of a swap this browser tab created via the broker. The status page only ever renders
// deposit details from here, never from the URL, so a /status link cannot supply a
// deposit address or order details that this app did not receive from the broker itself.
export type SwapSession = {
  swapId: number
  channelId: number
  depositAddress: string
  sellAssetId: AssetId
  buyAssetId: AssetId
  sellAmountCryptoBaseUnit: string
  destinationAddress: string
  refundAddress: string
}

const STORAGE_KEY_PREFIX = 'og:swap:'

const getStorage = (): Storage | undefined => {
  try {
    return window.sessionStorage
  } catch {
    return undefined
  }
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const isSwapSession = (value: unknown): value is SwapSession => {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.swapId === 'number' &&
    Number.isFinite(v.swapId) &&
    typeof v.channelId === 'number' &&
    Number.isFinite(v.channelId) &&
    isNonEmptyString(v.depositAddress) &&
    isNonEmptyString(v.sellAssetId) &&
    isNonEmptyString(v.buyAssetId) &&
    isNonEmptyString(v.sellAmountCryptoBaseUnit) &&
    isNonEmptyString(v.destinationAddress) &&
    isNonEmptyString(v.refundAddress)
  )
}

export const saveSwapSession = (session: SwapSession): void => {
  try {
    getStorage()?.setItem(`${STORAGE_KEY_PREFIX}${session.swapId}`, JSON.stringify(session))
  } catch {
    // Storage full or unavailable: the status page will fall back to broker-only data.
  }
}

export const getSwapSession = (swapId: string | null | undefined): SwapSession | undefined => {
  if (!swapId || !/^\d+$/.test(swapId)) return
  try {
    const raw = getStorage()?.getItem(`${STORAGE_KEY_PREFIX}${swapId}`)
    if (!raw) return
    const parsed: unknown = JSON.parse(raw)
    if (!isSwapSession(parsed)) return
    if (String(parsed.swapId) !== swapId) return
    return parsed
  } catch {
    return
  }
}

const normalizeAddress = (address: string): string => {
  const trimmed = address.trim()
  // EVM addresses may come back checksummed or lowercased; case carries no meaning there.
  return /^0x[0-9a-fA-F]{40}$/.test(trimmed) ? trimmed.toLowerCase() : trimmed
}

const normalizeAsset = (asset: string): string => asset.trim().toLowerCase()

export type SwapSessionMismatch = 'sourceAsset' | 'destinationAsset' | 'destinationAddress'

// Cross-checks what we stored at swap creation against what the broker reports for the same
// swapId. Any disagreement means the deposit details must not be shown.
export const getSwapSessionMismatches = (
  session: SwapSession,
  status: Pick<ChainflipSwapStatus, 'sourceAsset' | 'destinationAsset' | 'destinationAddress'>,
): SwapSessionMismatch[] => {
  const mismatches: SwapSessionMismatch[] = []

  let expectedSourceAsset: string | undefined
  let expectedDestinationAsset: string | undefined
  try {
    expectedSourceAsset = getChainflipId(session.sellAssetId)
    expectedDestinationAsset = getChainflipId(session.buyAssetId)
  } catch {
    // Unsupported asset in storage: treat as a mismatch below.
  }

  if (
    !expectedSourceAsset ||
    !isNonEmptyString(status.sourceAsset) ||
    normalizeAsset(status.sourceAsset) !== normalizeAsset(expectedSourceAsset)
  ) {
    mismatches.push('sourceAsset')
  }

  if (
    !expectedDestinationAsset ||
    !isNonEmptyString(status.destinationAsset) ||
    normalizeAsset(status.destinationAsset) !== normalizeAsset(expectedDestinationAsset)
  ) {
    mismatches.push('destinationAsset')
  }

  if (
    !isNonEmptyString(status.destinationAddress) ||
    normalizeAddress(status.destinationAddress) !== normalizeAddress(session.destinationAddress)
  ) {
    mismatches.push('destinationAddress')
  }

  return mismatches
}
