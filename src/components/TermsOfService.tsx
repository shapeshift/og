import {
  Box,
  Container,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from '@chakra-ui/react'

export const TermsOfService = () => {
  return (
    <Container maxW='container.lg' py={8}>
      <VStack spacing={8} align='stretch'>
        <Box textAlign='center' mb={6}>
          <Heading as='h1' size='xl' mb={3}>
            ShapeShift
          </Heading>
          <Heading as='h2' size='lg' mb={3}>
            Terms of Service
          </Heading>
          <Text fontWeight='medium' fontSize='md'>
            Dated: February 2025
          </Text>
        </Box>

        <Text fontSize='md' lineHeight='tall'>
          These Terms of Service ("Terms") govern your access to and use of og.shapeshift.com
          ("Website"), including any content, functionality, and services offered on or through the
          Website. By using the Website, you agree to be bound by these Terms. If you do not agree
          to these Terms, you must not access or use the Website.
        </Text>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            1. Eligibility
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            You must be at least 18 years old to use the Website. By using the Website, you
            represent and warrant that you are at least 18 years old and have the legal capacity to
            enter into these Terms.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            2. Prohibited Activities
          </Heading>
          <Text fontSize='md' lineHeight='tall' mb={3}>
            You agree not to engage in any of the following prohibited activities:
          </Text>
          <UnorderedList spacing={2} pl={4}>
            <ListItem fontSize='md' lineHeight='tall'>
              Using the Website for any illegal purpose or in violation of any local, state,
              national, or international law.
            </ListItem>
            <ListItem fontSize='md' lineHeight='tall'>
              Attempting to interfere with, compromise the system integrity or security, or decipher
              any transmissions to or from the servers running the Website.
            </ListItem>
            <ListItem fontSize='md' lineHeight='tall'>
              Imposing an unreasonable or disproportionately large load on our infrastructure.
            </ListItem>
            <ListItem fontSize='md' lineHeight='tall'>
              Uploading invalid data, viruses, worms, or other software agents through the Website.
            </ListItem>
            <ListItem fontSize='md' lineHeight='tall'>
              Using the Website for any commercial solicitation purposes.
            </ListItem>
          </UnorderedList>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            3. Intellectual Property
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            The Website and its original content, features, and functionality are owned by
            ShapeShift and are protected by international copyright, trademark, patent, trade
            secret, and other intellectual property or proprietary rights laws.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            4. Termination
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            We may terminate or suspend your access to the Website immediately, without prior notice
            or liability, for any reason whatsoever, including without limitation if you breach
            these Terms. All provisions of these Terms which by their nature should survive
            termination shall survive termination, including, without limitation, ownership
            provisions, warranty disclaimers, indemnity, and limitations of liability.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            5. Disclaimer
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            The Website is provided on an "AS IS" and "AS AVAILABLE" basis. The Website is provided
            without warranties of any kind, whether express or implied, including, but not limited
            to, implied warranties of merchantability, fitness for a particular purpose,
            non-infringement, or course of performance. ShapeShift, its subsidiaries, affiliates,
            and its licensors do not warrant that the Website will function uninterrupted, secure,
            or available at any particular time or location, or that any errors or defects will be
            corrected.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            6. Limitation of Liability
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            In no event shall ShapeShift, nor its directors, employees, partners, agents, suppliers,
            or affiliates, be liable for any indirect, incidental, special, consequential, or
            punitive damages, including without limitation, loss of profits, data, use, goodwill, or
            other intangible losses, resulting from your access to or use of or inability to access
            or use the Website.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            7. Governing Law
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            These Terms shall be governed and construed in accordance with the laws of the United
            States, without regard to its conflict of law provisions. Our failure to enforce any
            right or provision of these Terms will not be considered a waiver of those rights.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            8. Changes to Terms
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any
            time. By continuing to access or use our Website after those revisions become effective,
            you agree to be bound by the revised terms. If you do not agree to the new terms, please
            stop using the Website.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={3}>
            9. Contact Us
          </Heading>
          <Text fontSize='md' lineHeight='tall'>
            If you have any questions about these Terms, please contact us through our Discord
            server, which you can join{' '}
            <Link color='blue.400' href='https://discord.gg/shapeshift' isExternal>
              here
            </Link>
            .
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}
