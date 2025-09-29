'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchForm from './SearchForm'
import LogoutButton from './LogoutButton'
import Image from 'next/image'

export default function Header() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase.from('User').select('role').eq('id', user.id).single()
        if (profile && profile.role === 'Admin') {
          setIsAdmin(true)
        }
      }
    }
    fetchUser()
  }, [router])

  return (
    <header className="bg-white text-slate-800 shadow-sm sticky top-0 z-10 border-b border-slate-200">
      <div className="container mx-auto px-4 py-3">
        <nav className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/tech-mentor.png"
              alt="Tech Mentor Logo"
              width={150}
              height={40}
              priority
              className="h-auto"
            />
          </Link>
          <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            {user ? (
              <>
                {isAdmin && (
                  <Link href="/admin/categories" className="text-sm font-semibold text-teal-600 hover:text-teal-700">
                    カテゴリ管理
                  </Link>
                )}
                <Link href={`/users/${user.id}`} className="text-sm text-slate-600 hover:text-slate-900">
                  マイページ
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100 transition-colors">
                  ログイン
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors">
                  アカウント作成
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}