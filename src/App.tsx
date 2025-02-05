import './App.css'

import { Center } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router'
import { ChatwootButton } from 'components/Chatwoot'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'
import type { SwapFormData } from 'types/form'
import { useEffect } from 'react'

import { queryClient } from './config/react-query'

function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  const methods = useForm<SwapFormData>({
    defaultValues: {
      sellAsset: searchParams.get('sellAsset') || undefined,
      buyAsset: searchParams.get('buyAsset') || undefined,
      sellAmountCryptoBaseUnit: searchParams.get('sellAmountCryptoBaseUnit') || '',
      destinationAddress: searchParams.get('destinationAddress') || '',
      refundAddress: searchParams.get('refundAddress') || '',
    },
  })

  // Watch form changes and update URL
  const formValues = useWatch({ control: methods.control })
  
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    // Update only defined values in URL
    Object.entries(formValues).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    // Replace state to avoid creating new history entries
    setSearchParams(params, { replace: true })
  }, [formValues, searchParams, setSearchParams])

  // Watch URL changes and update form
  useEffect(() => {
    const formData: Partial<SwapFormData> = {}
    searchParams.forEach((value, key) => {
      if (key in methods.getValues()) {
        formData[key as keyof SwapFormData] = value
      }
    })
    methods.reset(formData as SwapFormData)
  }, [searchParams, methods])

  return (
    <FormProvider {...methods}>
      <Center width='full' height='100vh' flexDir='column'>
        <Routes>
          <Route path="/" element={<SelectPair />} />
          <Route path="/input" element={<TradeInput />} />
          <Route path="/status" element={<Status />} />
        </Routes>
        <ChatwootButton />
      </Center>
    </FormProvider>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

// eslint-disable-next-line import/no-default-export
export default App
