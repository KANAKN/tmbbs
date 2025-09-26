'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// ログアウトボタンのコンポーネント
export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  // ログアウト処理
  const handleLogout = async () => {
    await supabase.auth.signOut()
    // ページを完全にリロードしてログアウト状態を反映
    window.location.href = '/'
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm text-white bg-red-400 rounded-md hover:bg-red-500 transition-colors"
    >
      ログアウト
    </button>
  )
}
