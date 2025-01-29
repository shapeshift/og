import { useQuery } from '@tanstack/react-query'

import { reactQueries } from '../react-queries'

type ChainflipStatusQueryParams = {
  swapId: number
  enabled?: boolean
}

export const useChainflipStatusQuery = ({ swapId, enabled = true }: ChainflipStatusQueryParams) => {
  return useQuery({
    ...reactQueries.chainflip.status(swapId),
    refetchInterval: 15000,
    enabled,
  })
}
