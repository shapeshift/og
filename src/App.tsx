import './App.css'

import { Center } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ChatwootButton } from 'components/Chatwoot'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'
import type { SwapFormData } from 'types/form'

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
  const methods = useForm<SwapFormData>({
    defaultValues: {
      sellAsset: undefined,
      buyAsset: undefined,
      sellAmount: '',
      buyAmount: '',
      destinationAddress: '',
      refundAddress: '',
    },
  })

  console.log('Form State:', methods.watch()) // Debug log to show form state changes

  return (
    <QueryClientProvider client={queryClient}>
      <FormProvider {...methods}>
        <Center width='full' height='100vh' flexDir='column'>
          <RouterProvider router={router} />
          <ChatwootButton />
        </Center>
      </FormProvider>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line import/no-default-export
export default App
