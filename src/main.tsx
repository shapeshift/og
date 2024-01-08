import './index.css'

import { ChakraProvider, createLocalStorageManager } from '@chakra-ui/react'
import App from 'App'
import React from 'react'
import ReactDOM from 'react-dom/client'

const manager = createLocalStorageManager('ss-theme')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider colorModeManager={manager} cssVarsRoot='body'>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
