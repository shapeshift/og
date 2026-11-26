import { ChakraProvider } from '@chakra-ui/react'
import { btcAssetId, ethAssetId } from 'constants/caip'
import type { ChainflipStatusResponse } from 'queries/chainflip/types'
import type { Root } from 'react-dom/client'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SwapSession } from 'lib/swapSession'
import { saveSwapSession } from 'lib/swapSession'

import { Status } from './Status'

const statusQuery = vi.hoisted(() => ({
  data: undefined as ChainflipStatusResponse | undefined,
}))

vi.mock('queries/chainflip/status', () => ({
  useChainflipStatusQuery: () => ({ data: statusQuery.data, isLoading: false }),
}))
vi.mock('queries/chainflip/quote', () => ({
  useChainflipQuoteQuery: () => ({ data: undefined }),
}))
vi.mock('queries/marketData', () => ({
  useMarketDataByAssetIdQuery: () => ({ data: undefined }),
}))
vi.mock('lib/mixpanel', () => ({
  mixpanel: undefined,
  MixPanelEvent: {},
}))
vi.mock('components/QRCode/QRCode', () => ({
  QRCode: ({ content }: { content: string }) => <div data-testid='qr' data-content={content} />,
}))

const URL_DEPOSIT = 'bc1qurlsuppliedurlsuppliedurlsuppliedurlsupp0'
const URL_ADDRESS = '0x9999999999999999999999999999999999999999'

const session: SwapSession = {
  swapId: 42,
  channelId: 7,
  depositAddress: '0x1111111111111111111111111111111111111111',
  sellAssetId: ethAssetId,
  buyAssetId: btcAssetId,
  sellAmountCryptoBaseUnit: '1000000000000000000',
  destinationAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  refundAddress: '0x2222222222222222222222222222222222222222',
}

const makeStatus = (
  overrides: Partial<ChainflipStatusResponse['status']> = {},
): ChainflipStatusResponse => ({
  id: 42,
  status: {
    state: 'waiting',
    sourceAsset: 'eth.eth',
    destinationAsset: 'btc.btc',
    destinationAddress: session.destinationAddress,
    estimatedDurationSeconds: 60,
    fees: [],
    depositChannel: {
      id: '1-Ethereum-7',
      estimatedExpiryTime: new Date(Date.now() + 3_600_000).toISOString(),
      isExpired: false,
    },
    ...overrides,
  },
})

// Legacy status link params that should no longer be read from the URL
const legacyQuery = new URLSearchParams({
  swapId: '42',
  channelId: '666',
  depositAddress: URL_DEPOSIT,
  sellAssetId: btcAssetId,
  buyAssetId: ethAssetId,
  sellAmountCryptoBaseUnit: '100000000',
  destinationAddress: URL_ADDRESS,
  refundAddress: URL_ADDRESS,
}).toString()

let container: HTMLDivElement
let root: Root

const render = (search: string) => {
  const initialEntries = [`/status?${search}`]
  act(() => {
    root.render(
      <ChakraProvider>
        <MemoryRouter initialEntries={initialEntries}>
          <Status />
        </MemoryRouter>
      </ChakraProvider>,
    )
  })
}

beforeEach(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
  statusQuery.data = undefined
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
  window.sessionStorage.clear()
})

const qrContent = () => container.querySelector('[data-testid="qr"]')?.getAttribute('data-content')

describe('Status', () => {
  it('never renders a deposit address or addresses supplied in the URL', () => {
    statusQuery.data = makeStatus()
    render(legacyQuery)

    const text = container.textContent ?? ''
    expect(text).toContain('Deposit details unavailable')
    expect(container.innerHTML).not.toContain(URL_DEPOSIT)
    expect(container.innerHTML).not.toContain(URL_ADDRESS)
    expect(container.innerHTML).not.toContain('666')
    expect(qrContent()).toBeUndefined()
  })

  it('renders deposit details from the session state created by this tab, not the URL', () => {
    saveSwapSession(session)
    statusQuery.data = makeStatus()
    render(legacyQuery)

    expect(qrContent()).toBe(session.depositAddress)
    expect(container.innerHTML).not.toContain(URL_DEPOSIT)
    expect(container.innerHTML).not.toContain(URL_ADDRESS)
    expect(container.textContent).toContain('Channel ID:7')
  })

  it('refuses to show deposit details when the broker disagrees with the session', () => {
    saveSwapSession(session)
    statusQuery.data = makeStatus({ destinationAddress: URL_ADDRESS })
    render('swapId=42')

    expect(container.textContent).toContain('Swap details could not be verified')
    expect(qrContent()).toBeUndefined()
    expect(container.innerHTML).not.toContain(session.depositAddress)
  })

  it('shows an error for a missing or invalid swapId', () => {
    render(`swapId=abc&depositAddress=${URL_DEPOSIT}`)
    expect(container.textContent).toContain('Swap not found')
    expect(container.innerHTML).not.toContain(URL_DEPOSIT)
  })
})
