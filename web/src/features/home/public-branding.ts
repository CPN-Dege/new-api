export type PublicNavItem = {
  title: 'Home' | 'Console' | 'Model Square' | 'Academy'
  href: string
  external?: true
}

export const PUBLIC_NAV_ITEMS: readonly PublicNavItem[] = [
  { title: 'Home', href: '/' },
  { title: 'Console', href: '/dashboard' },
  { title: 'Model Square', href: '/pricing' },
  {
    title: 'Academy',
    href: 'https://academy.halsamer.io',
    external: true,
  },
]

export type SupportedApplication = {
  name: 'Codex' | 'Claude Code'
  iconName: 'OpenAI' | 'Claude.Color'
  href: string
}

export const SUPPORTED_APPLICATIONS: readonly SupportedApplication[] = [
  { name: 'Codex', iconName: 'OpenAI', href: 'https://openai.com/codex' },
  {
    name: 'Claude Code',
    iconName: 'Claude.Color',
    href: 'https://www.anthropic.com/claude-code',
  },
]

export const SUPPORTED_APPLICATIONS_DESCRIPTION =
  'Supports one-click configuration and perfectly adapts to Halsamer API protocol configuration.'

export type FocusedModel = {
  name: 'GPT 5.6 Sol' | 'GPT 6 Sol' | 'GPT 6 Astra'
  status: 'Live' | 'Coming soon'
  modelId?: 'gpt-astra-6'
}

export const FOCUSED_MODELS: readonly FocusedModel[] = [
  { name: 'GPT 6 Astra', status: 'Live', modelId: 'gpt-astra-6' },
  { name: 'GPT 5.6 Sol', status: 'Coming soon' },
  { name: 'GPT 6 Sol', status: 'Coming soon' },
] as const

export const FOCUSED_STATS = [
  { value: 1, label: 'live AI model' },
  { value: 2, label: 'models coming soon' },
  { value: 1, label: 'unified API access' },
] as const

export const HERO_COPY = {
  heading: 'One API for',
  modelLine: 'GPT 6 Astra',
  comingSoonLine: 'GPT 5.6 Sol and GPT 6 Sol coming soon',
  description:
    'Use GPT 6 Astra today through Halsamer API with transparent pricing, clear usage tracking, and familiar OpenAI-compatible workflows.',
} as const

export const CORE_FEATURES_COPY = {
  eyebrow: 'Focused AI Access',
  heading: 'One live model today,',
  subheading: 'two more coming soon',
} as const
