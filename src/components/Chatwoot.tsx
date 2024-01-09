import { Button } from '@chakra-ui/react'
import { useCallback, useEffect } from 'react'
import { getFeatureFlag } from 'lib/utils'

export const ChatwootButton: React.FC = () => {
  const chatWootEnabled = getFeatureFlag('chatwoot')
  useEffect(() => {
    if (!chatWootEnabled) return // Add Chatwoot Settings
    ;(window as any).chatwootSettings = {
      hideMessageBubble: true,
      position: 'left', // This can be left or right
      locale: 'en', // Language to be set
      type: 'standard', // [standard, expanded_bubble]
    }

    // Paste the script from inbox settings except the <script> tag
    ;(function (d: Document) {
      const BASE_URL = import.meta.env.VITE_CHATWOOT_URL
      const g = d.createElement('script')
      const s = d.getElementsByTagName('script')[0]
      g.src = BASE_URL + '/packs/js/sdk.js'
      s.parentNode?.insertBefore(g, s)
      g.async = true
      g.onload = function () {
        ;(window as any).chatwootSDK.run({
          websiteToken: import.meta.env.VITE_CHATWOOT_TOKEN,
          baseUrl: BASE_URL,
        })
      }
    })(document)
  }, [chatWootEnabled])

  const handleChatWoot = useCallback(() => {
    // @ts-ignore
    if (window.$chatwoot) window.$chatwoot.toggle()
  }, [])

  return chatWootEnabled ? <Button onClick={handleChatWoot}>Get support</Button> : null
}
