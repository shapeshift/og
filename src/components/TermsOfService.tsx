import { Box, Container, Heading, Link, Text, VStack } from '@chakra-ui/react'

export const TermsOfService = () => {
  return (
    <Container maxW='container.md' py={8}>
      <VStack spacing={6} align='stretch'>
        <Box textAlign='center' mb={4}>
          <Heading as='h1' size='xl' mb={2}>
            ShapeShift
          </Heading>
          <Heading as='h2' size='lg' mb={2}>
            Terms of Service
          </Heading>
          <Text fontWeight='medium'>Dated: February 2025</Text>
        </Box>

        <Text fontWeight='bold'>WELCOME TO THE DECENTRALIZED SHAPESHIFT WEBSITE!</Text>

        <Text fontWeight='bold'>
          THESE TERMS CONSTITUTE A LEGALLY BINDING AGREEMENT BETWEEN YOU AND THE SHAPESHIFT
          DECENTRALIZED AUTONOMOUS ORGANIZATION (WHO WE REFER TO IN THE FIRST PERSON IN THESE
          TERMS). WE ARE NOT AFFILIATED WITH SHAPESHIFT AG (OR ANY OF ITS AFFILIATES), THE PRIOR
          OWNER AND OPERATOR OF THE SHAPESHIFT PLATFORM. PLEASE READ THIS DOCUMENT CAREFULLY TO
          ENSURE THAT YOU UNDERSTAND AND AGREE TO EVERY PORTION OF THESE TERMS BEFORE USING THE
          PLATFORM.
        </Text>

        <Box>
          <Heading as='h3' size='md' mb={2}>
            What these terms are:
          </Heading>
          <Text>
            These terms govern your use of the decentralized og.shapeshift.com ("Website"), which we
            provide on an "as-is" basis as a public good, and with a full open source of the
            Website's codebase—in exchange for your agreement to these terms. By either: (1)
            accessing or using the Website; or (2) clicking a button or checking a box marked "I
            Agree" (or substantially similar language) on the Website, you acknowledge that you have
            read, understood, acknowledge, and agree to: (i) these terms in full; and (ii) our
            privacy policy ("Privacy Policy"), which is incorporated into these terms and clarifies
            our data collection, privacy, storage, and transfer practices. Any conflicts between
            these terms and our Privacy Policy will be resolved in favor of the Privacy Policy.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={2}>
            How we can change these terms:
          </Heading>
          <Text>
            We may, in our sole discretion, modify these terms at any time, so you should review
            this page periodically. When we change these terms, we will update the date at the top
            of this page. Prior versions of these terms can be found
            <Link color='blue.400' href='#' ml={1}>
              here
            </Link>
            . Your continued use of the Website after any change to these terms constitutes your
            acceptance of such change. If you do not agree to any portion of these terms, then you
            should not use or access (or continue to access) the Website.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={2}>
            Quick disclaimer on buying, selling, transferring, or really doing anything in the
            cryptocurrency space:
          </Heading>
          <Text>
            We do not endorse or recommend any particular cryptocurrency, transaction, or purchasing
            strategy. Content on any of our websites or your communications with any member of our
            community should not be construed as advice. While the blockchains that you can access
            through our Website are fully public, they are also fully immutable, meaning that once a
            transaction has been submitted it is unlikely to be reversible. Additionally, since
            blockchain transactions are highly technical, there are unfortunately many nefarious
            actors and scams still prevalent in the space. You should seek independent advice and
            conduct your own due diligence prior to using our Website, or quite frankly, doing
            anything in the cryptocurrency space. Lastly, many cryptocurrencies remain highly
            volatile. All this is to say that: THE RISK OF LOSS IN BUYING OR SELLING ANY
            CRYPTOCURRENCY CAN BE SUBSTANTIAL, THEREFORE YOU SHOULD CAREFULLY CONSIDER WHETHER
            BUYING OR SELLING CRYPTOCURRENCY IS SUITABLE FOR YOU IN LIGHT OF YOUR FINANCIAL
            CONDITION BEFORE BUYING OR SELLING SUCH CRYPTOCURRENCY. Ok… thanks for bearing with us
            while we went through that.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={2}>
            USING THE WEBSITE:
          </Heading>
          <Text mb={4}>
            We grant you a nonexclusive, fully revocable, limited license to use our Website for
            lawful purposes. That said, this license does not include a license to use any
            intellectual property associated with the Website, including the ShapeShift trade name
            or any associated logos.
          </Text>
          <Text mb={4}>
            Our Website is fully non-custodial meaning we never have access to your wallet, your
            secret seed phrase, your private keys, or any related passwords. The Website pulls
            pricing information from external, publicly available sources, we make no guarantees
            that this pricing information will actually materialize into such value as is listed on
            the Website. YOU ARE RESPONSIBLE FOR CONFIRMING AN ACCEPTABLE PRICE FOR THE TRADING,
            BUYING, OR SELLING OF ANY CRYPTOCURRENCY.
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            Trading Cryptocurrency:
          </Heading>
          <Text mb={4}>
            One of the core functions of the Website is the trading of one type of cryptocurrency
            for another. The Website itself does not conduct trades, nor are we ever a counterparty
            to trades on the Website, but rather, the Website acts as an interface for you to
            connect to third-party decentralized exchanges ("DEXs") to complete a trade. We do not
            own or control any of the DEXs to which our Website integrates. Prior to completing a
            trade on the Website, we encourage you to research the DEX that will complete the trade.
          </Text>
          <Text>
            Once you initiate a trade, unless the trade errors out, there is no reversing the trade.
            Because of the immutable nature of the blockchain, and since we are not counterparty to
            any of your trades, YOU ACKNOWLEDGE THAT WE ARE UNABLE TO ISSUE REFUNDS FOR ANY TRADES
            CONDUCTED ON THE PLATFORM. Once your trade completes, you will be able to view it on the
            respective blockchain explorer by clicking the applicable link on the confirmation
            screen.
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            Quick Note on Miner Fees:
          </Heading>
          <Text>
            Most cryptocurrency transactions incur a miner fee, which is sometimes known as a gas
            fee or a network fee. This fee is paid to the miners who confirm the transaction on the
            blockchain. Miners are an instrumental component of the blockchain technology. We do not
            receive any portion of any miner fee incurred using our Website and pull estimated miner
            fees directly from the applicable blockchain. We do not have the ability to waive any
            miner fees.
          </Text>
        </Box>

        <Box>
          <Heading as='h3' size='md' mb={2}>
            LEGAL STUFF
          </Heading>
          <Heading as='h4' size='sm' mb={2}>
            Disclaimer of Warranties:
          </Heading>
          <Text>
            As we pointed out, the Website is being licensed to you for free, on an as-is basis, as
            a public good with a fully open-sourced codebase. In exchange for this, and because you
            can evaluate the Website's codebase yourself (find it
            <Link color='blue.400' href='#' ml={1}>
              here
            </Link>
            ,
            <Link color='blue.400' href='#' ml={1}>
              here
            </Link>
            , and
            <Link color='blue.400' href='#' ml={1}>
              here
            </Link>
            ): YOU ACKNOWLEDGE THAT YOUR USE OF THE PLATFORM IS ON AN "AS IS" AND "AS AVAILABLE"
            BASIS, AND THAT WE MAKE NO GUARANTEES REGARDING THE PLATFORM. WE HEREBY EXPRESSLY
            DISCLAIM ALL IMPLIED AND STATUTORY WARRANTIES OF THE PLATFORM. YOU USE THE PLATFORM AT
            YOUR OWN RISK.
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            Limitation of Liability:
          </Heading>
          <Text>
            We will not be liable to you for any damages, regardless of the kind of damages, arising
            due to your use of the Website. In no event will: we, any one of our members, any
            contractor of ours, or any employee of ours, be liable to you for damages arising due to
            your use of the Website in an amount exceeding the greater of: (1) US$100; or (2) the
            amount you actually paid to us in connection with the Website. Because we make the
            Website available without consideration and fully open-sourced, this section is a
            material term of these terms.
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            Indemnification:
          </Heading>
          <Text>
            You acknowledge and agree that you will fully reimburse: us, any one of members, any
            contractor of ours, or any employee of ours, for any damages sought by any person
            related to your use of the Website.
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            Taxes:
          </Heading>
          <Text>
            Sometimes cryptocurrency transactions incur tax liability. While we will provide certain
            transaction information associated with any wallet you connect to the Website, you
            should only rely on the information you can actually verify on the public blockchain and
            conduct your own independent cost or valuation analyses, ideally with your licensed tax
            professional. It is your sole responsibility to determine whether, and to what extent,
            any taxes apply to any transaction you conduct on the Website. We will not withhold,
            collect, report, or remit any amount due to appropriate tax authorities on your behalf;
            as we said, the Website is noncustodial, so even if we wanted to do this for you, we
            couldn't. You acknowledge that we will have no liability for any taxes associated with
            any of your transactions completed on the Website and that we are encouraging you to
            consult with your own independent tax advisors to assess whether you have any tax
            liability in your respective jurisdiction(s).
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            User feedback:
          </Heading>
          <Text>
            If you submit any feedback or suggestions to us, be it through the link on the Website,
            our discord server, or otherwise, you are doing so gratuitously to us, and we may use
            such information as we see fit without any promise of compensation to you. Essentially,
            if you submit feedback or a suggestion to us, regardless of the means of submission, we
            own such information outright.
          </Text>
        </Box>

        <Box>
          <Heading as='h4' size='sm' mb={2}>
            How to contact us:
          </Heading>
          <Text>
            The best way to get in touch with us regarding the Website is through our discord
            server, which you can join
            <Link color='blue.400' href='https://discord.gg/shapeshift' isExternal ml={1}>
              here
            </Link>
            . There are a whole host of channels with specific uses, but the "support-for-users"
            channel might be your best first stop. PLEASE WATCH OUT FOR SCAMS! IF YOU JOIN OUR
            DISCORD SERVER, WE WILL NOT DM YOU DIRECTLY. YOU CAN REPORT SCAMS TO THE "SPAM" CHANNEL
            ON THE SERVER.
          </Text>
        </Box>
      </VStack>
    </Container>
  )
}
