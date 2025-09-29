import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { format } from 'date-fns'
import SearchForm from '@/components/SearchForm'
import { cookies } from 'next/headers'
import Pagination from '@/components/Pagination' // Paginationコンポーネントをインポート

export const revalidate = 0

type Question = {
  id: string;
  title: string;
  created_at: string;
  User: { id: string; username: string | null } | null;
  Category: { id: string; name: string } | null;
  Tag: { name: string }[];
  vote_count?: number; // いいねの数を追加
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: { sort?: string; page?: string }
}) {
  const { sort = 'newest' } = searchParams
  const page = parseInt(searchParams.page || '1', 10)
  const pageSize = 10
  const offset = (page - 1) * pageSize

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from('Category')
    .select('id, name')
    .order('name', { ascending: true })

  const { data: topTags } = await supabase.rpc('get_top_tags')

  let questions: Question[] | null = []
  let error = null
  let totalQuestions = 0

  // --- 総件数を取得 ---
  if (sort === 'popular') {
    const countQuery = supabase.from('Question').select('*', { count: 'exact', head: true }).is('deleted_at', null).or('is_draft.is.null,is_draft.eq.false')
    const { count } = await countQuery
    totalQuestions = count || 0
  } else {
    const countQuery = supabase.from('Question').select('*', { count: 'exact', head: true }).is('deleted_at', null).or('is_draft.is.null,is_draft.eq.false')
    if (sort === 'resolved') {
      countQuery.not('best_answer_id', 'is', null)
    }
    const { count } = await countQuery
    totalQuestions = count || 0
  }

  // --- 表示するデータを取得 ---
  if (sort === 'popular') {
    // 全ての質問を取得してからいいね数でソート
    const { data: allQuestions, error: queryError } = await supabase
      .from('Question')
      .select(`
        id, 
        title, 
        created_at, 
        User(id, username), 
        Category(id, name), 
        Tag(name)
      `)
      .is('deleted_at', null)
      .or('is_draft.is.null,is_draft.eq.false')
      .order('created_at', { ascending: false })
    
    if (queryError) {
      error = queryError
    } else if (allQuestions) {
      // 各質問のいいね数を取得
      const questionsWithVotes = await Promise.all(
        allQuestions.map(async (question) => {
          // この質問の回答IDを取得
          const { data: answers } = await supabase
            .from('Answer')
            .select('id')
            .eq('question_id', question.id)
            .is('deleted_at', null)
          
          const answerIds = answers?.map(a => a.id) || []
          
          // いいね数を取得
          let voteCount = 0
          if (answerIds.length > 0) {
            const { count } = await supabase
              .from('Vote')
              .select('*', { count: 'exact', head: true })
              .in('answer_id', answerIds)
            voteCount = count || 0
          }
          
          return {
            ...question,
            vote_count: voteCount
          }
        })
      )
      
      // いいね数でソート（降順）
      questions = questionsWithVotes
        .sort((a, b) => b.vote_count - a.vote_count)
        .slice(offset, offset + pageSize)
    }
  }
 else {
    let query = supabase
      .from('Question')
      .select('id, title, created_at, User(id, username), Category(id, name), Tag(name)') // Tag(name) を追加
      .is('deleted_at', null) // 論理削除された質問を除外
      .or('is_draft.is.null,is_draft.eq.false') // 下書きを除外（nullまたはfalse）
    if (sort === 'resolved') {
      query = query.not('best_answer_id', 'is', null)
    }
    query = query.order('created_at', { ascending: false }).range(offset, offset + pageSize - 1)
    const { data: fetchedQuestions, error: queryError } = await query.returns<Question[]>()
    questions = fetchedQuestions
    error = queryError
  }

  const totalPages = Math.ceil(totalQuestions / pageSize)
  const currentPage = page

  const activeClass = 'bg-teal-600 text-white'
  const inactiveClass = 'bg-white text-teal-700 hover:bg-teal-50'

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8 p-6 bg-white rounded-lg border border-slate-200">
        <div className="max-w-xl mx-auto">
          <SearchForm categories={categories || []} topTags={topTags || []} />
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
          questions.map((question, index) => {
            const isOwnQuestion = user && question.User?.id === user.id;
            return (
              <div
                key={question.id}
                className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-slate-200 transition-shadow hover:shadow-md"
              >
                {sort === 'popular' && (
                  <div className="flex-shrink-0 w-10 text-center">
                    <span className="text-2xl font-bold text-slate-400">{index + 1 + offset}</span>
                  </div>
                )}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <Link href={`/questions/${question.id}`}>
                      <h2 className="text-xl font-semibold text-slate-800 hover:text-teal-600">{question.title}</h2>
                    </Link>
                    {sort === 'popular' && question.vote_count !== undefined && (
                      <div className="flex items-center text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-full">
                        <span className="mr-1">👍</span>
                        <span>{question.vote_count}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center flex-wrap text-sm text-slate-500 mt-2 gap-x-3 gap-y-2">
                    <span>投稿者:</span>
                    <Link 
                      href={`/users/${question.User?.id}`} 
                      className={isOwnQuestion ? "text-red-500 hover:underline" : "text-teal-600 hover:underline"}
                    >
                      {question.User?.username || '匿名'}
                    </Link>
                    <span>|</span>
                    <span>
                      投稿日時: {format(new Date(question.created_at), 'yyyy年MM月dd日 HH:mm')}
                    </span>
                    <span>|</span>
                    <span>カテゴリ:</span>
                    {question.Category ? (
                      <Link href={`/categories/${question.Category.id}`} className="font-semibold text-teal-800 bg-teal-100 px-2 py-1 rounded-md hover:bg-teal-200 text-xs">
                        {question.Category.name}
                      </Link>
                    ) : (
                      <span className="text-xs">未分類</span>
                    )}
                    
                    {question.Tag && question.Tag.length > 0 && (
                      <>
                        <span>|</span>
                        <div className="flex items-center gap-2">
                          <span>タグ:</span>
                          {question.Tag.map(tag => (
                            <Link href={`/search?tag=${encodeURIComponent(tag.name)}`} key={tag.name} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full hover:bg-gray-300">
                              {tag.name}
                            </Link>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-10 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">まだ質問がありません。</p>
          </div>
        )}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}
