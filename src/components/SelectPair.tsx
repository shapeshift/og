import { Button, Card, CardBody, Flex, Heading, IconButton } from '@chakra-ui/react'
import { useCallback, useMemo } from 'react'
import { FaArrowRightArrowLeft } from 'react-icons/fa6'
import { useNavigate } from 'react-router-dom'
import { BTCImage, ETHImage } from 'lib/const'

import { AssetSelection } from './AssetSelection'

export const SelectPair = () => {
  const navigate = useNavigate()
  const switchIcon = useMemo(() => <FaArrowRightArrowLeft />, [])
  const handleSubmit = useCallback(() => {
    navigate('/input')
  }, [navigate])

  const handleFromAssetClick = useCallback(() => {
    console.info('asset click')
  }, [])
  const handleToAssetClick = useCallback(() => {
    console.info('to asset click')
  }, [])

  return (
    <Card width='full' maxWidth='450px'>
      <CardBody display='flex' flexDir='column' gap={8}>
        <Heading as='h4' fontSize='md' textAlign='center'>
          Choose which assets to trade
        </Heading>
        <Flex alignItems='center' gap={4} color='text.subtle' width='full'>
          <AssetSelection
            label='Deposit'
            onClick={handleFromAssetClick}
            assetIcon={BTCImage}
            assetName='Bitcoin'
          />
          <IconButton variant='ghost' icon={switchIcon} aria-label='Switch assets' />
          <AssetSelection
            label='Receive'
            onClick={handleToAssetClick}
            assetIcon={ETHImage}
            assetName='Ethereum'
          />
        </Flex>
        <Button size='lg' colorScheme='blue' onClick={handleSubmit}>
          Continue
        </Button>
      </CardBody>
    </Card>
  )
}
