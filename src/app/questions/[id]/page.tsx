import { createClient } from '@/utils/supabase/server'
import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import AnswerForm from '@/components/AnswerForm'
import QuestionDisplay from '@/components/QuestionDisplay'
import Link from 'next/link'

export const revalidate = 0 // この行を追加して動的レンダリングを強制

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const headerList = await headers()
  const referer = headerList.get('referer')
  let fromSearch = false
  let searchBackUrl = ''
  if (referer) {
    try {
      const refererUrl = new URL(referer)
      if (refererUrl.pathname === '/search') {
        fromSearch = true
        searchBackUrl = referer
      }
    } catch (error) {
      console.error('Invalid referer URL:', error)
    }
  }

  const { data: { session } } = await supabase.auth.getSession()

  // --- ステップ1: 質問と投稿者、カテゴリ、タグの基本情報を取得 ---
  const { data: question, error: questionError } = await supabase
    .from('Question')
    .select('*, User(id, username), Category(name), Tag(name)') // TagテーブルもJOIN
    .eq('id', id)
    .single()

  if (questionError || !question) {
    return notFound()
  }

  // --- ステップ2: ベストアンサーの情報を取得 (存在する場合のみ) ---
  let bestAnswer = null
  if (question.best_answer_id) {
    const { data: bestAnswerData } = await supabase
      .from('Answer')
      .select('*, User(id, username), Vote(count), user_votes:Vote(user_id)')
      .eq('id', question.best_answer_id)
      .eq('user_votes.user_id', session?.user?.id)
      .single()
    bestAnswer = bestAnswerData
  }
  // questionオブジェクトにbestAnswerを合体させる
  const finalQuestion = { ...question, bestAnswer }

  // --- ステップ3: ベストアンサー以外の回答リストを取得 ---
  let query = supabase
    .from('Answer')
    .select('*, User(id, username), Vote(count), user_votes:Vote(user_id)')
    .eq('question_id', id)
    .eq('user_votes.user_id', session?.user?.id)
  
  if (question.best_answer_id) {
    query = query.not('id', 'eq', question.best_answer_id)
  }
  
  const { data: answers } = await query.order('created_at', { ascending: true })

  const isQuestionOwner = session?.user?.id === question.user_id

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {fromSearch && (
        <Link href={searchBackUrl} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          &larr; 検索結果に戻る
        </Link>
      )}

      <QuestionDisplay
        initialQuestion={finalQuestion}
        initialAnswers={answers || []}
        session={session}
        isQuestionOwner={isQuestionOwner}
      />

      <AnswerForm
        questionId={id}
        userId={session?.user?.id}
        isQuestionOwner={isQuestionOwner}
      />
    </div>
  )
}
