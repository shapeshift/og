import { btcChainId } from '@shapeshiftoss/caip'
import { PublicKey } from '@solana/web3.js'
import { solanaChainId } from 'constants/caip'
import debounce from 'lodash/debounce'
import WAValidator from 'multicoin-address-validator'
import { isAddress } from 'viem'

import { isEvmChainId } from './utils'

const validateAddressSync = (address: string, chainId: string): boolean => {
  if (!address) {
    return true
  }

  try {
    if (isEvmChainId(chainId)) {
      const isValid = isAddress(address)
      return isValid
    }

    switch (chainId.toLowerCase()) {
      case solanaChainId:
        try {
          new PublicKey(address)
          return true
        } catch {
          return false
        }
      case btcChainId: {
        const isValid = WAValidator.validate(address, 'BTC')
        return isValid
      }
      default:
        console.log('Unsupported chain:', chainId)
        return false
    }
  } catch (e) {
    console.error('Validation error:', e)
    return false
  }
}

const debouncedValidateAddress = debounce(
  (address: string, chainId: string, callback: (result: boolean) => void) => {
    const result = validateAddressSync(address, chainId)
    callback(result)
  },
  500,
)

export const validateAddress = (address: string, chainId: string): Promise<boolean> =>
  new Promise(resolve => {
    debouncedValidateAddress(address, chainId, resolve)
  })
