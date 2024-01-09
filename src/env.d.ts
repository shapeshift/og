/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOO: string
  readonly VITE_FEATURE_MIXPANEL: boolean
  readonly VITE_MIXPANEL_TOKEN: string
  readonly VITE_CHATWOOT_URL: string
  readonly VITE_CHATWOOT_TOKEN: string
  readonly VITE_FEATURE_CHATWOOT: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
