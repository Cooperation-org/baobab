/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_NAV_SRC?: string
  readonly VITE_NAV_TAG?: string
  readonly VITE_THEME_CSS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
