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

import { reactQueries } from '../react-queries'
import type { ChainflipAssetsResponse } from './types'

// Map Chainflip internal asset IDs to CAIPs
const chainflipToAssetId: Record<string, string> = {
  'btc.btc': btcAssetId,
  'eth.arb': arbitrumAssetId,
  'eth.eth': ethAssetId,
  'flip.eth': flipAssetId,
  'sol.sol': solAssetId,
  'usdc.arb': usdcOnArbitrumOneAssetId,
  'usdc.eth': usdcAssetId,
  'usdc.sol': usdcOnSolanaAssetId,
  'usdt.eth': usdtAssetId,
}

export const transformChainflipAssets = (data: ChainflipAssetsResponse) => {
  return data.assets.map(asset => chainflipToAssetId[asset.id]).filter(Boolean)
}

export const useChainflipAssetsQuery = () => {
  return useQuery({
    ...reactQueries.chainflip.assets,
    select: transformChainflipAssets,
  })
}
