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
    // ページをリフレッシュしてサーバーコンポーネントの状態を更新
    router.refresh()
  }

  return (
        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-red-400 rounded-md hover:bg-red-500 transition-colors"
          >
            ログアウト
          </button>
        </form>  )
}
