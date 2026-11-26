import { ChakraProvider } from '@chakra-ui/react'
import { btcAssetId, ethAssetId, solAssetId } from 'constants/caip'
import type {
  ChainflipQuote,
  ChainflipSwapParams,
  ChainflipSwapResponse,
} from 'queries/chainflip/types'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import type { UseFormReturn } from 'react-hook-form'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getSwapSession } from 'lib/swapSession'
import type { SwapFormData } from 'types/form'

import { TradeInput } from './TradeInput'

type MutateOptions = {
  onSuccess?: (data: ChainflipSwapResponse, variables: ChainflipSwapParams) => void
}

const swapMutation = vi.hoisted(() => ({
  calls: [] as { variables: unknown; options?: unknown }[],
}))

vi.mock('queries/chainflip/swap', () => ({
  useChainflipSwapMutation: () => ({
    mutate: (variables: unknown, options?: unknown) =>
      swapMutation.calls.push({ variables, options }),
    isPending: false,
  }),
}))
vi.mock('queries/chainflip/quote', () => ({
  useChainflipQuoteQuery: () => ({
    data: {
      egressAmountNative: '5000000',
      recommendedSlippageTolerancePercent: 1,
      estimatedDurationSeconds: 60,
    } as Partial<ChainflipQuote>,
    isFetching: false,
    error: null,
  }),
}))
vi.mock('queries/marketData', () => ({
  useMarketDataByAssetIdQuery: () => ({ data: undefined }),
}))
vi.mock('lib/mixpanel', () => ({
  mixpanel: undefined,
  MixPanelEvent: {},
}))
vi.mock('lib/validation', () => ({
  isValidAddress: () => Promise.resolve(true),
}))
vi.mock('./AssetSelectModal/AssetSelectModal', () => ({ AssetSelectModal: () => null }))
vi.mock('./QrCodeScanner', () => ({ QrCodeScanner: () => null }))
vi.mock('./CountdownSpinner/CountdownSpinner', () => ({ CountdownSpinner: () => null }))

const defaultValues: SwapFormData = {
  sellAssetId: ethAssetId,
  buyAssetId: btcAssetId,
  sellAmountCryptoBaseUnit: '1000000000000000000',
  destinationAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  refundAddress: '0x2222222222222222222222222222222222222222',
}

let container: HTMLDivElement
let root: Root
let form: UseFormReturn<SwapFormData> | undefined

const Harness = () => {
  const methods = useForm<SwapFormData>({ defaultValues, mode: 'onChange' })
  form = methods
  return (
    <FormProvider {...methods}>
      <TradeInput />
    </FormProvider>
  )
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  swapMutation.calls = []
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  window.sessionStorage.clear()
})

describe('TradeInput', () => {
  it('saves the swap session from the submitted values, not the form at completion', async () => {
    await act(() => {
      root.render(
        <ChakraProvider>
          <MemoryRouter>
            <Harness />
          </MemoryRouter>
        </ChakraProvider>,
      )
      return Promise.resolve()
    })

    const formElement = container.querySelector('form')
    expect(formElement).not.toBeNull()
    act(() => {
      formElement?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    })
    expect(swapMutation.calls).toHaveLength(1)

    // The form changes while the request is still pending
    act(() => {
      form?.setValue('sellAssetId', solAssetId)
      form?.setValue('sellAmountCryptoBaseUnit', '123')
    })

    const { variables, options } = swapMutation.calls[0] as {
      variables: ChainflipSwapParams
      options: MutateOptions
    }
    act(() => {
      options.onSuccess?.(
        {
          id: 42,
          channelId: 7,
          address: '0x1111111111111111111111111111111111111111',
        } as ChainflipSwapResponse,
        variables,
      )
    })

    expect(getSwapSession('42')).toEqual({
      swapId: 42,
      channelId: 7,
      depositAddress: '0x1111111111111111111111111111111111111111',
      sellAssetId: ethAssetId,
      buyAssetId: btcAssetId,
      sellAmountCryptoBaseUnit: defaultValues.sellAmountCryptoBaseUnit,
      destinationAddress: defaultValues.destinationAddress,
      refundAddress: defaultValues.refundAddress,
    })
  })
})
