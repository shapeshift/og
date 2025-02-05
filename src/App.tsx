import './App.css'

import { Center } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { BrowserRouter, Routes, Route, useSearchParams, useLocation } from 'react-router'
import { AnimatePresence, motion } from 'framer-motion'
import { ChatwootButton } from 'components/Chatwoot'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'
import type { SwapFormData } from 'types/form'
import { useEffect, useMemo, useRef } from 'react'

import { queryClient } from './config/react-query'

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

const fadeUpVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

const transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1], // Using a custom easing curve
  duration: 0.3,
}

// Get variants based on the route change
const getVariants = (pathname: string) => {
  if (pathname === '/status') return fadeUpVariants
  return slideVariants
}

function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const isInitialMount = useRef(true)
  
  // Initialize form with values from URL
  const defaultValues = useMemo(() => ({
    sellAsset: searchParams.get('sellAsset') || undefined,
    buyAsset: searchParams.get('buyAsset') || undefined,
    sellAmountCryptoBaseUnit: searchParams.get('sellAmountCryptoBaseUnit') || '',
    destinationAddress: searchParams.get('destinationAddress') || '',
    refundAddress: searchParams.get('refundAddress') || '',
  }), [searchParams])
  
  const methods = useForm<SwapFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues
  })

  // Watch form changes and update URL regardless of validation state
  const formValues = useWatch({ control: methods.control })
  
  // Sync form values to URL
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const params = new URLSearchParams(searchParams)
    
    // Update URL with all form values, even if invalid
    Object.entries(formValues || {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    setSearchParams(params, { replace: true })
  }, [formValues, setSearchParams])

  // Handle external URL changes
  useEffect(() => {
    // Skip if it's just a route change without param changes
    const currentParams = Object.fromEntries(searchParams.entries())
    const hasParams = Object.keys(currentParams).length > 0

    if (hasParams) {
      const formData: Partial<SwapFormData> = {}
      searchParams.forEach((value, key) => {
        if (key in defaultValues) {
          formData[key as keyof SwapFormData] = value
        }
      })
      methods.reset(formData)
    }
  }, [searchParams, methods, defaultValues])

  return (
    <FormProvider {...methods}>
      <Center width='full' height='100vh' flexDir='column'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={getVariants(location.pathname)}
            transition={transition}
            style={{ 
              width: '100%',
              maxWidth: '450px', // Match the TradeInput max width
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Routes location={location}>
              <Route path="/" element={<SelectPair />} />
              <Route path="/input" element={<TradeInput />} />
              <Route path="/status" element={<Status />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
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
