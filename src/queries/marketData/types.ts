export type CoinGeckoMarketData = {
  current_price: Record<string, number>
  market_cap: Record<string, number>
  total_volume?: Record<string, number>
  high_24h?: Record<string, number>
  low_24h?: Record<string, number>
  circulating_supply: number
  total_supply?: number
  max_supply: number
  price_change_percentage_24h: number
}

export type CoinGeckoAssetData = {
  market_data: CoinGeckoMarketData
}

export type MarketData = {
  price: string
  marketCap: string
  volume?: string
  changePercent24Hr: number
  supply: string
  maxSupply?: string
}
