import { Box, Container, Flex, Link } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'

const linkHoverSx = { color: 'white', textDecoration: 'none' }

export const Footer = () => {
  return (
    <Box
      as='footer'
      py={6}
      mt='auto'
      bg='blackAlpha.400'
      backdropFilter='blur(10px)'
      borderTopWidth='1px'
      borderTopColor='whiteAlpha.100'
    >
      <Container maxW='container.xl'>
        <Flex justify='center' align='center' gap={6}>
          <Link
            as={RouterLink}
            to='/privacy-policy'
            color='whiteAlpha.700'
            fontSize='sm'
            _hover={linkHoverSx}
            transition='color 0.2s ease'
          >
            Privacy Policy
          </Link>
          <Link
            as={RouterLink}
            to='/terms-of-service'
            color='whiteAlpha.700'
            fontSize='sm'
            _hover={linkHoverSx}
            transition='color 0.2s ease'
          >
            Terms of Service
          </Link>
        </Flex>
      </Container>
    </Box>
  )
}
