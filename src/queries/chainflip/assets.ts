import type { AssetId } from '@shapeshiftoss/caip'
import { useQuery } from '@tanstack/react-query'
import {
  arbitrumAssetId,
  btcAssetId,
  ethAssetId,
  flipAssetId,
  solAssetId,
  usdcAssetId,
  usdcOnArbitrumOneAssetId,
  usdcOnSolanaAssetId,
  usdtAssetId,
} from 'constants/caip'
import mirror from 'lodash/invert'

import { reactQueries } from '../react-queries'
import type { ChainflipAssetsResponse } from './types'

// Map CAIPs to Chainflip internal asset IDs
const assetIdToChainflipId: Record<AssetId, string> = {
  [btcAssetId]: 'btc.btc',
  [arbitrumAssetId]: 'eth.arb',
  [ethAssetId]: 'eth.eth',
  [flipAssetId]: 'flip.eth',
  [solAssetId]: 'sol.sol',
  [usdcOnArbitrumOneAssetId]: 'usdc.arb',
  [usdcAssetId]: 'usdc.eth',
  [usdcOnSolanaAssetId]: 'usdc.sol',
  [usdtAssetId]: 'usdt.eth',
}

// Map Chainflip internal asset IDs to CAIPs
export const chainflipToAssetId = mirror(assetIdToChainflipId)

export const transformChainflipAssets = (data: ChainflipAssetsResponse) => {
  return data.assets.map(asset => chainflipToAssetId[asset.id]).filter(Boolean)
}

export const getChainflipId = (assetId: AssetId): string => {
  const chainflipAssetId = assetIdToChainflipId[assetId]
  if (!chainflipAssetId) throw new Error(`Asset ${assetId} not supported by Chainflip`)
  return chainflipAssetId
}

export const useChainflipAssetsQuery = () => {
  return useQuery({
    ...reactQueries.chainflip.assets,
    select: transformChainflipAssets,
  })
}
