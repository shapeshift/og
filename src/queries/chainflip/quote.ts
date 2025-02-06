import type { UseQueryOptions } from '@tanstack/react-query'
import { useQuery } from '@tanstack/react-query'

import { reactQueries } from '../react-queries'
import type { ChainflipQuote, ChainflipQuoteParams } from './types'

type QuoteQueryKey = readonly ['chainflip', 'quote', ChainflipQuoteParams]

export const useChainflipQuoteQuery = (
  params: ChainflipQuoteParams,
  options?: Omit<
    UseQueryOptions<ChainflipQuote, Error, ChainflipQuote, QuoteQueryKey>,
    'queryKey' | 'queryFn'
  >,
) => {
  const query = reactQueries.chainflip.quote(params)
  return useQuery<ChainflipQuote, Error, ChainflipQuote, QuoteQueryKey>({
    ...query,
    ...options,
  })
}
