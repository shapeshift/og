import { btcAssetId, ethAssetId } from 'constants/caip'
import { afterEach, describe, expect, it } from 'vitest'

import type { SwapSession } from './swapSession'
import { getSwapSession, getSwapSessionMismatches, saveSwapSession } from './swapSession'

const session: SwapSession = {
  swapId: 1234,
  channelId: 56,
  depositAddress: '0x1111111111111111111111111111111111111111',
  sellAssetId: ethAssetId,
  buyAssetId: btcAssetId,
  sellAmountCryptoBaseUnit: '1000000000000000000',
  destinationAddress: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  refundAddress: '0x2222222222222222222222222222222222222222',
}

const matchingStatus = {
  sourceAsset: 'eth.eth',
  destinationAsset: 'btc.btc',
  destinationAddress: session.destinationAddress,
}

afterEach(() => {
  window.sessionStorage.clear()
})

describe('swap session storage', () => {
  it('round-trips a saved swap by swapId', () => {
    saveSwapSession(session)
    expect(getSwapSession('1234')).toEqual(session)
  })

  it('returns nothing for a swap this tab did not create', () => {
    saveSwapSession(session)
    expect(getSwapSession('9999')).toBeUndefined()
  })

  it('rejects missing or non-numeric swap ids', () => {
    saveSwapSession(session)
    expect(getSwapSession(null)).toBeUndefined()
    expect(getSwapSession('')).toBeUndefined()
    expect(getSwapSession('1234abc')).toBeUndefined()
  })

  it('rejects malformed or mismatched stored entries', () => {
    window.sessionStorage.setItem('og:swap:1', 'not json')
    expect(getSwapSession('1')).toBeUndefined()

    window.sessionStorage.setItem('og:swap:2', JSON.stringify({ ...session, depositAddress: '' }))
    expect(getSwapSession('2')).toBeUndefined()

    window.sessionStorage.setItem('og:swap:3', JSON.stringify({ ...session, swapId: 4 }))
    expect(getSwapSession('3')).toBeUndefined()
  })
})

describe('getSwapSessionMismatches', () => {
  it('accepts a broker status that matches the stored swap', () => {
    expect(getSwapSessionMismatches(session, matchingStatus)).toEqual([])
  })

  it('ignores case differences in asset ids and EVM addresses only', () => {
    const evmSession = { ...session, sellAssetId: btcAssetId, buyAssetId: ethAssetId }
    const lower = '0xdac17f958d2ee523a2206206994597c13d831ec7'
    const checksummed = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
    expect(
      getSwapSessionMismatches(
        { ...evmSession, destinationAddress: lower },
        { sourceAsset: 'BTC.BTC', destinationAsset: 'ETH.ETH', destinationAddress: checksummed },
      ),
    ).toEqual([])

    expect(
      getSwapSessionMismatches(session, {
        ...matchingStatus,
        destinationAddress: session.destinationAddress.toUpperCase(),
      }),
    ).toEqual(['destinationAddress'])
  })

  it('flags a different destination address', () => {
    expect(
      getSwapSessionMismatches(session, {
        ...matchingStatus,
        destinationAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      }),
    ).toEqual(['destinationAddress'])
  })

  it('flags different assets', () => {
    expect(
      getSwapSessionMismatches(session, {
        ...matchingStatus,
        sourceAsset: 'usdc.eth',
        destinationAsset: 'sol.sol',
      }),
    ).toEqual(['sourceAsset', 'destinationAsset'])
  })

  it('treats missing broker fields as a mismatch', () => {
    expect(
      getSwapSessionMismatches(session, {
        sourceAsset: '',
        destinationAsset: '',
        destinationAddress: '',
      }),
    ).toEqual(['sourceAsset', 'destinationAsset', 'destinationAddress'])
  })
})
