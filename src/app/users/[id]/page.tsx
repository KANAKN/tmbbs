// /Users/KN/code/tmbbs/src/app/users/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'

type PageProps = {
  params: {
    id: string
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const supabase = createClient(cookies)

  // 1. ユーザーの基本プロフィール情報を取得
  const { data: userProfile } = await supabase
    .from('User')
    .select('id, username, avatar_url, created_at')
    .eq('id', params.id)
    .single()

  if (!userProfile) {
    notFound()
  }

  // 2. ユーザーが投稿した質問を取得
  const { data: questions } = await supabase
    .from('Question')
    .select('id, title, created_at')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10) // 最新10件まで

  // 3. ユーザーが投稿した回答を取得 (回答した質問のタイトルもJOIN)
  const { data: answers } = await supabase
    .from('Answer')
    .select('id, content, created_at, Question(id, title)')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 4. ユーザーがいいねした回答を取得 (いいねした回答の質問タイトルもJOIN)
  const { data: likedAnswers } = await supabase
    .from('Vote')
    .select('Answer(id, content, created_at, Question(id, title))')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {/* プロフィールヘッダー */}
      <div className="flex items-center space-x-6 bg-white p-6 rounded-lg border border-slate-200 mb-8">
        <Image
          src={userProfile.avatar_url || '/default-avatar.png'}
          alt={userProfile.username || 'avatar'}
          width={100}
          height={100}
          className="rounded-full bg-slate-200 object-cover"
        />
        <div>
          <h1 className="text-3xl font-bold">{userProfile.username}</h1>
          <p className="text-sm text-slate-500">
            登録日: {format(new Date(userProfile.created_at), 'yyyy年MM月dd日')}
          </p>
        </div>
      </div>

      {/* アクティビティタブ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 投稿した質問 */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">投稿した質問 ({questions?.length || 0})</h2>
          <div className="space-y-4">
            {questions?.map(q => (
              <Link href={`/questions/${q.id}`} key={q.id} className="block p-3 bg-white rounded-md border hover:shadow-md">
                <p className="font-semibold hover:text-teal-600">{q.title}</p>
                <p className="text-xs text-slate-500 mt-1">{format(new Date(q.created_at), 'yyyy/MM/dd')}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* 投稿した回答 */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">投稿した回答 ({answers?.length || 0})</h2>
          <div className="space-y-4">
            {answers?.map(a => (
              <Link href={`/questions/${a.Question?.id}#answer-${a.id}`} key={a.id} className="block p-3 bg-white rounded-md border hover:shadow-md">
                <p className="text-sm truncate">{a.content}</p>
                <p className="text-xs text-slate-500 mt-1">to: {a.Question?.title}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* いいねした回答 */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-bold mb-4">いいねした回答 ({likedAnswers?.length || 0})</h2>
          <div className="space-y-4">
            {likedAnswers?.map(la => la.Answer && (
              <Link href={`/questions/${la.Answer.Question?.id}#answer-${la.Answer.id}`} key={la.Answer.id} className="block p-3 bg-white rounded-md border hover:shadow-md">
                <p className="text-sm truncate">{la.Answer.content}</p>
                <p className="text-xs text-slate-500 mt-1">to: {la.Answer.Question?.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}