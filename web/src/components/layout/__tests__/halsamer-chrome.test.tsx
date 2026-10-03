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
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useTopNavLinks } from '@/hooks/use-top-nav-links'

import { AppHeader } from '../components/app-header'
import { Footer } from '../components/footer'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@tanstack/react-router', () => ({
  Link: (props: { children: React.ReactNode; to: string }) => (
    <a href={props.to}>{props.children}</a>
  ),
}))
vi.mock('@/hooks/use-status', () => ({
  useStatus: () => ({
    status: {
      system_name: 'Halsamer API',
      version: 'PRIVATE_VERSION',
      HeaderNavModules: { docs: true, about: true },
    },
  }),
}))
vi.mock('@/hooks/use-system-config', () => ({
  useSystemConfig: () => ({
    systemName: 'Halsamer API',
    logo: '/logo.png',
    footerHtml: '',
    demoSiteEnabled: false,
  }),
}))
vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({ auth: { user: { id: 1 } } }),
}))
vi.mock('@/hooks/use-notifications', () => ({ useNotifications: () => ({}) }))
vi.mock('../components/header', () => ({
  Header: (props: { children: React.ReactNode }) => (
    <header>{props.children}</header>
  ),
}))

vi.mock('../components/top-nav', () => ({
  TopNav: (props: { links: { title: string; href: string }[] }) => (
    <nav>
      {props.links.map((x) => (
        <a key={x.href} href={x.href}>
          {x.title}
        </a>
      ))}
    </nav>
  ),
}))
vi.mock('@/features/system-update/system-update-action', () => ({
  SystemUpdateAction: () => (
    <button type='button'>System updates PRIVATE_VERSION</button>
  ),
}))
vi.mock('@/components/language-switcher', () => ({
  LanguageSwitcher: () => null,
}))
vi.mock('@/components/config-drawer', () => ({ ConfigDrawer: () => null }))
vi.mock('@/components/search', () => ({ Search: () => null }))
vi.mock('@/components/profile-dropdown', () => ({
  ProfileDropdown: () => null,
}))
vi.mock('@/components/notification-popover', () => ({
  NotificationPopover: () => null,
}))

describe('Halsamer dashboard chrome', () => {
  it('hides Docs, About, version and update entry in the authenticated header', () => {
    render(<AppHeader />)
    expect(screen.queryByText('Docs')).toBeNull()
    expect(screen.queryByText('About')).toBeNull()
    expect(screen.queryByText(/System updates|PRIVATE_VERSION/)).toBeNull()
    expect(screen.getByText('Halsamer API')).toBeVisible()
  })
  it('omits hidden links even when backend navigation enables them', () => {
    function Links() {
      return (
        <>
          {useTopNavLinks().map((x) => (
            <a key={x.href} href={x.href}>
              {x.title}
            </a>
          ))}
        </>
      )
    }
    render(<Links />)
    expect(screen.queryByText('Docs')).toBeNull()
    expect(screen.queryByText('About')).toBeNull()
    expect(screen.getByText('Model Square')).toBeVisible()
  })
  it('renders a single Halsamer copyright line without an upstream footer link', () => {
    const { container } = render(<Footer />)
    expect(
      container.querySelector(
        'a[href="https://github.com/QuantumNous/new-api"]'
      )
    ).toBeNull()
    expect(container.textContent).toContain(
      'Halsamer API. All rights reserved. Designed and developed by the project contributors.'
    )
  })
})
