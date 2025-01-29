import type { inferQueryKeyStore } from '@lukemorales/query-key-factory'
import { createQueryKeyStore } from '@lukemorales/query-key-factory'
import axios from 'axios'

import type {
  ChainflipAssetsResponse,
  ChainflipQuote,
  ChainflipQuoteParams,
  ChainflipStatusResponse,
  ChainflipSwapParams,
  ChainflipSwapResponse,
} from './chainflip/types'
import { findByAssetId } from './marketData'

const CHAINFLIP_API_URL = import.meta.env.VITE_CHAINFLIP_API_URL
const CHAINFLIP_API_KEY = import.meta.env.VITE_CHAINFLIP_API_KEY

export const reactQueries = createQueryKeyStore({
  chainflip: {
    assets: {
      queryKey: null,
      queryFn: async () => {
        const { data } = await axios.get<ChainflipAssetsResponse>(`${CHAINFLIP_API_URL}/assets`)
        return data
      },
    },
    quote: (params: ChainflipQuoteParams) => ({
      queryKey: [params],
      queryFn: async () => {
        const { data } = await axios.get<ChainflipQuote[]>(`${CHAINFLIP_API_URL}/quotes-native`, {
          params: {
            apiKey: CHAINFLIP_API_KEY,
            sourceAsset: params.sourceAsset,
            destinationAsset: params.destinationAsset,
            amount: params.amount,
            ...(params.commissionBps && { commissionBps: params.commissionBps }),
          },
        })
        return data[0]
      },
    }),
    swap: (params: ChainflipSwapParams) => ({
      queryKey: [params],
      queryFn: async () => {
        const { data } = await axios.get<ChainflipSwapResponse>(`${CHAINFLIP_API_URL}/swap`, {
          params: {
            apiKey: CHAINFLIP_API_KEY,
            ...params,
            boostFee: params.maxBoostFee ?? 0,
            retryDurationInBlocks: params.retryDurationInBlocks ?? 150,
          },
        })
        return data
      },
    }),
    status: (swapId: number) => ({
      queryKey: [swapId],
      queryFn: async () => {
        const { data } = await axios.get<ChainflipStatusResponse>(
          `${CHAINFLIP_API_URL}/status-by-id`,
          {
            params: {
              apiKey: CHAINFLIP_API_KEY,
              swapId,
            },
          },
        )
        return data
      },
    }),
  },
  marketData: {
    byAssetId: (assetId: string) => ({
      queryKey: [assetId],
      queryFn: () => findByAssetId(assetId),
    }),
  },
})

export type QueryKeys = inferQueryKeyStore<typeof reactQueries>
