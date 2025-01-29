import { useQuery } from '@tanstack/react-query'

import { reactQueries } from '../react-queries'
import type { ChainflipSwapParams } from './types'

export const useChainflipSwapQuery = (params: ChainflipSwapParams) => {
  return useQuery({
    ...reactQueries.chainflip.swap(params),
  })
}
