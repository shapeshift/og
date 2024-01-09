/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FOO: string
  readonly VITE_FEATURE_MIXPANEL: boolean
  readonly VITE_MIXPANEL_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
