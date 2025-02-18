import type { TextProps } from '@chakra-ui/react'
import { Text, useColorModeValue } from '@chakra-ui/react'
import { useMemo } from 'react'
import type { NumberFormatOptions } from 'hooks/useLocaleFormatter/useLocaleFormatter'
import { useLocaleFormatter } from 'hooks/useLocaleFormatter/useLocaleFormatter'

export type AmountProps = {
  value: number | string
  prefix?: string
  suffix?: string
  omitDecimalTrailingZeros?: boolean
  abbreviated?: boolean
  maximumFractionDigits?: number
} & TextProps

export function Amount({
  value,
  prefix = '',
  suffix = '',
  maximumFractionDigits,
  omitDecimalTrailingZeros = false,
  abbreviated = false,
  ...props
}: any): React.ReactElement {
  const {
    number: { toString },
  } = useLocaleFormatter()

  return (
    <Text {...props}>
      {prefix}
      {toString(value, { maximumFractionDigits, omitDecimalTrailingZeros, abbreviated })}
      {suffix}
    </Text>
  )
}

type CryptoAmountProps = {
  value: string
  symbol: string
  cryptoSymbolStyle?: TextProps
  maximumFractionDigits?: number
} & AmountProps

type FiatAmountProps = {
  fiatSymbolStyle?: TextProps
  fiatType?: string
} & AmountProps

type PercentAmountProps = AmountProps & {
  options?: NumberFormatOptions
  autoColor?: boolean
}

const Crypto = ({
  value,
  symbol,
  cryptoSymbolStyle,
  maximumFractionDigits = 8,
  prefix,
  suffix,
  omitDecimalTrailingZeros = false,
  ...props
}: CryptoAmountProps) => {
  const {
    number: { toCrypto, toParts },
  } = useLocaleFormatter()

  const crypto = toCrypto(value, symbol, { maximumFractionDigits, omitDecimalTrailingZeros })

  if (!cryptoSymbolStyle) {
    return (
      <Text {...props}>
        {prefix && `${prefix} `}
        {crypto}
        {suffix && ` ${suffix}`}
      </Text>
    )
  }

  const parts = toParts(crypto)

  return (
    <Text {...props}>
      {parts.prefix && (
        <Text {...props} {...cryptoSymbolStyle}>
          {parts.prefix}
        </Text>
      )}
      {parts.number}
      {parts.postfix && (
        <Text {...props} {...cryptoSymbolStyle}>
          {parts.postfix}
        </Text>
      )}
    </Text>
  )
}

const Fiat = ({
  value,
  fiatSymbolStyle,
  fiatType,
  prefix,
  suffix,
  maximumFractionDigits,
  omitDecimalTrailingZeros = false,
  abbreviated = false,
  ...props
}: FiatAmountProps) => {
  const {
    number: { toFiat, toParts },
  } = useLocaleFormatter({ fiatType })

  const fiat = toFiat(value, {
    fiatType,
    omitDecimalTrailingZeros,
    abbreviated,
    maximumFractionDigits,
  })

  if (!fiatSymbolStyle) {
    return (
      <Text {...props}>
        {prefix && `${prefix} `}
        {fiat}
        {suffix && ` ${suffix}`}
      </Text>
    )
  }

  const parts = toParts(fiat)

  return (
    <Text {...props}>
      {parts.prefix && (
        <Text {...props} {...fiatSymbolStyle}>
          {parts.prefix}
        </Text>
      )}
      {parts.number}
      {parts.postfix && (
        <Text {...props} {...fiatSymbolStyle}>
          {parts.postfix}
        </Text>
      )}
    </Text>
  )
}

const Percent = ({ value, autoColor, options, prefix, suffix, ...props }: PercentAmountProps) => {
  const {
    number: { toPercent },
  } = useLocaleFormatter()
  const formattedNumber = toPercent(value, options)
  const red = useColorModeValue('red.800', 'red.500')
  const green = useColorModeValue('green.500', 'green.200')
  const color = useMemo(() => {
    const roundedValue = parseFloat(formattedNumber)
    if (roundedValue === 0) {
      return green
    }
    if (roundedValue > 0) {
      return green
    }
    return red
  }, [formattedNumber, green, red])

  return (
    <Text color={autoColor ? color : 'inherit'} {...props}>
      {prefix && `${prefix} `}
      {formattedNumber}
      {suffix && ` ${suffix}`}
    </Text>
  )
}

Amount.Crypto = Crypto
Amount.Fiat = Fiat
Amount.Percent = Percent
