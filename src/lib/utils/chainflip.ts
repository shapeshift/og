import type { ChainflipSwapStatus } from 'queries/chainflip/types'
import { FaArrowDown, FaArrowRightArrowLeft, FaCheck, FaClock, FaRotate } from 'react-icons/fa6'

type StatusConfig = {
  icon: typeof FaCheck
  message: string
  color: string
}

export const getChainflipStatusConfig = (
  state?: string,
  status?: { status: ChainflipSwapStatus },
): StatusConfig => {
  const retryCount = status?.status.swap?.regular?.retryCount ?? 0
  const isRetrying = state === 'swapping' && retryCount > 0
  const isRefund = Boolean(status?.status.refundEgress)
  const isRefunded = isRefund && state === 'completed'

  if (isRefunded) {
    return {
      icon: FaCheck,
      message: 'Refunded',
      color: 'green.200',
    }
  }

  if (isRefund) {
    return {
      icon: FaArrowDown,
      message: 'Refunding...',
      color: 'green.200',
    }
  }

  if (isRetrying) {
    return {
      icon: FaRotate,
      message: 'Retrying Swap...',
      color: 'green.200',
    }
  }

  switch (state) {
    case 'waiting':
      return {
        icon: FaClock,
        message: 'Waiting for deposit...',
        color: 'green.200',
      }
    case 'receiving':
      return {
        icon: FaArrowDown,
        message: 'Deposit detected, waiting for confirmation...',
        color: 'green.200',
      }
    case 'swapping':
      return {
        icon: FaArrowRightArrowLeft,
        message: 'Processing swap...',
        color: 'green.200',
      }
    case 'sending':
      return {
        icon: FaArrowDown,
        message: status?.status.swapEgress?.transactionReference
          ? 'Outbound transaction initiated...'
          : 'Preparing outbound transaction...',
        color: 'green.200',
      }
    case 'sent':
      return {
        icon: FaArrowDown,
        message: 'Transaction sent, waiting for confirmation...',
        color: 'green.200',
      }
    case 'completed':
      return {
        icon: FaCheck,
        message: 'Swap Complete',
        color: 'green.200',
      }
    case 'failed':
      return {
        icon: FaCheck,
        message: 'Swap failed',
        color: 'red.500',
      }
    default:
      return {
        icon: FaClock,
        message: 'Unknown status',
        color: 'green.200',
      }
  }
}
