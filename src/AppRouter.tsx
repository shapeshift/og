import { Box, Center, Heading, Text } from '@chakra-ui/react'
import { btcAssetId, ethAssetId } from 'constants/caip'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { Route, Routes, useLocation, useSearchParams } from 'react-router'
import { ChatwootButton } from 'components/Chatwoot'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'
import type { SwapFormData } from 'types/form'

const selectPair = <SelectPair />
const tradeInput = <TradeInput />
const status = <Status />

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

const motionWrapperSx = {
  width: '100%',
  maxWidth: '450px',
  display: 'flex',
  justifyContent: 'center',
}

const transition = {
  type: 'tween',
  ease: [0.25, 0.1, 0.25, 1],
  duration: 0.3,
}

const bgContainerSx = {
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background:
      'radial-gradient(92.26% 92.26% at 88.33% -16.18%, rgba(0, 0, 0, 0.2) 0%, #000000 100%)',
    zIndex: 0,
    backdropFilter: 'blur(40px)',
  },
}

const headingFontSizeSx = { base: '40px', md: '56px' }
const headingLineHeightSx = { base: '48px', md: '64px' }

const getVariants = (pathname: string) => {
  // Not sure what this does but this looks good on status screen so
  if (pathname === '/status') return fadeUpVariants
  return slideVariants
}

export const AppRouter = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  const defaultValues = useMemo(
    () => ({
      sellAssetId: searchParams.get('sellAssetId') || ethAssetId,
      buyAssetId: searchParams.get('buyAssetId') || btcAssetId,
      sellAmountCryptoBaseUnit: searchParams.get('sellAmountCryptoBaseUnit') || undefined,
      destinationAddress: searchParams.get('destinationAddress') || undefined,
      refundAddress: searchParams.get('refundAddress') || undefined,
    }),
    [searchParams],
  )

  const methods = useForm<SwapFormData>({
    mode: 'all',
    reValidateMode: 'onChange',
    defaultValues,
  })

  const formValues = useWatch({ control: methods.control })

  // Synchronize queryparams with form
  useEffect(() => {
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

  // Synchronize form with queryparams too
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

  return (
    <FormProvider {...methods}>
      <Center
        width='full'
        height='100vh'
        flexDir='column'
        bgImage="url('/src/assets/bg.jpg')"
        bgSize='cover'
        bgPosition='center'
        bgRepeat='no-repeat'
        position='relative'
        sx={bgContainerSx}
      >
        <Box
          position='relative'
          zIndex={1}
          width='full'
          display='flex'
          justifyContent='center'
          flexDir='column'
          alignItems='center'
        >
          <Box mb={16} textAlign='center' maxWidth='container.sm' mx='auto'>
            <Heading
              fontSize={headingFontSizeSx}
              lineHeight={headingLineHeightSx}
              fontWeight='semibold'
              mb={4}
              letterSpacing='-0.02em'
              display='flex'
              flexDirection='column'
              alignItems='center'
            >
              <span>Ditch your wallet,</span>
              <span>Swap multichain</span>
            </Heading>
            <Text
              fontSize='16px'
              color='whiteAlpha.700'
              maxWidth='480px'
              mx='auto'
              textAlign='center'
              lineHeight='1.6'
              letterSpacing='-0.01em'
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </Text>
          </Box>
          <AnimatePresence mode='wait' initial={false}>
            <motion.div
              key={location.pathname}
              initial='initial'
              animate='animate'
              exit='exit'
              variants={getVariants(location.pathname)}
              transition={transition}
              style={motionWrapperSx}
            >
              <Routes location={location}>
                <Route path='/' element={selectPair} />
                <Route path='/input' element={tradeInput} />
                <Route path='/status' element={status} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Box>
        <Box position='absolute' bottom={4} right={4} zIndex={1}>
          <ChatwootButton />
        </Box>
      </Center>
    </FormProvider>
  )
}
