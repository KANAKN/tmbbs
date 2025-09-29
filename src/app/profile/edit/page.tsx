'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import AvatarUploader from '@/components/AvatarUploader' // AvatarUploaderをインポート
import Link from 'next/link'

export default function ProfileEditPage() {
  const supabase = createClient()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile, error } = await supabase
        .from('User')
        .select('username, avatar_url')
        .eq('id', user.id)
        .single()

      if (error) {
        setError('プロフィールの読み込みに失敗しました。')
      } else if (profile) {
        setUsername(profile.username || '')
        setAvatarUrl(profile.avatar_url || '')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!user) {
      setError('ユーザー情報が見つかりません。')
      return
    }

    const { error: updateError } = await supabase
      .from('User')
      .update({
        username: username,
        avatar_url: avatarUrl,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('更新に失敗しました: ' + updateError.message)
    } else {
      setMessage('プロフィールを更新しました。')
    }
  }

  if (loading) {
    return <div className="container mx-auto p-8 text-center">読み込み中...</div>
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
      <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">メールアドレス</label>
            <input
              id="email"
              type="email"
              value={user?.email || ''}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
            />
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">ユーザー名</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          
          {/* AvatarUploaderコンポーネントに置き換え */}
          <AvatarUploader
            initialAvatarUrl={avatarUrl}
            onUpload={(newUrl) => setAvatarUrl(newUrl)}
          />

          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700"
            >
              プロフィールを更新
            </button>
          </div>
          {message && <p className="text-sm text-green-500">{message}</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </form>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold mb-4">セキュリティ</h2>
          <Link href="/profile/change-password">
            <span className="w-full block text-center px-4 py-2 font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
              パスワードを変更する
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}