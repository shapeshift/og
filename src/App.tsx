import './App.css'

import { Center } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChatwootButton } from 'components/Chatwoot'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'

import { queryClient } from './config/react-query'

const router = createBrowserRouter([
  {
    path: '/',
    element: <SelectPair />,
  },
  {
    path: '/input',
    element: <TradeInput />,
  },
  {
    path: '/status',
    element: <Status />,
  },
])

function App() {
  console.log(import.meta.env.VITE_FOO)

  return (
    <QueryClientProvider client={queryClient}>
      <Center width='full' height='100vh' flexDir='column'>
        <RouterProvider router={router} />
        <ChatwootButton />
      </Center>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line import/no-default-export
export default App
