import { btcChainId, ethChainId, solanaChainId, tronChainId } from 'constants/caip'
import { describe, expect, it } from 'vitest'

import { isValidAddressSync } from './validation'

describe('isValidAddressSync', () => {
  it('treats an empty address as valid (nothing entered yet)', () => {
    expect(isValidAddressSync('', ethChainId)).toBe(true)
    expect(isValidAddressSync('', tronChainId)).toBe(true)
  })

  it('returns false for an unsupported chain', () => {
    expect(isValidAddressSync('anything', 'cosmos:cosmoshub-4')).toBe(false)
  })

  describe('evm', () => {
    it('accepts a valid checksummed address', () => {
      expect(isValidAddressSync('0xdAC17F958D2ee523a2206206994597C13D831ec7', ethChainId)).toBe(
        true,
      )
    })

    it('rejects malformed addresses', () => {
      expect(isValidAddressSync('0x123', ethChainId)).toBe(false)
      expect(isValidAddressSync('not-an-address', ethChainId)).toBe(false)
    })
  })

  describe('solana', () => {
    it('accepts a valid base58 pubkey', () => {
      expect(isValidAddressSync('So11111111111111111111111111111111111111112', solanaChainId)).toBe(
        true,
      )
    })

    it('rejects malformed addresses', () => {
      expect(isValidAddressSync('not-an-address', solanaChainId)).toBe(false)
    })
  })

  describe('bitcoin', () => {
    it('accepts a valid address', () => {
      expect(isValidAddressSync('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', btcChainId)).toBe(true)
    })

    it('rejects malformed addresses', () => {
      expect(isValidAddressSync('not-an-address', btcChainId)).toBe(false)
    })
  })

  describe('tron', () => {
    it('accepts valid base58 addresses', () => {
      expect(isValidAddressSync('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', tronChainId)).toBe(true)
      expect(isValidAddressSync('TLa2f6VPqDgRE67v1736s7bJ8Ray5wYjU7', tronChainId)).toBe(true)
    })

    it('rejects malformed addresses', () => {
      expect(isValidAddressSync('not-an-address', tronChainId)).toBe(false)
    })

    it('rejects an evm address on the tron chain', () => {
      expect(isValidAddressSync('0xdAC17F958D2ee523a2206206994597C13D831ec7', tronChainId)).toBe(
        false,
      )
    })
  })
})
