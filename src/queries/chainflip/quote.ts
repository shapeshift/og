import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { reactQueries } from '../react-queries'
import type { ChainflipQuote, ChainflipQuoteParams } from './types'

export const useChainflipQuoteQuery = (
  params: ChainflipQuoteParams,
  options?: Omit<UseQueryOptions<ChainflipQuote>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    ...reactQueries.chainflip.quote(params),
    ...options,
  })
}
