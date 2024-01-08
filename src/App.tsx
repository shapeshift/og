import './App.css'

import { Center } from '@chakra-ui/react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { SelectPair } from 'components/SelectPair'
import { Status } from 'components/Status/Status'
import { TradeInput } from 'components/TradeInput'

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
    <Center width='full' height='100vh' flexDir='column'>
      <RouterProvider router={router} />
    </Center>
  )
}

// eslint-disable-next-line import/no-default-export
export default App
