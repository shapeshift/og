import { fromChainId } from '@shapeshiftoss/caip'
export const getFeatureFlag = (flagName: string): boolean => {
  const envVarName = `VITE_FEATURE_${flagName.toUpperCase()}`
  return import.meta.env[envVarName] === 'true'
}
export const middleEllipsis = (value: string): string =>
  value.length >= 12 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value

export const isEvmChainId = (chainId: string): boolean =>
  fromChainId(chainId).chainNamespace === 'eip155'
