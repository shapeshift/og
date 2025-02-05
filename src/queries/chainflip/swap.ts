import { useMutation, type UseMutationOptions } from '@tanstack/react-query'

import { createSwap } from '../react-queries'
import type { ChainflipSwapParams, ChainflipSwapResponse } from './types'

export const useChainflipSwapMutation = (
  options?: UseMutationOptions<ChainflipSwapResponse, Error, ChainflipSwapParams>
) => {
  return useMutation<ChainflipSwapResponse, Error, ChainflipSwapParams>({
    mutationFn: createSwap,
    ...options,
  })
}
