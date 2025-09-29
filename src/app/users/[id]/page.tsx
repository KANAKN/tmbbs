import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import UserProfileTabs from '@/components/UserProfileTabs'
import Link from 'next/link' // この行を追加

// --- 型定義 ---
type Question = {
  id: string
  title: string
  created_at: string
  is_draft?: boolean
}

type Answer = {
  id: string
  content: string
  created_at: string
  Question: {
    id: string
    title: string | null
  } | null
}

type VotedAnswer = {
  Answer: Answer | null
}

/**
 * ユーザープロフィールページ
 */
export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // ログイン中のユーザー情報を取得
  const { data: { session } } = await supabase.auth.getSession()

  // ユーザーの基本情報、DB関数を使った活動履歴、下書きを並行して取得
  const [
    { data: userProfile, error: userError },
    { data: activityData, error: activityError },
    { data: drafts, error: draftsError }
  ] = await Promise.all([
    supabase.from('User').select('id, username, avatar_url').eq('id', id).single(),
    supabase.rpc('get_user_activity', { p_user_id: id }),
    supabase.from('Question').select('id, title, created_at, is_draft').eq('user_id', id).eq('is_draft', true).order('created_at', { ascending: false })
  ])

  if (userError || !userProfile) {
    notFound()
  }
  
  // 閲覧者がページの持ち主かどうかを判定
  const isOwner = session?.user?.id === userProfile.id

  // DB関数から返されたデータを展開
  const questions = activityData?.questions || []
  const answers = activityData?.answers || []
  const votedAnswers = activityData?.votedAnswers || []
  const draftQuestions = drafts || []

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {userProfile.avatar_url ? (
            <img
              src={userProfile.avatar_url}
              alt={userProfile.username || 'User avatar'}
              className="w-16 h-16 rounded-full mr-4 border-2 border-gray-200 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full mr-4 border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-gray-400">
                <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-800">
            {userProfile.username || 'Anonymous'}<span className="text-lg font-normal text-gray-500">さん</span>
          </h1>
        </div>
        {isOwner && (
          <Link href="/profile/edit" className="px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-md hover:bg-cyan-700">
            プロフィールを編集
          </Link>
        )}
      </div>

      {/* タブ表示コンポーネントに渡す情報を絞る */}
      <UserProfileTabs
        questions={questions}
        answers={answers}
        votedAnswers={votedAnswers}
        drafts={draftQuestions}
        isOwner={isOwner}
      />
    </div>
  )
}
