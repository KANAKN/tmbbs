import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import { cookies } from 'next/headers'

export const revalidate = 0

type Question = {
  id: string
  title: string
  created_at: string
}

// 検索結果ページ (サーバーコンポーネント)
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: query } = await searchParams
  const supabase = await createClient()
  let questions: Question[] | null = []
  let error = null

  if (query) {
    // 検索クエリをスペースで単語に分割し、空の要素をフィルタリング
    const searchTerms = query.split(/\s+/).filter(term => term);
    // 各単語がtitleまたはdescriptionに含まれる条件を生成 (OR検索)
    const orConditions = searchTerms.map(term => `title.ilike.%${term}%,description.ilike.%${term}%`).join(',');

    // 部分一致検索を実行
    const { data, error: searchError } = await supabase
      .from('Question')
      .select('id, title, created_at')
      .or(orConditions) // 生成したOR条件で検索
      .order('created_at', { ascending: false });
    
    questions = data
    error = searchError
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">
        検索結果: <span className="text-blue-600">{query}</span>
      </h1>

      {error && <p className="text-red-500">検索中にエラーが発生しました。</p>}

      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((question) => (
            <Link
              href={`/questions/${question.id}`}
              key={question.id}
              className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-blue-600">{question.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                投稿日時: {format(new Date(question.created_at), 'yyyy年MM月dd日 HH:mm')}
              </p>
            </Link>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">
              {query ? '検索結果が見つかりませんでした。' : '検索キーワードを入力してください。'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}