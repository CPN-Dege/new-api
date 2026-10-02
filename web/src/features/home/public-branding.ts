/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
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
  name: 'GPT 5.6 Sol' | 'GPT 6.1 Sol' | 'GPT 6 Luna' | 'GPT 6 Astra'
  status: 'Live'
  modelId: 'gpt-5.6-sol' | 'gpt-6.1-sol' | 'gpt-6-luna' | 'gpt-astra-6'
}

export const FOCUSED_MODELS: readonly FocusedModel[] = [
  { name: 'GPT 5.6 Sol', status: 'Live', modelId: 'gpt-5.6-sol' },
  { name: 'GPT 6.1 Sol', status: 'Live', modelId: 'gpt-6.1-sol' },
  { name: 'GPT 6 Luna', status: 'Live', modelId: 'gpt-6-luna' },
  { name: 'GPT 6 Astra', status: 'Live', modelId: 'gpt-astra-6' },
] as const

export const FOCUSED_STATS = [
  { value: FOCUSED_MODELS.length, label: 'live AI models' },
  { value: 1, label: 'unified API access' },
  { value: 1, label: 'usage dashboard' },
] as const

export const HERO_COPY = {
  heading: 'One API for',
  modelLine: 'GPT Sol, Luna & Astra',
  availabilityLine: 'Four models. All live.',
  description:
    'Access four live models through Halsamer API with transparent pricing, clear usage tracking, and familiar OpenAI-compatible workflows.',
} as const

export const CORE_FEATURES_COPY = {
  eyebrow: 'Focused AI Access',
  heading: 'Four live models,',
  subheading: 'one API for your workflows',
} as const
