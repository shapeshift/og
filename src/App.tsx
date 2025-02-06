import './App.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { AppRouter } from 'AppRouter'
import { BrowserRouter } from 'react-router'

import { queryClient } from './config/react-query'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line import/no-default-export
export default App
