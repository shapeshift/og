import { skipToken, useQuery, type UseQueryOptions } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { bnOrZero } from 'lib/bignumber/bignumber'

import { reactQueries } from '../react-queries'
import type { ChainflipQuote, ChainflipQuoteError, ChainflipQuoteParams } from './types'

type QuoteQueryKey = readonly ['chainflip', 'quote', ChainflipQuoteParams]

export const useChainflipQuoteQuery = (
  params: ChainflipQuoteParams,
  options?: Omit<UseQueryOptions<ChainflipQuote, AxiosError<ChainflipQuoteError>, ChainflipQuote, QuoteQueryKey>, 'queryKey' | 'queryFn'>
) => {
  const { queryKey, queryFn } = reactQueries.chainflip.quote(params)

  return useQuery<ChainflipQuote, AxiosError<ChainflipQuoteError>, ChainflipQuote, QuoteQueryKey>({
    queryKey,
    queryFn: params.sourceAsset && params.destinationAsset && bnOrZero(params.amount).gt(0) ? queryFn : skipToken,
    retry: false,
    ...options
  })
}
