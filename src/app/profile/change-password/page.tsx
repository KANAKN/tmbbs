'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません。')
      return
    }
    if (newPassword.length < 6) {
      setError('パスワードは6文字以上で入力してください。')
      return
    }

    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError('パスワードの更新に失敗しました: ' + updateError.message)
    } else {
      setMessage('パスワードを正常に更新しました。')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-md">
      <div className="mb-4">
        <Link href="/profile/edit" className="text-sm text-cyan-600 hover:underline">
          &larr; プロフィール編集に戻る
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-6">パスワードの変更</h1>
      <form onSubmit={handlePasswordChange} className="space-y-4 p-6 bg-white rounded-lg border border-gray-200">
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">新しいパスワード</label>
          <input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">新しいパスワード（確認用）</label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700"
            disabled={loading}
          >
            {loading ? '更新中...' : 'パスワードを更新'}
          </button>
        </div>
        {message && <p className="text-sm text-green-500">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </div>
  )
}
