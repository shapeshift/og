import type { AssetId } from '@shapeshiftoss/caip'
import { fromChainId } from '@shapeshiftoss/caip'
import { isAddress } from 'viem'

export const getFeatureFlag = (flagName: string): boolean => {
  const envVarName = `VITE_FEATURE_${flagName.toUpperCase()}`
  return import.meta.env[envVarName] === 'true'
}

export const middleEllipsis = (value: string): string =>
  value.length >= 12 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value

export const isEthAddress = (address: string): boolean => isAddress(address)

export const isNft = (assetId: AssetId): boolean => {
  const slashIdx = assetId.indexOf('/')
  const assetParts = assetId.substring(slashIdx + 1)
  const idx = assetParts.indexOf(':')
  const assetNamespace = assetParts.substring(0, idx)
  return ['erc721', 'erc1155', 'bep721', 'bep1155'].includes(assetNamespace)
}

export const isEvmChainId = (chainId: string): boolean =>
  fromChainId(chainId).chainNamespace === 'eip155'
