'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    // Supabaseのサインアップ機能を呼び出し
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      // エラーが発生した場合
      setMessage(`エラー: ${error.message}`)
    } else {
      // 成功した場合
      setMessage('確認メールを送信しました。受信箱をご確認ください。')
      // ここでログインページにリダイレクトすることも可能
      // router.push('/login')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="mb-4 text-2xl font-bold text-center">アカウント作成</h1>
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="email">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="email@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700" htmlFor="password">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            登録する
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}
      </div>
    </div>
  )
}
