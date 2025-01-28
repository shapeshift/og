import axios from 'axios'
import { btcAssetId, ethAssetId } from 'constants/caip'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { findByAssetId } from '.'

vi.mock('axios')

describe('coingecko queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('findByAssetId', () => {
    it('should return market data for ETH', async () => {
      const result = {
        price: '3611.19',
        marketCap: '424970837706',
        changePercent24Hr: 2.19682,
        volume: '21999495657',
        supply: '120839129.44',
      }

      const market_data = {
        current_price: {
          usd: Number(result.price),
        },
        market_cap: {
          usd: Number(result.marketCap),
        },
        price_change_percentage_24h: result.changePercent24Hr,
        total_volume: {
          usd: Number(result.volume),
        },
        circulating_supply: Number(result.supply),
        max_supply: null,
        total_supply: null,
      }

      vi.mocked(axios.get).mockResolvedValue({ data: { market_data } })
      expect(await findByAssetId(ethAssetId)).toEqual(result)
    })

    it('should return market data with maxSupply for BTC', async () => {
      const result = {
        price: '54810',
        marketCap: '1032270421549',
        changePercent24Hr: -0.33384,
        volume: '38267223547',
        supply: '18840237',
        maxSupply: '21000000',
      }

      const market_data = {
        current_price: {
          usd: Number(result.price),
        },
        market_cap: {
          usd: Number(result.marketCap),
        },
        price_change_percentage_24h: result.changePercent24Hr,
        total_volume: {
          usd: Number(result.volume),
        },
        circulating_supply: Number(result.supply),
        max_supply: Number(result.maxSupply),
        total_supply: Number(result.maxSupply),
      }

      vi.mocked(axios.get).mockResolvedValue({ data: { market_data } })
      expect(await findByAssetId(btcAssetId)).toEqual(result)
    })

    it('should return null if asset not found on coingecko', async () => {
      const result = await findByAssetId('invalid-asset-id')
      expect(result).toBeNull()
    })

    it('should throw on network error', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error())
      await expect(findByAssetId(ethAssetId)).rejects.toThrow(
        'CoinGeckoMarketService(findByAssetId): error fetching market data',
      )
    })

    it('should return null if market data is missing', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: {} })
      const result = await findByAssetId(ethAssetId)
      expect(result).toBeNull()
    })

    it('should handle missing optional fields', async () => {
      const result = {
        price: '0',
        marketCap: '0',
        changePercent24Hr: 0,
        supply: '0',
      }

      const market_data = {
        current_price: {},
        market_cap: {},
        price_change_percentage_24h: 0,
        circulating_supply: 0,
      }

      vi.mocked(axios.get).mockResolvedValue({ data: { market_data } })
      expect(await findByAssetId(ethAssetId)).toEqual(result)
    })
  })
})
