import Mixpanel from 'mixpanel-browser'

export type MixPanelType = typeof Mixpanel

// don't export me, access me through the getter
let _mixPanel: typeof Mixpanel | undefined = undefined

// we need to be able to access this outside react
export const getMixPanel = (): MixPanelType | undefined => {
  const mixPanelEnabled = import.meta.env.VITE_MIXPANEL_ENABLED
  if (!mixPanelEnabled) return
  if (_mixPanel) return _mixPanel
  const mixpanelToken = import.meta.env.VITE_MIXPANEL_TOKEN
  Mixpanel.init(mixpanelToken)
  _mixPanel = Mixpanel // identify once per session
  _mixPanel.identify()
  return _mixPanel
}
