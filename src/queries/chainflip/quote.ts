import { skipToken, useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'
import { bnOrZero } from 'lib/bignumber/bignumber'

import { reactQueries } from '../react-queries'
import type { ChainflipQuote, ChainflipQuoteError, ChainflipQuoteParams } from './types'

type QuoteQueryKey = readonly ['chainflip', 'quote', ChainflipQuoteParams]

export const useChainflipQuoteQuery = ({
  sourceAsset,
  destinationAsset,
  amount,
  commissionBps,
}: ChainflipQuoteParams) => {
  const { queryKey, queryFn } = reactQueries.chainflip.quote({
    sourceAsset,
    destinationAsset,
    amount,
    commissionBps,
  })

  return useQuery<ChainflipQuote, AxiosError<ChainflipQuoteError>, ChainflipQuote, QuoteQueryKey>({
    queryKey,
    queryFn: sourceAsset && destinationAsset && bnOrZero(amount).gt(0) ? queryFn : skipToken,
    retry: false,
  })
}
