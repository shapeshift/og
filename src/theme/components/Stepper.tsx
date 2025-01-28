import { keyframes } from '@emotion/react'

const throb = keyframes({
  '0%': {
    boxShadow: '0 0 0 0px rgba(55, 97, 249, 1)',
  },
  '100%': {
    boxShadow: '0 0 0 15px rgba(55, 97, 249, 0)',
  },
})

const baseStyle = {
  // select the indicator part
  indicator: {
    '&[data-status=active]': {
      bg: 'background.surface.raised.base',
      borderColor: 'blue.500',
    },
    // add throbbing to active steps that are not current executing (to get user attention)
    '&[data-status=active]:not(.step-pending)': {
      animation: `${throb} 1s infinite cubic-bezier(0.87, 0, 0.13, 1)`,
    },
    '&[data-status=incomplete]': {
      bg: 'background.surface.raised.base',
      borderColor: 'border.base',
    },
    '&[data-status=complete]': {
      bg: 'background.success',
    },
  },
  separator: {
    bg: 'border.base',
    '&[data-status=complete]': {
      bg: 'blue.500',
    },
    '&[data-status=active]': {
      bg: 'border.base',
    },
  },
}

const variants = {
  vert: {
    step: {
      flexDirection: 'column',
      flex: '1 0 0 !important',
      '&[data-status=incomplete]': {
        opacity: 0.2,
      },
      '&[data-status=complete]': {
        color: 'text.success',
      },
    },
  },
  error: {
    indicator: {
      '&[data-status=active]': {
        bg: 'background.surface.raised.base',
        borderColor: 'red.500',
      },
      '&[data-status=incomplete]': {
        bg: 'background.surface.raised.base',
        borderColor: 'border.base',
      },
      '&[data-status=complete]': {
        bg: 'background.error',
      },
    },
  },
  // other variants if needed
}

export const stepperTheme = {
  baseStyle,
  variants,
}
