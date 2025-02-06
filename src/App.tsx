import './App.css'

import { Center } from '@chakra-ui/react'
import { QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { BrowserRouter, Route, Routes, useLocation, useSearchParams } from 'react-router'
import { ChatwootButton } from 'components/Chatwoot'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'
import type { SwapFormData } from 'types/form'

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
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.3,
}

const getVariants = (pathname: string) => {
  if (pathname === '/status') return fadeUpVariants
  return slideVariants
}

function AppContent() {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const isInitialMount = useRef(true)

  const defaultValues = useMemo(
    () => ({
      sellAsset: searchParams.get('sellAsset') || undefined,
      buyAsset: searchParams.get('buyAsset') || undefined,
      sellAmountCryptoBaseUnit: searchParams.get('sellAmountCryptoBaseUnit') || '',
      destinationAddress: searchParams.get('destinationAddress') || '',
      refundAddress: searchParams.get('refundAddress') || '',
    }),
    [searchParams],
  )

  const methods = useForm<SwapFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues,
  })

  const formValues = useWatch({ control: methods.control })

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    const params = new URLSearchParams(searchParams)

    Object.entries(formValues || {}).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    })

    setSearchParams(params, { replace: true })
  }, [formValues, setSearchParams, searchParams])

  useEffect(() => {
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

  const selectPairComponent = useMemo(() => <SelectPair />, [])
  const tradeInputComponent = useMemo(() => <TradeInput />, [])
  const statusComponent = useMemo(() => <Status />, [])

  return (
    <FormProvider {...methods}>
      <Center width='full' height='100vh' flexDir='column'>
        <AnimatePresence mode='wait' initial={false}>
          <motion.div
            key={location.pathname}
            initial='initial'
            animate='animate'
            exit='exit'
            variants={getVariants(location.pathname)}
            transition={transition}
            style={{
              width: '100%',
              maxWidth: '450px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Routes location={location}>
              <Route path='/' element={selectPairComponent} />
              <Route path='/input' element={tradeInputComponent} />
              <Route path='/status' element={statusComponent} />
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
