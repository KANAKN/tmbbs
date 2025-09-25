// /Users/KN/code/tmbbs/src/app/categories/[id]/page.tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'

type PageProps = {
  params: {
    id: string
  }
}

export default async function CategoryPage({ params }: PageProps) {
  const supabase = createClient()

  // 1. カテゴリ情報を取得
  const { data: category } = await supabase
    .from('Category')
    .select('name')
    .eq('id', params.id)
    .single()

  if (!category) {
    notFound()
  }

  // 2. そのカテゴリに属する質問の一覧を取得
  const { data: questions } = await supabase
    .from('Question')
    .select('id, title, created_at, User(id, username)') // UserテーブルをJOIN
    .eq('category_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-6">
        <span className="text-sm text-gray-500">カテゴリ</span>
        <h1 className="text-3xl font-bold text-blue-600">{category.name}</h1>
      </div>

      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <div key={question.id} className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
              <Link href={`/questions/${question.id}`}>
                <h2 className="text-xl font-semibold text-blue-600 hover:underline">{question.title}</h2>
              </Link>
              <div className="flex items-center flex-wrap text-sm text-gray-500 mt-2 gap-x-3">
                <span>投稿者:</span>
                <Link href={`/users/${question.User?.id}`} className="text-blue-600 hover:underline">
                  {question.User?.username || '匿名'}
                </Link>
                <span>|</span>
                <span>
                  投稿日時: {format(new Date(question.created_at), 'yyyy年MM月dd日 HH:mm')}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">このカテゴリの質問はまだありません。</p>
          </div>
        )}
      </div>
    </div>
  )
}
