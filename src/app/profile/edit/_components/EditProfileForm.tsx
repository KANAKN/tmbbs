// /Users/KN/code/tmbbs/src/app/profile/edit/_components/EditProfileForm.tsx
'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

type Profile = {
  username: string | null
  avatar_url: string | null
}

export default function EditProfileForm({ user, profile }: { user: User; profile: Profile }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState(profile.username)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  // プロフィール更新処理
  const handleUpdateProfile = async () => {
    setLoading(true)
    let publicUrl = avatarUrl

    // 1. アバター画像が選択されていれば、Storageにアップロード
    if (avatarFile) {
      const filePath = `${user.id}/${Date.now()}`
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile)

      if (uploadError) {
        alert('画像のアップロードに失敗しました。')
        console.error(uploadError)
        setLoading(false)
        return
      }
      
      // 公開URLを取得
      const { data: { publicUrl: newPublicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(data.path)
      
      publicUrl = newPublicUrl
    }

    // 2. Userテーブルの情報を更新
    const { error: updateError } = await supabase
      .from('User')
      .update({
        username: username,
        avatar_url: publicUrl,
      })
      .eq('id', user.id)

    if (updateError) {
      alert('プロフィールの更新に失敗しました。')
      console.error(updateError)
    } else {
      alert('プロフィールを更新しました。')
      // ページをリフレッシュしてヘッダーなどの表示を更新
      router.refresh()
    }
    setLoading(false)
  }

  // ファイル選択時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0])
      // プレビュー用にURLを生成
      setAvatarUrl(URL.createObjectURL(e.target.files[0]))
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>
      <div className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <input
            id="email"
            type="text"
            value={user.email}
            disabled
            className="mt-1 block w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            value={username || ''}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            プロフィール画像
          </label>
          <div className="mt-2 flex items-center space-x-4">
            <img
              src={avatarUrl || '/default-avatar.png'} // デフォルト画像を用意する必要あり
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover bg-slate-200"
              onError={(e) => { e.currentTarget.src = '/default-avatar.png' }}
            />
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50"
            >
              画像を変更
              <input id="avatar-upload" name="avatar-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </label>
          </div>
        </div>
        <div>
          <button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
          >
            {loading ? '更新中...' : '更新する'}
          </button>
        </div>
      </div>
    </div>
  )
}

// パスワード変更フォームを別のコンポーネントとして定義
export function ChangePasswordForm() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (newPassword !== confirmPassword) {
      setError('新しいパスワードが一致しません。')
      return
    }
    if (newPassword.length < 6) {
      setError('新しいパスワードは6文字以上で入力してください。')
      return
    }

    setLoading(true)

    // まず非同期で現在のユーザー情報を取得
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    if (!currentUser) {
      setError('ユーザー情報が取得できませんでした。')
      setLoading(false)
      return
    }

    // Supabaseのパスワード更新機能は、まず現在のパスワードで再認証が必要
    const { data: { user }, error: reauthError } = await supabase.auth.signInWithPassword({
      email: currentUser.email || '',
      password: currentPassword,
    })

    if (reauthError || !user) {
      setError('現在のパスワードが正しくありません。')
      setLoading(false)
      return
    }

    // 再認証が成功したら、新しいパスワードに更新
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      setError(`パスワードの更新に失敗しました: ${updateError.message}`)
    } else {
      setMessage('パスワードが正常に更新されました。')
      // フォームをクリア
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md mt-8">
      <h2 className="text-xl font-bold mb-6">パスワード変更</h2>
      <form onSubmit={handleChangePassword} className="space-y-4">
        <div>
          <label htmlFor="current-password" className="block text-sm font-medium text-slate-700">現在のパスワード</label>
          <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">新しいパスワード</label>
          <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
        </div>
        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700">新しいパスワード（確認用）</label>
          <input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <div>
          <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md disabled:bg-teal-400">
            {loading ? '更新中...' : 'パスワードを更新'}
          </button>
        </div>
      </form>
    </div>
  )
}
