// Subset of web caip constants with Chainfli-supported assets only
// We need to redeclare things here as @shapeshiftoss/caip is actually a monorepo project and not published on npm

import type { AssetId, ChainId } from '@shapeshiftoss/caip'

export const btcAssetId: AssetId = 'bip122:000000000019d6689c085ae165831e93/slip44:0'

export const ethAssetId: AssetId = 'eip155:1/slip44:60'
export const arbitrumAssetId: AssetId = 'eip155:42161/slip44:60'
export const solAssetId: AssetId = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501'
export const wrappedSolAssetId: AssetId =
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:So11111111111111111111111111111111111111112'
export const usdtAssetId: AssetId = 'eip155:1/erc20:0xdac17f958d2ee523a2206206994597c13d831ec7'
export const usdcAssetId: AssetId = 'eip155:1/erc20:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
export const usdcOnArbitrumOneAssetId: AssetId =
  'eip155:42161/erc20:0xaf88d065e77c8cc2239327c5edb3a432268e5831'
export const usdcOnSolanaAssetId: AssetId =
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const flipAssetId: AssetId = 'eip155:1/erc20:0x826180541412d574cf1336d22c0c0a287822678a'

export const btcChainId: ChainId = 'bip122:000000000019d6689c085ae165831e93'

export const ethChainId: ChainId = 'eip155:1'
export const arbitrumChainId: ChainId = 'eip155:42161'
export const baseChainId: ChainId = 'eip155:8453'

export const solanaChainId: ChainId = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'

export const CHAIN_NAMESPACE = {
  Evm: 'eip155',
  Utxo: 'bip122',
  CosmosSdk: 'cosmos',
  Solana: 'solana',
} as const

export const CHAIN_REFERENCE = {
  EthereumMainnet: '1',
  BitcoinMainnet: '000000000019d6689c085ae165831e93',
  ArbitrumMainnet: '42161', // https://chainlist.org/chain/42161
  ArbitrumNovaMainnet: '42170', // https://chainlist.org/chain/42170
  BaseMainnet: '8453', // https://chainlist.org/chain/8453
  SolanaMainnet: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp', // https://namespaces.chainagnostic.org/solana/caip2
} as const

export const ASSET_NAMESPACE = {
  erc20: 'erc20',
  erc721: 'erc721',
  erc1155: 'erc1155',
  slip44: 'slip44',
  ibc: 'ibc',
  splToken: 'token',
} as const

export const ASSET_REFERENCE = {
  Bitcoin: '0',
  Ethereum: '60',
  Arbitrum: '60', // evm chain which uses ethereum derivation path as common practice
  Solana: '501',
} as const

// We should prob change this once we add more chains
export const FEE_ASSET_IDS = [ethAssetId, btcAssetId, arbitrumAssetId, solAssetId]
