// /Users/KN/code/tmbbs/src/app/profile/edit/page.tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import EditProfileForm, { ChangePasswordForm } from './_components/EditProfileForm' // 1つのファイルから両方をインポート

export default async function EditProfilePage() {
  const supabase = createClient()

  // ログインユーザーのセッションを取得
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未ログインの場合はログインページにリダイレクト
  if (!user) {
    return redirect('/login')
  }

  // ユーザーのプロフィール情報を取得
  const { data: profile } = await supabase
    .from('User')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single()

  // プロフィールが存在しない場合 (基本的には起こらないはず)
  if (!profile) {
    // ここで何らかのエラーハンドリングを行うか、
    // 空のプロフィールでフォームを表示するかを選択できます。
    // 今回は空のプロフィールで進めます。
    const emptyProfile = { username: '', avatar_url: '' }
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <EditProfileForm user={user} profile={emptyProfile} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <EditProfileForm user={user} profile={profile} />
      <ChangePasswordForm /> {/* ここに追加 */}
    </div>
  )
}
