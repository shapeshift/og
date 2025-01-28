import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import type { ChainflipSwapParams, ChainflipSwapResponse } from './types'

const CHAINFLIP_API_URL = import.meta.env.VITE_CHAINFLIP_API_URL
const CHAINFLIP_API_KEY = import.meta.env.VITE_CHAINFLIP_API_KEY

export const useChainflipSwapQuery = (params: ChainflipSwapParams) => {
  return useQuery({
    queryKey: ['chainflip', 'swap', params],
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
  })
}
