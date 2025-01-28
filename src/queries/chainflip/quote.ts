import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import type { ChainflipQuote, ChainflipQuoteParams } from './types'

const CHAINFLIP_API_URL = import.meta.env.VITE_CHAINFLIP_API_URL
const CHAINFLIP_API_KEY = import.meta.env.VITE_CHAINFLIP_API_KEY

export const useChainflipQuoteQuery = (params: ChainflipQuoteParams) => {
  const { sourceAsset, destinationAsset, amount, commissionBps } = params

  return useQuery({
    queryKey: ['chainflip', 'quote', params],
    queryFn: async () => {
      const { data } = await axios.get<ChainflipQuote[]>(`${CHAINFLIP_API_URL}/quotes-native`, {
        params: {
          apiKey: CHAINFLIP_API_KEY,
          sourceAsset,
          destinationAsset,
          amount,
          ...(commissionBps && { commissionBps }),
        },
      })

      // TODO(gomes): select best quote based on output amount, since o.g doesn't support multiple quotes
      return data[0]
    },
  })
}

