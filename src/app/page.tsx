import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { format } from 'date-fns'
import SearchForm from '@/components/SearchForm'

export const revalidate = 0

type Question = {
  id: string;
  title: string;
  created_at: string;
  User: { id: string; username: string | null } | null;
  Category: { id: string; name: string } | null;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const { sort = 'newest' } = await searchParams
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('Category')
    .select('id, name')
    .order('name', { ascending: true })

  let questions: Question[] | null = []
  let error = null

  if (sort === 'popular') {
    const { data: popularIdsData, error: rpcError } = await supabase.rpc(
      'get_questions_sorted_by_votes'
    )
    if (rpcError || !popularIdsData) {
      error = rpcError
    } else {
      const popularIds = popularIdsData.map((q: {id: string}) => q.id)
      if (popularIds.length > 0) {
        const { data: popularQuestions, error: queryError } = await supabase
          .from('Question')
          .select('id, title, created_at, User(id, username), Category(id, name)')
          .in('id', popularIds)
        if (queryError) {
          error = queryError
        } else {
          questions = popularIds.map((id: string) => popularQuestions.find((q: { id: string }) => q.id === id)).filter((q: Question | undefined): q is Question => !!q)
        }
      }
    }
  } else {
    let query = supabase
      .from('Question')
      .select('id, title, created_at, User(id, username), Category(id, name)')
    if (sort === 'resolved') {
      query = query.not('best_answer_id', 'is', null)
    }
    query = query.order('created_at', { ascending: false })
    const { data: fetchedQuestions, error: queryError } = await query.returns<Question[]>()
    questions = fetchedQuestions
    error = queryError
  }

  const activeClass = 'bg-teal-600 text-white'
  const inactiveClass = 'bg-white text-teal-700 hover:bg-teal-50'

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 p-6 bg-white rounded-lg border border-slate-200">
        <div className="max-w-xl mx-auto">
          <div className="mb-4">
            <SearchForm />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2 text-center">または、カテゴリから探す</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {categories && categories.map((category: { id: string; name: string }) => (
                <Link
                  href={`/categories/${category.id}`}
                  key={category.id}
                  className="px-3 py-1 text-sm font-medium text-teal-800 bg-teal-100 rounded-full hover:bg-teal-200"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">質問リスト</h1>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/?sort=newest" className={`px-4 py-2 rounded-lg text-sm font-medium ${sort === 'newest' ? activeClass : inactiveClass}`}>
              新着順
            </Link>
            <Link href="/?sort=popular" className={`px-4 py-2 rounded-lg text-sm font-medium ${sort === 'popular' ? activeClass : inactiveClass}`}>
              人気順
            </Link>
            <Link href="/?sort=resolved" className={`px-4 py-2 rounded-lg text-sm font-medium ${sort === 'resolved' ? activeClass : inactiveClass}`}>
              解決済み
            </Link>
          </div>
          <Link
            href="/questions/new"
            className="px-6 py-3 font-bold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 shadow-md"
          >
            質問を投稿する
          </Link>
        </div>
      </div>
      <div className="space-y-4">
        {questions && questions.length > 0 ? (
          questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-slate-200 transition-shadow hover:shadow-md"
            >
              {sort === 'popular' && (
                <div className="flex-shrink-0 w-10 text-center">
                  <span className="text-2xl font-bold text-slate-400">{index + 1}</span>
                </div>
              )}
              <div className="flex-grow">
                <Link href={`/questions/${question.id}`}>
                  <h2 className="text-xl font-semibold text-slate-800 hover:text-teal-600">{question.title}</h2>
                </Link>
                <div className="flex items-center flex-wrap text-sm text-slate-500 mt-2 gap-x-3">
                  <span>カテゴリ:</span>
                  {question.Category ? (
                    <Link href={`/categories/${question.Category.id}`} className="font-semibold text-teal-800 bg-teal-100 px-2 py-1 rounded-md hover:bg-teal-200 text-xs">
                      {question.Category.name}
                    </Link>
                  ) : (
                    <span className="text-xs">未分類</span>
                  )}
                  <span>|</span>
                  <span>投稿者:</span>
                  <Link href={`/users/${question.User?.id}`} className="text-teal-600 hover:underline">
                    {question.User?.username || '匿名'}
                  </Link>
                  <span>|</span>
                  <span>
                    投稿日時: {format(new Date(question.created_at), 'yyyy年MM月dd日 HH:mm')}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">まだ質問がありません。</p>
          </div>
        )}
      </div>
    </div>
  )
}