import { btcChainId } from '@shapeshiftoss/caip'
import { PublicKey } from '@solana/web3.js'
import { solanaChainId } from 'constants/caip'
import debounce from 'lodash/debounce'
import WAValidator from 'multicoin-address-validator'
import { isAddress } from 'viem'

import { isEvmChainId } from './utils'

const validateAddressSync = (address: string, chainId: string): boolean => {
  console.log('validateAddress called:', { address, chainId })
  if (!address) {
    console.log('Empty address, returning true')
    return true
  }

  try {
    if (isEvmChainId(chainId)) {
      const isValid = isAddress(address)
      console.log('EVM validation result:', { isValid })
      return isValid
    }

    switch (chainId.toLowerCase()) {
      case solanaChainId:
        try {
          new PublicKey(address)
          console.log('Solana validation: valid')
          return true
        } catch {
          console.log('Solana validation: invalid')
          return false
        }
      case btcChainId:
        const isValid = WAValidator.validate(address, 'BTC')
        console.log('BTC validation result:', { isValid })
        return isValid
      default:
        console.log('Unsupported chain:', chainId)
        return false
    }
  } catch (e) {
    console.error('Validation error:', e)
    return false
  }
}

// Create a debounced version that returns a Promise
const debouncedValidateAddress = debounce(
  (address: string, chainId: string, callback: (result: boolean) => void) => {
    const result = validateAddressSync(address, chainId)
    callback(result)
  },
  300
)

// Wrapper function to handle the Promise interface
export const validateAddress = async (address: string, chainId: string): Promise<boolean> => {
  return new Promise(resolve => {
    debouncedValidateAddress(address, chainId, resolve)
  })
}
