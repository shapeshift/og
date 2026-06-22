// Chainflip-supported caip constants, grouped by chain (chainId, then native asset, then tokens).

import type { AssetId, ChainId } from '@shapeshiftoss/caip'

// Bitcoin
export const btcChainId: ChainId = 'bip122:000000000019d6689c085ae165831e93'
export const btcAssetId: AssetId = 'bip122:000000000019d6689c085ae165831e93/slip44:0'

// Ethereum
export const ethChainId: ChainId = 'eip155:1'
export const ethAssetId: AssetId = 'eip155:1/slip44:60'
export const usdcAssetId: AssetId = 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const usdtAssetId: AssetId = 'eip155:1/erc20:0xdac17f958d2ee523a2206206994597c13d831ec7'
export const flipAssetId: AssetId = 'eip155:1/erc20:0x826180541412d574cf1336d22c0c0a287822678a'

// Arbitrum
export const arbitrumChainId: ChainId = 'eip155:42161'
export const arbitrumAssetId: AssetId = 'eip155:42161/slip44:60'
export const usdcOnArbitrumOneAssetId: AssetId =
  'eip155:42161/erc20:0xaf88d065e77c8cc2239327c5edb3a432268e5831'

// Base
export const baseChainId: ChainId = 'eip155:8453'

// Solana
export const solanaChainId: ChainId = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
export const solAssetId: AssetId = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501'
export const wrappedSolAssetId: AssetId =
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:So11111111111111111111111111111111111111112'
export const usdcOnSolanaAssetId: AssetId =
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

// Tron
export const tronChainId: ChainId = 'tron:0x2b6653dc'
export const trxAssetId: AssetId = 'tron:0x2b6653dc/slip44:195'
export const usdtOnTronAssetId: AssetId = 'tron:0x2b6653dc/trc20:TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t'
