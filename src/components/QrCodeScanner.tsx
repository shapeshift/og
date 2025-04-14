import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react'
import type { Html5QrcodeError, Html5QrcodeResult } from 'html5-qrcode/esm/core'
import { Html5QrcodeErrorTypes } from 'html5-qrcode/esm/core'
import { useCallback, useState } from 'react'

import { QrCodeReader } from './QrCodeReader'

const PERMISSION_ERROR = 'NotAllowedError : Permission denied'
const isPermissionError = (
  error: DOMException['message'] | Html5QrcodeError,
): error is DOMException['message'] =>
  typeof (error as DOMException['message']) === 'string' && error === PERMISSION_ERROR

const boxStyle = {
  width: '100%',
  minHeight: '298px',
  overflow: 'hidden',
  borderRadius: '1rem',
}
const qrBoxStyle = { width: 250, height: 250 }

export type QrCodeScannerProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess: (address: string) => void
}

export const QrCodeScanner = ({ isOpen, onClose, onSuccess }: QrCodeScannerProps) => {
  const [scanError, setScanError] = useState<DOMException['message'] | null>(null)

  const handleScanSuccess = useCallback(
    (decodedText: string, _result: Html5QrcodeResult) => {
      onSuccess(decodedText)
      onClose()
    },
    [onSuccess, onClose],
  )

  const handleScanError = useCallback((_errorMessage: string, error?: Html5QrcodeError) => {
    if (error?.type === Html5QrcodeErrorTypes.UNKWOWN_ERROR) {
      // https://github.com/mebjas/html5-qrcode/issues/320
      // 'NotFoundException: No MultiFormat Readers were able to detect the code' errors are thrown on every frame until a valid QR is detected, don't handle these
      return
    }

    setScanError(_errorMessage)
  }, [])

  const handlePermissionsButtonClick = useCallback(() => setScanError(null), [])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='md'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Scan QR Code
          <ModalCloseButton />
        </ModalHeader>
        <ModalBody pb={6}>
          {scanError ? (
            <Flex justifyContent='center' alignItems='center' flexDirection='column' pb={4}>
              <Alert status='error' borderRadius='xl'>
                <AlertIcon />
                {isPermissionError(scanError)
                  ? 'Camera permission denied. Please allow camera access to scan QR codes.'
                  : 'An error occurred while trying to scan the QR code.'}
              </Alert>
              {isPermissionError(scanError) && (
                <Button colorScheme='blue' mt='5' onClick={handlePermissionsButtonClick}>
                  Try Again
                </Button>
              )}
            </Flex>
          ) : (
            <Box style={boxStyle}>
              <QrCodeReader
                qrbox={qrBoxStyle}
                fps={10}
                qrCodeSuccessCallback={handleScanSuccess}
                qrCodeErrorCallback={handleScanError}
              />
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
