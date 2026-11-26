import { btcAssetId, ethAssetId, solAssetId } from 'constants/caip'
import { describe, expect, it } from 'vitest'

import {
  getFormDefaultsFromSearchParams,
  getFormValuesFromSearchParams,
  isUrlExcludedField,
} from './formUrlState'

const linkParams = new URLSearchParams({
  sellAssetId: solAssetId,
  buyAssetId: ethAssetId,
  sellAmountCryptoBaseUnit: '1000',
  destinationAddress: '0x1111111111111111111111111111111111111111',
  refundAddress: 'So11111111111111111111111111111111111111112',
  depositAddress: 'url-supplied',
  channelId: '1',
})

describe('form URL state', () => {
  it('never pre-fills address fields from the URL', () => {
    const defaults = getFormDefaultsFromSearchParams(linkParams)
    expect(defaults).not.toHaveProperty('destinationAddress')
    expect(defaults).not.toHaveProperty('refundAddress')

    const values = getFormValuesFromSearchParams(linkParams)
    expect(values).not.toHaveProperty('destinationAddress')
    expect(values).not.toHaveProperty('refundAddress')
    expect(values).not.toHaveProperty('depositAddress')
    expect(values).not.toHaveProperty('channelId')
  })

  it('still hydrates the asset pair and amount', () => {
    expect(getFormValuesFromSearchParams(linkParams)).toEqual({
      sellAssetId: solAssetId,
      buyAssetId: ethAssetId,
      sellAmountCryptoBaseUnit: '1000',
    })
    expect(getFormDefaultsFromSearchParams(new URLSearchParams())).toEqual({
      sellAssetId: ethAssetId,
      buyAssetId: btcAssetId,
      sellAmountCryptoBaseUnit: undefined,
    })
  })

  it('excludes address fields from URL sync', () => {
    expect(isUrlExcludedField('destinationAddress')).toBe(true)
    expect(isUrlExcludedField('refundAddress')).toBe(true)
    expect(isUrlExcludedField('sellAssetId')).toBe(false)
  })
})
