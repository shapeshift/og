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

import { reactQueries } from '../react-queries'
import type { CoinGeckoAssetData, MarketData } from './types'

const COINGECKO_BASE_URL = 'https://api.proxy.shapeshift.com/api/v1/markets'

// i.e supported assets on Chainflip only
const ASSET_ID_TO_COINGECKO_ID: Record<string, string> = {
  [btcAssetId]: 'bitcoin',
  [ethAssetId]: 'ethereum',
  [flipAssetId]: 'chainflip',
  [usdcAssetId]: 'usd-coin',
  [usdtAssetId]: 'tether',
  [arbitrumAssetId]: 'ethereum',
  [usdcOnArbitrumOneAssetId]: 'usd-coin',
  [solAssetId]: 'solana',
  [usdcOnSolanaAssetId]: 'usd-coin',
}

export const findByAssetId = async (assetId: string): Promise<MarketData | null> => {
  const coingeckoId = ASSET_ID_TO_COINGECKO_ID[assetId]
  if (!coingeckoId) return null

  try {
    const { data } = await axios.get<CoinGeckoAssetData>(
      `${COINGECKO_BASE_URL}/coins/${coingeckoId}`,
    )

    const marketData = data?.market_data
    if (!marketData) return null

    return {
      price: marketData.current_price?.['usd']?.toString() ?? '0',
      marketCap: marketData.market_cap?.['usd']?.toString() ?? '0',
      volume: marketData.total_volume?.['usd']?.toString(),
      changePercent24Hr: marketData.price_change_percentage_24h,
      supply: marketData.circulating_supply.toString(),
      maxSupply: marketData.max_supply?.toString() ?? marketData.total_supply?.toString(),
    }
  } catch (e) {
    console.warn(e)
    throw new Error('CoinGeckoMarketService(findByAssetId): error fetching market data')
  }
}

export const useMarketDataByAssetIdQuery = (assetId: string) => {
  return useQuery({
    ...reactQueries.marketData.byAssetId(assetId),
  })
}
