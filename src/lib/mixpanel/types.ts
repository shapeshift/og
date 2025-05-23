import type Mixpanel from 'mixpanel-browser'

export type MixPanelType = typeof Mixpanel

export enum MixPanelEvent {
  PairSelected = 'Pair Selected',
  StartTransaction = 'Start Transaction',
  SwapCompleted = 'Swap Completed',
  DoAnotherSwap = 'Do Another Swap',
  LaunchShapeshiftApp = 'Launch Shapeshift App',
}
