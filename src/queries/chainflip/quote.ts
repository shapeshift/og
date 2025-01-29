import { useQuery } from '@tanstack/react-query'

import { reactQueries } from '../react-queries'
import type { ChainflipQuoteParams } from './types'

export const useChainflipQuoteQuery = (params: ChainflipQuoteParams) => {
  return useQuery({
    ...reactQueries.chainflip.quote(params),
  })
}
