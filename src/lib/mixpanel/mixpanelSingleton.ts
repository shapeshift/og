import Mixpanel from 'mixpanel-browser'

import type { MixPanelType } from './types'

// we need to be able to access this outside react
export const mixpanel = (() => {
  let _mixPanel: MixPanelType | undefined = undefined

  const mixPanelEnabled = import.meta.env.VITE_FEATURE_MIXPANEL
  if (!mixPanelEnabled) return undefined
  if (_mixPanel) return _mixPanel
  const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN
  Mixpanel.init(mixpanelToken)
  _mixPanel = Mixpanel // identify once per session
  _mixPanel.set_config({ persistence: 'localStorage' })
  _mixPanel.identify()

  return _mixPanel
})()
