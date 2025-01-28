import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
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

import type { ChainflipAssetsResponse } from './types'

const CHAINFLIP_API_URL = import.meta.env.VITE_CHAINFLIP_API_URL

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
    queryKey: ['chainflip', 'assets'],
    queryFn: async () => {
      const { data } = await axios.get<ChainflipAssetsResponse>(`${CHAINFLIP_API_URL}/assets`)
      return data
    },
    select: transformChainflipAssets,
  })
}
