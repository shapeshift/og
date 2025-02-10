import type { inferQueryKeyStore } from '@lukemorales/query-key-factory'
import { createMutationKeys, createQueryKeyStore } from '@lukemorales/query-key-factory'
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
const CHAINFLIP_COMMISSION_BPS = import.meta.env.VITE_CHAINFLIP_COMMISSION_BPS

const createSwap = async (params: ChainflipSwapParams): Promise<ChainflipSwapResponse> => {
  const { data } = await axios.get<ChainflipSwapResponse>(`${CHAINFLIP_API_URL}/swap`, {
    params: {
      apiKey: CHAINFLIP_API_KEY,
      ...params,
      boostFee: params.maxBoostFee ?? 0,
      retryDurationInBlocks: params.retryDurationInBlocks ?? 150,
      commissionBps: CHAINFLIP_COMMISSION_BPS,
    },
  })
  return data
}

export const reactMutations = createMutationKeys('chainflip', {
  swap: {
    mutationKey: null,
    mutationFn: createSwap,
  },
})

export const reactQueries = createQueryKeyStore({
  chainflip: {
    assets: {
      queryKey: null,
      queryFn: async () => {
        const { data } = await axios.get<ChainflipAssetsResponse>(`${CHAINFLIP_API_URL}/assets`, {
          params: {
            apiKey: CHAINFLIP_API_KEY,
          },
        })
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
            commissionBps: CHAINFLIP_COMMISSION_BPS,
          },
        })
        return data[0]
      },
      enabled: Boolean(params.sourceAsset && params.destinationAsset && params.amount),
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
