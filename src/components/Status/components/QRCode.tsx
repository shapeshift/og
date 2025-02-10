import { Center, Skeleton } from '@chakra-ui/react'
import { QRCodeSVG } from 'qrcode.react'

type QRCodeProps = {
  loading?: boolean
  text: string
}

export const QRCode = ({ loading, text }: QRCodeProps) => {
  return (
    <Skeleton isLoaded={!loading} boxSize='full' borderRadius='xl'>
      <Center boxSize='full'>
        <QRCodeSVG value={text} />
      </Center>
    </Skeleton>
  )
}
