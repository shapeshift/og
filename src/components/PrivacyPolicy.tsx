import { ArrowBackIcon } from '@chakra-ui/icons'
import { Box, Container, Flex, Heading, IconButton, Link, Text, VStack } from '@chakra-ui/react'
import { useCallback } from 'react'
import { useNavigate } from 'react-router'

const arrowbackIcon = <ArrowBackIcon />

export const PrivacyPolicy = () => {
  const navigate = useNavigate()

  const handleBack = useCallback(() => navigate(-1), [navigate])

  return (
    <Container maxW='container.lg' py={8}>
      <Flex width='100%' mb={4}>
        <IconButton
          aria-label='Back'
          icon={arrowbackIcon}
          onClick={handleBack}
          variant='ghost'
          color='whiteAlpha.800'
          size='md'
          borderRadius='full'
        />
      </Flex>
      <VStack spacing={8} align='stretch'>
        <Box textAlign='center' mb={6}>
          <Heading as='h1' size='xl' mb={3}>
            ShapeShift
          </Heading>
          <Heading as='h2' size='lg' mb={3}>
            Privacy Policy
          </Heading>
          <Text fontWeight='medium' fontSize='md'>
            Dated: February 2025
          </Text>
        </Box>

        <Text fontSize='md' lineHeight='tall'>
          This notice summarizes our data collection, transfer, and protection practices associated
          with og.shapeshift.com ("Website"), and more generally outlines what we do with your data
          when you interact with the Website in any way. Your use of the Website constitutes your
          acceptance of all aspects of this notice, so read this notice carefully. All other aspects
          of your interaction with the Website are governed by our Terms of Service.
        </Text>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            How we can change this notice:
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            We may, in our sole discretion, modify this notice, so you should review this page
            periodically. When we change this notice, we will update the date at the top of this
            page. Prior versions of this notice can be found here. Your continued use of the Website
            after any change to this notice constitutes your acceptance of such change. If you do
            not agree to any portion of this notice, then you should not use or access (or continue
            to access) the Website.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            Privacy Generally:
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            We respect the privacy of the users of the Website and we will not request any
            information beyond: what is necessary for your use of the Website or to comply with our
            legal obligations. We also do not obscure any blockchain information requested or
            obtained through the Website. You acknowledge that due to the inherent transparent
            nature of blockchains, transactions are public and easily correlated. Attempting to
            utilize the Website to obscure a transaction or cryptocurrency will be pointless and
            ineffective, and is ill-advised. Law enforcement has full access to blockchain
            information that goes in or out of the Website.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            Data we collect:
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            Simply put, the Website itself does not collect any of your personal information. All of
            your data is either retained locally by you or your wallet software or stored on the
            respective blockchain. Please note that the Website is simply an interface to other
            third-party services or smart contracts, and these services or contracts may collect
            differently from us. Please check with the respective third-party or smart contract to
            see their data collection practices before connecting to or confirming a transaction on
            such service or contract. Lastly, when you interact with the Platform, you may be
            revealing your IP address to the site's host, however, we do not receive your IP
            address.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            Data we share:
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            We use a third-party service provider, Chatwoot, to assist in our responses to queries
            made by users of the Website and provide higher quality customer support to our users,
            which is necessary to perform agreement obligations (viz. our Terms of Service) for our
            users. Chatwoot uses cookies as well as the inquiring user's name and email address in
            order to provide these services. No other information will be shared with Chatwoot
            unless specifically provided by the user. Further information on data protection and
            your options in connection with Chatwoot's services can be found
            <Link
              color='blue.400'
              href='https://www.chatwoot.com/terms-of-service'
              isExternal
              ml={1}
            >
              here
            </Link>{' '}
            and Chatwoot's privacy policy can be found
            <Link color='blue.400' href='https://www.chatwoot.com/privacy-policy' isExternal ml={1}>
              here
            </Link>
            .
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            How we store user data:
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            As we've mentioned in this notice, we limit the amount of user data in the first place.
            While we adhere to best practices when it comes to storing data, we limit the potential
            for a security breach that affects user data by not having user data in the first place.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            Who we are and how to contact us:
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            The Website and this notice are maintained by the ShapeShift decentralized autonomous
            organization. The best way to get in touch with us is through our discord server, which
            you can join
            <Link color='blue.400' href='https://discord.gg/shapeshift' isExternal ml={1}>
              here
            </Link>
            .
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}
