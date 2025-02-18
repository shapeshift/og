import type { StyleFunctionProps, ThemeConfig } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'
import { mode } from '@chakra-ui/theme-tools'

import { colors } from './colors'
import { ButtonStyle as Button } from './components/Button'
import { CardStyle as Card } from './components/Card'
import { InputStyle as Input } from './components/Input'
import { ModalStyle as Modal } from './components/Modal'
import { stepperTheme as Stepper } from './components/Stepper'
import { semanticTokens } from './semanticTokens'

export const breakpoints = {
  sm: '480px',
  md: '768px',
  lg: '992px',
  xl: '1280px',
  '2xl': '1440px',
  '3xl': '2200px',
}

const styles = {
  global: (props: StyleFunctionProps) => ({
    body: {
      backgroundColor: 'background.surface.base',
      backgroundSize: 'cover',
      fontFeatureSettings: `'zero' on`,
      overflowX: 'hidden',
      textRendering: 'optimizeLegibility',
      fontSmoothing: 'antialiased',
    },
    html: {
      scrollBehavior: 'smooth',
      height: '100%',
    },
    h1: {
      fontSize: '4xl',
    },
    h2: {
      fontSize: '3xl',
    },
    h3: {
      fontSize: '2xl',
    },
    h4: {
      fontSize: 'xl',
    },
    h5: {
      fontSize: 'lg',
    },
    h6: {
      fontSize: 'sm',
    },
    '.scroll-container': {
      visibility: 'hidden',
      paddingRight: '12px',
      transition: 'visibility .5s ease-in-out',
    },
    '.scroll-container::-webkit-scrollbar': {
      background: 'transparent',
      width: '8px',
      height: '8px',
    },
    '.scroll-container::-webkit-scrollbar-thumb': {
      border: 'none',
      boxShadow: 'none',
      background: mode('blackAlpha.50', 'whiteAlpha.300')(props),
      borderRadius: '8px',
      minHeight: '40px',
    },
    '.scroll-container::-webkit-scrollbar-thumb:hover': {
      backgroundColor: mode('blackAlpha.800', 'whiteAlpha.800')(props),
    },
    '.scroll-container > div,.scroll-container:hover,.scroll-container:focus': {
      visibility: 'visible',
    },
    '.chakra-menu__group': {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    '--shapeshift-header-bg': mode('white', 'blackAlpha.100')(props),
  }),
}

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
}

export const theme = extendTheme({
  breakpoints,
  styles,
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Work Sans, system-ui, sans-serif',
  },
  components: {
    Button,
    Card,
    Modal,
    Input,
    Stepper,
  },
  colors,
  sizes: {
    container: {
      '2xl': '1440px',
      '3xl': '1600px',
      '4xl': '1955px',
    },
  },
  shadows: {
    xl: '0 2px 4px 2px rgba(0,0,0,.15),0 2px 10px 2px rgba(0,0,0,.2)',
    'outline-inset': '0 0 0 3px rgba(66, 153, 225, 0.6) inset',
    right: '3px 0px 2px rgba(0,0,0,.5), 5px 0 10px rgba(0,0,0,.2)',
  },
  semanticTokens,
  config,
})
