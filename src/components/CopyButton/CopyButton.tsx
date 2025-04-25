import { CheckIcon, CopyIcon } from '@chakra-ui/icons'
import { IconButton, useClipboard } from '@chakra-ui/react'

const checkIcon = <CheckIcon />
const copyIcon = <CopyIcon />

type CopyButtonProps = {
  text: string
  timeout?: number
  ariaLabel?: string
}

export const CopyButton = ({ text, timeout = 3000, ariaLabel }: CopyButtonProps) => {
  const { onCopy, hasCopied: isCopied } = useClipboard(text, { timeout })

  return (
    <IconButton
      borderRadius='lg'
      size='sm'
      variant='ghost'
      icon={isCopied ? checkIcon : copyIcon}
      aria-label={ariaLabel ?? 'Copy button'}
      onClick={onCopy}
    />
  )
}
