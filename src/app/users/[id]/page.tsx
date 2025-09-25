import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: user } = await supabase
    .from('User')
    .select('username, created_at')
    .eq('id', id)
    .single()

  if (!user) {
    notFound()
  }

  const { data: questions } = await supabase
    .from('Question')
    .select('id, title, created_at')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{user.username}</h1>
        <p className="text-sm text-gray-500">
          登録日: {format(new Date(user.created_at), 'yyyy年MM月dd日')}
        </p>
      </div>

      <h2 className="text-2xl font-semibold mb-4">投稿した質問</h2>
      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <Link
              href={`/questions/${question.id}`}
              key={question.id}
              className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h3 className="text-xl font-semibold text-blue-600">{question.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                投稿日時: {format(new Date(question.created_at), 'yyyy年MM月dd日 HH:mm')}
              </p>
            </Link>
          ))
        ) : (
          <p className="text-gray-500">このユーザーはまだ質問を投稿していません。</p>
        )}
      </div>
    </div>
  )
}
