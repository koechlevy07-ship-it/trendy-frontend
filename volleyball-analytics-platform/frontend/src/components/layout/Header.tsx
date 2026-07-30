import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Menu, X, LogOut, User, Settings, BarChart3, Users, Trophy, TrophyIcon, Settings as SettingsIcon, Menu as MenuIcon, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useState } from 'react'

export function Header() {
  const { user, logout } = useAuthStore()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: 'BarChart3' },
    { name: 'Matches', href: '/matches', icon: 'Trophy' },
    { name: 'Teams', href: '/teams', icon: 'Users' },
    { name: 'Players', href: '/players', icon: 'Users' },
    { name: 'Analytics', href: '/analytics', icon: 'BarChart3' },
    { name: 'Reports', href: '/reports', icon: 'FileText' },
    { name: 'Settings', href: '/settings', icon: 'Settings' },
  ]

  const isActive = (path: string) => {
    if (location.pathname === '/') return path === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <div className="flex items-center lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>

        {/* Logo */}
        <div className="flex items-center flex-shrink-0 lg:ml-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.895L14 14M5 18h14v2H5v-2z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">VolleyAI</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-4 lg:ml-8 flex-1 justify-center">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.381C7.673 7.304 6 9.312 6 11.5a2.002 2.002 0 00.586 1.422l1.405 1.405A2 2 0 005 15.68V17h14v1.5a1 1 0 01-1 1h-14a1 1 0 01-1-1v-1.5H3" />
            </svg>
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full" />
                ) : (
                  <span className="text-primary-700 font-medium text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.full_name || 'User'}
              </span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium',
                  isActive(item.href)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {item.name}
              </Link>
            ))}
            <hr className="my-4" />
            <button
              onClick={logout}
              className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md"
            >
              Log out
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header