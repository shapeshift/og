import { Box, Center } from '@chakra-ui/react'
import { useEffect, useRef } from 'react'
import qrcode from 'qrcode'

type QRCodeProps = {
  content: string
  width: number
  icon?: React.ReactNode
  standardColors?: boolean
}

export const QRCode: React.FC<QRCodeProps> = ({ content, width, icon, standardColors = false }) => {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (ref.current && width) {
      qrcode.toCanvas(ref.current, content, {
        margin: 1,
        width,
        color: standardColors ? undefined : { light: '#ffffff00', dark: '#161616ff' },
      })
    }
  }, [content, width, standardColors])

  return (
    <Box position='relative'>
      {icon && (
        <Center
          position='absolute'
          top='50%'
          left='50%'
          transform='translate(-50%, -50%)'
          boxSize='34px'
          borderRadius='md'
          bg='background.surface.raised.base'
          zIndex={1}
        >
          {icon}
        </Center>
      )}
      <canvas ref={ref} style={{ width: '100%' }} />
    </Box>
  )
} 