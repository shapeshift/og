import { btcAssetId, ethAssetId, usdcOnSolanaAssetId } from 'constants/caip'
import { describe, expect, it } from 'vitest'

import { transformChainflipAssets } from './assets'
import type { ChainflipAssetsResponse } from './types'

describe('transformChainflipAssets', () => {
  it('should transform multiple chainflip assets to assetIds', () => {
    const mockResponse: ChainflipAssetsResponse = {
      assets: [
        {
          id: 'btc.btc',
          direction: 'both',
          ticker: 'BTC',
          name: 'Bitcoin',
          network: 'Bitcoin',
          networkLogo: '/networks/btc/logo.svg',
          assetLogo: '/assets/btc.btc/logo.svg',
          decimals: 8,
          minimalAmount: 0.0007,
          minimalAmountNative: '70000',
          usdPrice: 102680.1024594243,
          usdPriceNative: '102680102459',
        },
        {
          id: 'eth.eth',
          direction: 'both',
          ticker: 'ETH',
          name: 'Ethereum',
          network: 'Ethereum',
          networkLogo: '/networks/eth/logo.svg',
          assetLogo: '/assets/eth.eth/logo.svg',
          decimals: 18,
          minimalAmount: 0.01,
          minimalAmountNative: '10000000000000000',
          usdPrice: 3175.43595522135,
          usdPriceNative: '3175435955',
        },
      ],
    }

    expect(transformChainflipAssets(mockResponse)).toEqual([btcAssetId, ethAssetId])
  })

  it('should transform single chainflip asset to assetId', () => {
    const mockResponse: ChainflipAssetsResponse = {
      assets: [
        {
          id: 'usdc.sol',
          direction: 'both',
          ticker: 'USDC',
          name: 'solUSDC',
          network: 'Solana',
          contractAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          networkLogo: '/networks/sol/logo.svg',
          assetLogo: '/assets/usdc.sol/logo.svg',
          decimals: 6,
          minimalAmount: 10,
          minimalAmountNative: '10000000',
          usdPrice: 1.0014781977,
          usdPriceNative: '1001478',
        },
      ],
    }

    expect(transformChainflipAssets(mockResponse)).toEqual([usdcOnSolanaAssetId])
  })

  it('should return empty array for unsupported assets', () => {
    const mockResponse: ChainflipAssetsResponse = {
      assets: [
        {
          id: 'unsupported.asset',
          direction: 'both',
          ticker: 'UNSUPPORTED',
          name: 'Unsupported Asset',
          network: 'Unknown',
          networkLogo: '/networks/unknown/logo.svg',
          assetLogo: '/assets/unknown.asset/logo.svg',
          decimals: 18,
          minimalAmount: 1,
          minimalAmountNative: '1000000000000000000',
          usdPrice: 1,
          usdPriceNative: '1000000000000000000',
        },
      ],
    }

    expect(transformChainflipAssets(mockResponse)).toEqual([])
  })
})
