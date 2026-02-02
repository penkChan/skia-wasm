// 导航链接组件
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function LinkItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`px-4 py-2 font-medium rounded-md transition-colors ${isActive
        ? 'bg-blue-600 text-white'
        : 'text-gray-700 hover:bg-gray-100'
        }`}
    >
      {children}
    </Link>
  )
}