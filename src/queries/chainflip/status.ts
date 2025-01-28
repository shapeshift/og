import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import type { ChainflipStatusResponse } from './types'

const CHAINFLIP_API_URL = import.meta.env.VITE_CHAINFLIP_API_URL
const CHAINFLIP_API_KEY = import.meta.env.VITE_CHAINFLIP_API_KEY

type ChainflipStatusQueryParams = {
  swapId: number
  enabled?: boolean
}

export const useChainflipStatusQuery = ({ swapId, enabled = true }: ChainflipStatusQueryParams) => {
  return useQuery({
    queryKey: ['chainflip', 'status', swapId],
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
    refetchInterval: 15000,
    enabled,
  })
}

